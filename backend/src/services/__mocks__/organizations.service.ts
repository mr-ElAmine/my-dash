import { vi } from "vitest";

export const mockList = vi.fn();
export const mockGetById = vi.fn();
export const mockCreate = vi.fn();
export const mockUpdate = vi.fn();
export const mockArchive = vi.fn();
export const mockRestore = vi.fn();
export const mockListMembers = vi.fn();
export const mockGetMember = vi.fn();
export const mockUpdateMemberRole = vi.fn();
export const mockRemoveMember = vi.fn();

export class OrganizationsService {
  list = mockList;
  getById = mockGetById;
  create = mockCreate;
  update = mockUpdate;
  archive = mockArchive;
  restore = mockRestore;
  listMembers = mockListMembers;
  getMember = mockGetMember;
  updateMemberRole = mockUpdateMemberRole;
  removeMember = mockRemoveMember;
}
