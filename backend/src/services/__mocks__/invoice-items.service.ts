import { vi } from "vitest";

export const mockList = vi.fn();
export const mockGetById = vi.fn();

export class InvoiceItemsService {
  list = mockList;
  getById = mockGetById;
}
