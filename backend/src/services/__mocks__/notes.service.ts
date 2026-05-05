import { vi } from "vitest";

export const mockList = vi.fn();
export const mockGetById = vi.fn();
export const mockCreate = vi.fn();
export const mockUpdate = vi.fn();
export const mockDelete = vi.fn();

export class NotesService {
  list = mockList;
  getById = mockGetById;
  create = mockCreate;
  update = mockUpdate;
  delete = mockDelete;
}
