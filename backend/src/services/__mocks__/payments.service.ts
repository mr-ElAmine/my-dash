import { vi } from "vitest";

export const mockList = vi.fn();
export const mockRecord = vi.fn();
export const mockGetById = vi.fn();
export const mockCancel = vi.fn();

export class PaymentsService {
  list = mockList;
  record = mockRecord;
  getById = mockGetById;
  cancel = mockCancel;
}
