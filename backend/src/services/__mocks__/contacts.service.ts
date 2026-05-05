import { vi } from "vitest";

export const mockList = vi.fn();
export const mockGetById = vi.fn();
export const mockCreate = vi.fn();
export const mockUpdate = vi.fn();
export const mockArchive = vi.fn();
export const mockRestore = vi.fn();

export class ContactsService {
  list = mockList;
  getById = mockGetById;
  create = mockCreate;
  update = mockUpdate;
  archive = mockArchive;
  restore = mockRestore;
}
