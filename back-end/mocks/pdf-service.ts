import { vi, type Mock } from "vitest";
import { PdfService } from "../services/pdfService";

type Service = InstanceType<typeof PdfService>;

export type MockedPdfService = {
  generateQuote: Mock<Service["generateQuote"]>;
  generateInvoice: Mock<Service["generateInvoice"]>;
};

export function createPdfServiceMock(): MockedPdfService {
  return {
    generateQuote: vi.fn().mockResolvedValue(Buffer.from("fake-quote-pdf")),
    generateInvoice: vi.fn().mockResolvedValue(Buffer.from("fake-invoice-pdf")),
  };
}