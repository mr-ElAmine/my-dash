import { vi } from "vitest";

export const mockList = vi.fn();
export const mockCreate = vi.fn();
export const mockRevoke = vi.fn();
export const mockPreview = vi.fn();
export const mockAccept = vi.fn();

export class OrganizationInvitesService {
  list = mockList;
  create = mockCreate;
  revoke = mockRevoke;
  preview = mockPreview;
  accept = mockAccept;
}
