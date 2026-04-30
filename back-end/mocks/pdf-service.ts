import { vi, type Mock } from "vitest";

import { PdfService } from "../services/pdfService";

type Svc = InstanceType<typeof PdfService>;

export type MockedPdfService = {
  generateQuote: Mock<Svc["generateQuote"]>;
  generateInvoice: Mock<Svc["generateInvoice"]>;
};

export function createPdfServiceMock(): MockedPdfService {
  return {
    generateQuote: vi.fn().mockResolvedValue(Buffer.from("fake-quote-pdf")),
    generateInvoice: vi.fn().mockResolvedValue(Buffer.from("fake-invoice-pdf")),
  };
}
