import type { QuoteItem } from "../db/schema/quote-items.schema";
import type { IQuotesRepository } from "../repositories/quotes.repository";
import type { IQuoteItemsRepository } from "../repositories/quote-items.repository";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { QuotesRepository } from "../repositories/quotes.repository";
import { QuoteItemsRepository } from "../repositories/quote-items.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";
import {
  calculateLineSubtotal,
  calculateLineTax,
  calculateLineTotal,
  calculateTotals,
} from "../utils/money";

export interface IQuoteItemsService {
  list(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<QuoteItem[]>;
  add(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
    description: string;
    quantity: number;
    unitPriceHtCents: number;
    taxRateBasisPoints: number;
    position?: number;
  }): Promise<{ item: QuoteItem; totals: { subtotalHtCents: number; taxAmountCents: number; totalTtcCents: number } }>;
  update(input: {
    organizationId: string;
    quoteId: string;
    itemId: string;
    userId: string;
    data: Partial<Pick<QuoteItem, "description" | "quantity" | "unitPriceHtCents" | "taxRateBasisPoints" | "position">>;
  }): Promise<{ item: QuoteItem; totals: { subtotalHtCents: number; taxAmountCents: number; totalTtcCents: number } }>;
  delete(input: {
    organizationId: string;
    quoteId: string;
    itemId: string;
    userId: string;
  }): Promise<{ success: boolean; totals: { subtotalHtCents: number; taxAmountCents: number; totalTtcCents: number } }>;
  reorder(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
    items: { id: string; position: number }[];
  }): Promise<QuoteItem[]>;
}

export class QuoteItemsService implements IQuoteItemsService {
  constructor(
    private quotesRepo: IQuotesRepository = new QuotesRepository(),
    private itemsRepo: IQuoteItemsRepository = new QuoteItemsRepository(),
    private orgsRepo: IOrganizationsRepository = new OrganizationsRepository(),
    private membersRepo: IOrganizationMembersRepository = new OrganizationMembersRepository(),
  ) {}

  async list(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
  }): Promise<QuoteItem[]> {
    await this.requireAccess(input.organizationId, input.userId);
    await this.requireQuoteInOrg(input.quoteId, input.organizationId);

    return this.itemsRepo.findByQuoteId(input.quoteId);
  }

  async add(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
    description: string;
    quantity: number;
    unitPriceHtCents: number;
    taxRateBasisPoints: number;
    position?: number;
  }): Promise<{ item: QuoteItem; totals: { subtotalHtCents: number; taxAmountCents: number; totalTtcCents: number } }> {
    await this.requireAccess(input.organizationId, input.userId);
    const quote = await this.requireDraftQuote(input.quoteId, input.organizationId);

    const lineSubtotalHtCents = calculateLineSubtotal(input.quantity, input.unitPriceHtCents);
    const lineTaxAmountCents = calculateLineTax(lineSubtotalHtCents, input.taxRateBasisPoints);
    const lineTotalTtcCents = calculateLineTotal(lineSubtotalHtCents, lineTaxAmountCents);

    const item = await this.itemsRepo.create({
      organizationId: input.organizationId,
      quoteId: quote.id,
      description: input.description,
      quantity: input.quantity,
      unitPriceHtCents: input.unitPriceHtCents,
      taxRateBasisPoints: input.taxRateBasisPoints,
      lineSubtotalHtCents,
      lineTaxAmountCents,
      lineTotalTtcCents,
      position: input.position ?? 0,
    });

    const totals = await this.recalculateTotals(quote.id);

    return { item, totals };
  }

  async update(input: {
    organizationId: string;
    quoteId: string;
    itemId: string;
    userId: string;
    data: Partial<Pick<QuoteItem, "description" | "quantity" | "unitPriceHtCents" | "taxRateBasisPoints" | "position">>;
  }): Promise<{ item: QuoteItem; totals: { subtotalHtCents: number; taxAmountCents: number; totalTtcCents: number } }> {
    await this.requireAccess(input.organizationId, input.userId);
    await this.requireDraftQuote(input.quoteId, input.organizationId);

    const existing = await this.itemsRepo.findById(input.itemId);
    if (!existing || existing.quoteId !== input.quoteId) {
      throw new AppError("Item not found", 404, "ITEM_NOT_FOUND");
    }

    const quantity = input.data.quantity ?? existing.quantity;
    const unitPriceHtCents = input.data.unitPriceHtCents ?? existing.unitPriceHtCents;
    const taxRateBasisPoints = input.data.taxRateBasisPoints ?? existing.taxRateBasisPoints;

    const lineSubtotalHtCents = calculateLineSubtotal(quantity, unitPriceHtCents);
    const lineTaxAmountCents = calculateLineTax(lineSubtotalHtCents, taxRateBasisPoints);
    const lineTotalTtcCents = calculateLineTotal(lineSubtotalHtCents, lineTaxAmountCents);

    const updated = await this.itemsRepo.update(input.itemId, {
      ...input.data,
      lineSubtotalHtCents,
      lineTaxAmountCents,
      lineTotalTtcCents,
    });

    const totals = await this.recalculateTotals(input.quoteId);

    return { item: updated, totals };
  }

  async delete(input: {
    organizationId: string;
    quoteId: string;
    itemId: string;
    userId: string;
  }): Promise<{ success: boolean; totals: { subtotalHtCents: number; taxAmountCents: number; totalTtcCents: number } }> {
    await this.requireAccess(input.organizationId, input.userId);
    await this.requireDraftQuote(input.quoteId, input.organizationId);

    const existing = await this.itemsRepo.findById(input.itemId);
    if (!existing || existing.quoteId !== input.quoteId) {
      throw new AppError("Item not found", 404, "ITEM_NOT_FOUND");
    }

    await this.itemsRepo.delete(input.itemId);
    const totals = await this.recalculateTotals(input.quoteId);

    return { success: true, totals };
  }

  async reorder(input: {
    organizationId: string;
    quoteId: string;
    userId: string;
    items: { id: string; position: number }[];
  }): Promise<QuoteItem[]> {
    await this.requireAccess(input.organizationId, input.userId);
    await this.requireDraftQuote(input.quoteId, input.organizationId);

    await this.itemsRepo.updatePositions(input.items);

    return this.itemsRepo.findByQuoteId(input.quoteId);
  }

  private async requireAccess(organizationId: string, userId: string): Promise<void> {
    const org = await this.orgsRepo.findById(organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }
    const member = await this.membersRepo.findByOrganizationAndUser(organizationId, userId);
    if (!member) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }
  }

  private async requireQuoteInOrg(quoteId: string, organizationId: string): Promise<import("../db/schema/quotes.schema").Quote> {
    const quote = await this.quotesRepo.findById(quoteId);
    if (!quote || quote.organizationId !== organizationId) {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    }
    return quote;
  }

  private async requireDraftQuote(quoteId: string, organizationId: string): Promise<import("../db/schema/quotes.schema").Quote> {
    const quote = await this.requireQuoteInOrg(quoteId, organizationId);
    if (quote.status !== "draft") {
      throw new AppError("Only draft quotes can be modified", 400, "QUOTE_NOT_DRAFT");
    }
    return quote;
  }

  private async recalculateTotals(quoteId: Promise<string> | string): Promise<{ subtotalHtCents: number; taxAmountCents: number; totalTtcCents: number }> {
    const id = await quoteId;
    const items = await this.itemsRepo.findByQuoteId(id);
    const totals = calculateTotals(items);
    await this.quotesRepo.update(id, totals);
    return totals;
  }
}
