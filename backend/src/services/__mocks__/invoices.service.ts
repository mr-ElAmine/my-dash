import { vi } from "vitest";

export const mockList = vi.fn();
export const mockGetById = vi.fn();
export const mockUpdate = vi.fn();
export const mockSend = vi.fn();
export const mockCancel = vi.fn();
export const mockGeneratePdf = vi.fn();

export class InvoicesService {
  list = mockList;
  getById = mockGetById;
  update = mockUpdate;
  send = mockSend;
  cancel = mockCancel;
  generatePdf = mockGeneratePdf;
}
