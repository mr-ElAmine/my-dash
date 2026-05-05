import { vi } from "vitest";

export const mockList = vi.fn();
export const mockAdd = vi.fn();
export const mockUpdate = vi.fn();
export const mockDelete = vi.fn();
export const mockReorder = vi.fn();

export class QuoteItemsService {
  list = mockList;
  add = mockAdd;
  update = mockUpdate;
  delete = mockDelete;
  reorder = mockReorder;
}
