import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

/*
Tests unitaires du PdfController
*/

//Imports réutilisables

import {
  createMockResponse,
  createMockRequest,
  type MockResponse,
  createQuoteRepositoryMock,
  createInvoiceRepositoryMock,
  createCompanyRepositoryMock,
  createContactRepositoryMock,
  createItemRepositoryMock,
  createPdfServiceMock,
  type MockedQuoteRepository,
  type MockedInvoiceRepository,
  type MockedCompanyRepository,
  type MockedContactRepository,
  type MockedItemRepository,
  type MockedPdfService,
} from "../../../mocks";

import {
  fakeQuote,
  fakeInvoice,
  fakeCompany,
  fakeContact,
  fakeItems,
} from "./fixtures";

import { PdfController } from "../index";
import { PdfService } from "../../../services/pdfService";

//Tests

describe("PdfController", () => {
  let controller: PdfController;
  let res: MockResponse;

  let mockQuoteRepo: MockedQuoteRepository;
  let mockInvoiceRepo: MockedInvoiceRepository;
  let mockCompanyRepo: MockedCompanyRepository;
  let mockContactRepo: MockedContactRepository;
  let mockItemRepo: MockedItemRepository;
  let mockPdfService: MockedPdfService;

  beforeEach(() => {
    vi.clearAllMocks();

    //Chaque factory crée une instance fraîche avec des vi.fn() vierges
    mockQuoteRepo = createQuoteRepositoryMock();
    mockInvoiceRepo = createInvoiceRepositoryMock();
    mockCompanyRepo = createCompanyRepositoryMock();
    mockContactRepo = createContactRepositoryMock();
    mockItemRepo = createItemRepositoryMock();
    mockPdfService = createPdfServiceMock();

    //Injection directe
    controller = new PdfController(
      mockQuoteRepo,
      mockInvoiceRepo,
      mockCompanyRepo,
      mockContactRepo,
      mockItemRepo,
      mockPdfService as unknown as PdfService,
    );

    res = createMockResponse();
  });

  /*
  Test 1 Validation des entrées
  Zod rejette un ID non numérique avant d'atteindre la base.
  */
  it("doit renvoyer 400 si l'ID n'est pas un nombre valide", async () => {
    const req = createMockRequest({ id: "abc" });

    await controller.generateQuote(
      req as unknown as Request,
      res as unknown as Response,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: "ID invalide" }),
    );

    //La db n'est jamais sollicitée
    expect(mockQuoteRepo.findById).not.toHaveBeenCalled();
  });

  /*
  Test 2 Ressource introuvable
  Le devis n'existe pas en base alors 404, sans appeler le service PDF.
  */
  it("doit renvoyer 404 si le devis n'existe pas en base", async () => {
    const req = createMockRequest({ id: "999" });

    mockQuoteRepo.findById.mockResolvedValueOnce(undefined);

    await controller.generateQuote(
      req as unknown as Request,
      res as unknown as Response,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Devis introuvable" }),
    );

    expect(mockPdfService.generateQuote).not.toHaveBeenCalled();
  });

  /*
  Test 3 Devis complet avec entreprise, contact et lignes
  */
  it("doit générer et envoyer le PDF du devis avec toutes les données", async () => {
    const req = createMockRequest({ id: "1" });

    mockQuoteRepo.findById.mockResolvedValueOnce(fakeQuote);
    mockCompanyRepo.findById.mockResolvedValueOnce(fakeCompany);
    mockContactRepo.findById.mockResolvedValueOnce(fakeContact);
    mockItemRepo.findByDocument.mockResolvedValueOnce(fakeItems);

    await controller.generateQuote(
      req as unknown as Request,
      res as unknown as Response,
    );

    expect(mockQuoteRepo.findById).toHaveBeenCalledWith(1);
    expect(mockCompanyRepo.findById).toHaveBeenCalledWith(1);
    expect(mockContactRepo.findById).toHaveBeenCalledWith(1);
    expect(mockItemRepo.findByDocument).toHaveBeenCalledWith("quote", 1);

    expect(mockPdfService.generateQuote).toHaveBeenCalledTimes(1);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/pdf",
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'inline; filename="DEV-2026-001.pdf"',
    );
    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
  });

  /*
  Test 4 Facture sans contact (contactId null)
  Le contrôleur ne doit PAS appeler ContactRepository.
  */
  it("doit générer le PDF de la facture sans appeler le ContactRepo", async () => {
    const req = createMockRequest({ id: "1" });

    mockInvoiceRepo.findById.mockResolvedValueOnce(fakeInvoice);
    mockCompanyRepo.findById.mockResolvedValueOnce(fakeCompany);
    mockItemRepo.findByDocument.mockResolvedValueOnce(fakeItems);

    await controller.generateInvoice(
      req as unknown as Request,
      res as unknown as Response,
    );

    expect(mockContactRepo.findById).not.toHaveBeenCalled();
    expect(mockPdfService.generateInvoice).toHaveBeenCalledTimes(1);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'inline; filename="FAC-2026-001.pdf"',
    );
    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
  });
});
