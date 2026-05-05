import { vi } from "vitest";
import type { IQuotePdfService } from "../../src/services/quote-pdf.service";

export function createQuotePdfServiceMock(): IQuotePdfService {
  return {
    generate: vi.fn(),
  };
}
