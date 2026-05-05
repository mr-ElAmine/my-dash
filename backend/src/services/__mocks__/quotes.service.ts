import { vi } from "vitest";

export const mockList = vi.fn();
export const mockCreate = vi.fn();
export const mockGetById = vi.fn();
export const mockUpdate = vi.fn();
export const mockSend = vi.fn();
export const mockAccept = vi.fn();
export const mockRefuse = vi.fn();
export const mockCancel = vi.fn();
export const mockGeneratePdf = vi.fn();

export class QuotesService {
  list = mockList;
  create = mockCreate;
  getById = mockGetById;
  update = mockUpdate;
  send = mockSend;
  accept = mockAccept;
  refuse = mockRefuse;
  cancel = mockCancel;
  generatePdf = mockGeneratePdf;
}
