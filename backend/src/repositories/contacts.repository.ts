import { eq, and, ilike, desc } from "drizzle-orm";
import { db } from "../db/client";
import { contacts, type Contact, type NewContact } from "../db/schema/contacts.schema";

type ContactStatus = Contact["status"];

interface ListFilters {
  status?: ContactStatus;
  companyId?: string;
  search?: string;
  offset: number;
  limit: number;
}

interface CountFilters {
  status?: ContactStatus;
  companyId?: string;
  search?: string;
}

export interface IContactsRepository {
  findByOrganizationId(
    organizationId: string,
    filters: ListFilters,
  ): Promise<Contact[]>;
  countByOrganizationId(
    organizationId: string,
    filters: CountFilters,
  ): Promise<number>;
  findById(id: string): Promise<Contact | undefined>;
  create(data: NewContact): Promise<Contact>;
  update(id: string, data: Partial<NewContact>): Promise<Contact>;
}

export class ContactsRepository implements IContactsRepository {
  constructor(private database = db) {}

  async findByOrganizationId(
    organizationId: string,
    filters: ListFilters,
  ): Promise<Contact[]> {
    const conditions = [eq(contacts.organizationId, organizationId)];

    if (filters.status) {
      conditions.push(eq(contacts.status, filters.status));
    }
    if (filters.companyId) {
      conditions.push(eq(contacts.companyId, filters.companyId));
    }
    if (filters.search) {
      conditions.push(ilike(contacts.lastName, `%${filters.search}%`));
    }

    return this.database
      .select()
      .from(contacts)
      .where(and(...conditions))
      .orderBy(desc(contacts.createdAt))
      .offset(filters.offset)
      .limit(filters.limit);
  }

  async countByOrganizationId(
    organizationId: string,
    filters: CountFilters,
  ): Promise<number> {
    const conditions = [eq(contacts.organizationId, organizationId)];

    if (filters.status) {
      conditions.push(eq(contacts.status, filters.status));
    }
    if (filters.companyId) {
      conditions.push(eq(contacts.companyId, filters.companyId));
    }
    if (filters.search) {
      conditions.push(ilike(contacts.lastName, `%${filters.search}%`));
    }

    const rows = await this.database
      .select({ id: contacts.id })
      .from(contacts)
      .where(and(...conditions));

    return rows.length;
  }

  async findById(id: string): Promise<Contact | undefined> {
    const [contact] = await this.database
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));
    return contact;
  }

  async create(data: NewContact): Promise<Contact> {
    const [contact] = await this.database
      .insert(contacts)
      .values(data)
      .returning();
    return contact;
  }

  async update(id: string, data: Partial<NewContact>): Promise<Contact> {
    const [contact] = await this.database
      .update(contacts)
      .set(data)
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }
}
