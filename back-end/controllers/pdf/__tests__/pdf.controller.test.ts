import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

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

describe("PdfController", () => {
  // test unitaire : on mock tout (repos, service, Express) — zéro accès DB, zéro PDF réel
  let controller: PdfController;
  let res: MockResponse;

  // mocks = fausses implémentations qui enregistrent leurs appels, on peut vérifier après coup
  let mockQuoteRepo: MockedQuoteRepository;
  let mockInvoiceRepo: MockedInvoiceRepository;
  let mockCompanyRepo: MockedCompanyRepository;
  let mockContactRepo: MockedContactRepository;
  let mockItemRepo: MockedItemRepository;
  let mockPdfService: MockedPdfService;

  beforeEach(() => {
    // remet à zéro tous les appels enregistrés sur les mocks avant chaque test
    // sans ça, un appel dans un test "fuiterait" dans le suivant
    vi.clearAllMocks();

    mockQuoteRepo = createQuoteRepositoryMock();
    mockInvoiceRepo = createInvoiceRepositoryMock();
    mockCompanyRepo = createCompanyRepositoryMock();
    mockContactRepo = createContactRepositoryMock();
    mockItemRepo = createItemRepositoryMock();
    mockPdfService = createPdfServiceMock();

    // on injecte les mocks via le constructeur — c'est pour ça qu'il a des valeurs par défaut
    controller = new PdfController(
      mockQuoteRepo,
      mockInvoiceRepo,
      mockCompanyRepo,
      mockContactRepo,
      mockItemRepo,
      // double cast parce que le mock n'implémente pas toute la classe PdfService car fonc priver pas bon sintaure
      mockPdfService as unknown as PdfService,
    );

    res = createMockResponse();
  });

  it("doit renvoyer 400 si l'ID n'est pas un nombre valide", async () => {
    const req = createMockRequest({ id: "abc" });

    await controller.generateQuote(
      // notre mock req n'a pas le type Request complet, donc on force le cast
      req as unknown as Request,
      res as unknown as Response,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    // objectContaining = match partiel, on vérifie juste les champs qui nous intéressent
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: "ID invalide" }),
    );

    // on vérifie qu'on n'a pas appelé la DB pour rien — l'ID est déjà invalide
    expect(mockQuoteRepo.findById).not.toHaveBeenCalled();
  });

  it("doit renvoyer 404 si le devis n'existe pas en base", async () => {
    const req = createMockRequest({ id: "999" });

    // Once = ne résout qu'un seul appel, un deuxième appel retournerait undefined
    mockQuoteRepo.findById.mockResolvedValueOnce(undefined);

    await controller.generateQuote(
      req as unknown as Request,
      res as unknown as Response,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Devis introuvable" }),
    );

    // pas de contact à chercher, pas de PDF à générer — on vérifie qu'on s'arrête bien là
    expect(mockPdfService.generateQuote).not.toHaveBeenCalled();
  });

  // happy path : tout se passe bien, on vérifie chaque appel dans l'ordre attendu
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

  // la facture de test n'a pas de contact (contactId: null), donc ContactRepo ne doit pas être appelé
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
