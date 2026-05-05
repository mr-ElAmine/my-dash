import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotesService } from "../../../src/services/notes.service";
import { createNotesRepositoryMock } from "../../mocks/repositories/notes.repository.mock";
import { createNoteLinksRepositoryMock } from "../../mocks/repositories/note-links.repository.mock";
import { createOrganizationsRepositoryMock } from "../../mocks/repositories/organizations.repository.mock";
import { createOrganizationMembersRepositoryMock } from "../../mocks/repositories/organization-members.repository.mock";
import { createOrganization } from "../../fixtures/organizations.fixture";
import { createOwnerMember } from "../../fixtures/organization-members.fixture";
import { createNote } from "../../fixtures/notes.fixture";
import { createNoteLink } from "../../fixtures/note-links.fixture";

describe("NotesService", () => {
  const notesRepo = createNotesRepositoryMock();
  const linksRepo = createNoteLinksRepositoryMock();
  const orgsRepo = createOrganizationsRepositoryMock();
  const membersRepo = createOrganizationMembersRepositoryMock();
  const service = new NotesService(
    notesRepo,
    linksRepo,
    orgsRepo,
    membersRepo,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockAccess(orgId = "org_1", userId = "user_1") {
    const org = createOrganization({ id: orgId });
    const member = createOwnerMember({ organizationId: orgId, userId });
    vi.mocked(orgsRepo.findById).mockResolvedValue(org);
    vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(member);
  }

  describe("list", () => {
    it("should return paginated notes for an organization", async () => {
      mockAccess();
      const note = createNote();
      vi.mocked(notesRepo.findByOrganizationId).mockResolvedValue([note]);
      vi.mocked(notesRepo.countByOrganizationId).mockResolvedValue(1);

      const result = await service.list({
        organizationId: "org_1",
        userId: "user_1",
        page: 1,
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1 });
    });

    it("should list notes by target when targetType and targetId provided", async () => {
      mockAccess();
      const link = createNoteLink({ noteId: "note_1" });
      const note = createNote({ id: "note_1" });
      vi.mocked(linksRepo.findByTarget).mockResolvedValue([link]);
      vi.mocked(notesRepo.findById).mockResolvedValue(note);

      const result = await service.list({
        organizationId: "org_1",
        userId: "user_1",
        page: 1,
        limit: 20,
        offset: 0,
        targetType: "company",
        targetId: "comp_1",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe("note_1");
      expect(linksRepo.findByTarget).toHaveBeenCalledWith(
        "org_1",
        "company",
        "comp_1",
      );
    });

    it("should return empty list when no links found for target", async () => {
      mockAccess();
      vi.mocked(linksRepo.findByTarget).mockResolvedValue([]);

      const result = await service.list({
        organizationId: "org_1",
        userId: "user_1",
        page: 1,
        limit: 20,
        offset: 0,
        targetType: "company",
        targetId: "comp_1",
      });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("should throw when organization not found", async () => {
      vi.mocked(orgsRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.list({
          organizationId: "unknown",
          userId: "user_1",
          page: 1,
          limit: 20,
          offset: 0,
        }),
      ).rejects.toThrow("Organization not found");
    });

    it("should throw when user is not a member", async () => {
      vi.mocked(orgsRepo.findById).mockResolvedValue(createOrganization({ id: "org_1" }));
      vi.mocked(membersRepo.findByOrganizationAndUser).mockResolvedValue(undefined);

      await expect(
        service.list({
          organizationId: "org_1",
          userId: "user_1",
          page: 1,
          limit: 20,
          offset: 0,
        }),
      ).rejects.toThrow("Access denied");
    });
  });

  describe("getById", () => {
    it("should return note with links", async () => {
      mockAccess();
      const note = createNote();
      const link = createNoteLink({ noteId: "note_1" });
      vi.mocked(notesRepo.findById).mockResolvedValue(note);
      vi.mocked(linksRepo.findByNoteId).mockResolvedValue([link]);

      const result = await service.getById({
        organizationId: "org_1",
        noteId: "note_1",
        userId: "user_1",
      });

      expect(result.note).toEqual(note);
      expect(result.links).toHaveLength(1);
    });

    it("should throw when note not found", async () => {
      mockAccess();
      vi.mocked(notesRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.getById({
          organizationId: "org_1",
          noteId: "unknown",
          userId: "user_1",
        }),
      ).rejects.toThrow("Note not found");
    });

    it("should throw when note belongs to another organization", async () => {
      mockAccess();
      const note = createNote({ organizationId: "org_2" });
      vi.mocked(notesRepo.findById).mockResolvedValue(note);

      await expect(
        service.getById({
          organizationId: "org_1",
          noteId: "note_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Note not found");
    });
  });

  describe("create", () => {
    it("should create a note with links", async () => {
      mockAccess();
      const note = createNote();
      const link = createNoteLink({ noteId: "note_1" });
      vi.mocked(notesRepo.create).mockResolvedValue(note);
      vi.mocked(linksRepo.createBatch).mockResolvedValue([link]);

      const result = await service.create({
        organizationId: "org_1",
        userId: "user_1",
        content: "This is a note",
        links: [{ targetType: "company", targetId: "comp_1" }],
      });

      expect(result.note).toEqual(note);
      expect(result.links).toHaveLength(1);
      expect(notesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org_1",
          content: "This is a note",
          createdBy: "user_1",
        }),
      );
      expect(linksRepo.createBatch).toHaveBeenCalledWith([
        expect.objectContaining({
          organizationId: "org_1",
          noteId: "note_1",
          targetType: "company",
          targetId: "comp_1",
        }),
      ]);
    });

    it("should create a note without links", async () => {
      mockAccess();
      const note = createNote();
      vi.mocked(notesRepo.create).mockResolvedValue(note);

      const result = await service.create({
        organizationId: "org_1",
        userId: "user_1",
        content: "This is a note",
      });

      expect(result.note).toEqual(note);
      expect(result.links).toHaveLength(0);
      expect(linksRepo.createBatch).not.toHaveBeenCalled();
    });

    it("should not call createBatch when links array is empty", async () => {
      mockAccess();
      const note = createNote();
      vi.mocked(notesRepo.create).mockResolvedValue(note);

      const result = await service.create({
        organizationId: "org_1",
        userId: "user_1",
        content: "Standalone note",
        links: [],
      });

      expect(result.links).toHaveLength(0);
      expect(linksRepo.createBatch).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update note content only", async () => {
      mockAccess();
      const note = createNote();
      const updated = { ...note, content: "Updated content" };
      const link = createNoteLink({ noteId: "note_1" });
      vi.mocked(notesRepo.findById).mockResolvedValue(note);
      vi.mocked(notesRepo.update).mockResolvedValue(updated);
      // Second findById call returns the updated note
      vi.mocked(notesRepo.findById)
        .mockResolvedValueOnce(note)
        .mockResolvedValueOnce(updated);
      vi.mocked(linksRepo.findByNoteId).mockResolvedValue([link]);

      const result = await service.update({
        organizationId: "org_1",
        noteId: "note_1",
        userId: "user_1",
        content: "Updated content",
      });

      expect(result.note.content).toBe("Updated content");
      expect(notesRepo.update).toHaveBeenCalledWith("note_1", {
        content: "Updated content",
      });
      expect(linksRepo.deleteByNoteId).not.toHaveBeenCalled();
    });

    it("should replace links when links provided", async () => {
      mockAccess();
      const note = createNote();
      const updated = { ...note, content: "New content" };
      const newLink = createNoteLink({ noteId: "note_1", targetType: "invoice", targetId: "inv_1" });
      vi.mocked(notesRepo.findById)
        .mockResolvedValueOnce(note)
        .mockResolvedValueOnce(updated);
      vi.mocked(notesRepo.update).mockResolvedValue(updated);
      vi.mocked(linksRepo.findByNoteId).mockResolvedValue([newLink]);
      vi.mocked(linksRepo.createBatch).mockResolvedValue([newLink]);

      const result = await service.update({
        organizationId: "org_1",
        noteId: "note_1",
        userId: "user_1",
        content: "New content",
        links: [{ targetType: "invoice", targetId: "inv_1" }],
      });

      expect(result.note).toEqual(updated);
      expect(linksRepo.deleteByNoteId).toHaveBeenCalledWith("note_1");
      expect(linksRepo.createBatch).toHaveBeenCalledWith([
        expect.objectContaining({
          noteId: "note_1",
          targetType: "invoice",
          targetId: "inv_1",
        }),
      ]);
    });

    it("should delete all links when empty links array provided", async () => {
      mockAccess();
      const note = createNote();
      vi.mocked(notesRepo.findById)
        .mockResolvedValueOnce(note)
        .mockResolvedValueOnce(note);
      vi.mocked(linksRepo.findByNoteId).mockResolvedValue([]);

      const result = await service.update({
        organizationId: "org_1",
        noteId: "note_1",
        userId: "user_1",
        links: [],
      });

      expect(linksRepo.deleteByNoteId).toHaveBeenCalledWith("note_1");
      expect(linksRepo.createBatch).not.toHaveBeenCalled();
      expect(result.links).toHaveLength(0);
    });

    it("should throw when note not found", async () => {
      mockAccess();
      vi.mocked(notesRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.update({
          organizationId: "org_1",
          noteId: "unknown",
          userId: "user_1",
          content: "Updated",
        }),
      ).rejects.toThrow("Note not found");
    });
  });

  describe("delete", () => {
    it("should delete links then note", async () => {
      mockAccess();
      const note = createNote();
      vi.mocked(notesRepo.findById).mockResolvedValue(note);

      const result = await service.delete({
        organizationId: "org_1",
        noteId: "note_1",
        userId: "user_1",
      });

      expect(result.success).toBe(true);
      expect(linksRepo.deleteByNoteId).toHaveBeenCalledWith("note_1");
      expect(notesRepo.delete).toHaveBeenCalledWith("note_1");
      // Links must be deleted before the note
      expect(linksRepo.deleteByNoteId).toHaveBeenCalledBefore(
        vi.mocked(notesRepo.delete),
      );
    });

    it("should throw when note not found", async () => {
      mockAccess();
      vi.mocked(notesRepo.findById).mockResolvedValue(undefined);

      await expect(
        service.delete({
          organizationId: "org_1",
          noteId: "unknown",
          userId: "user_1",
        }),
      ).rejects.toThrow("Note not found");
    });

    it("should throw when note belongs to another organization", async () => {
      mockAccess();
      const note = createNote({ organizationId: "org_2" });
      vi.mocked(notesRepo.findById).mockResolvedValue(note);

      await expect(
        service.delete({
          organizationId: "org_1",
          noteId: "note_1",
          userId: "user_1",
        }),
      ).rejects.toThrow("Note not found");
    });
  });
});
