import type { Note } from "../db/schema/notes.schema";
import type { NoteLink } from "../db/schema/note-links.schema";

type TargetType = NoteLink["targetType"];

export interface NoteLinkInput {
  targetType: TargetType;
  targetId: string;
}

import type { INotesRepository } from "../repositories/notes.repository";
import type { INoteLinksRepository } from "../repositories/note-links.repository";
import type { IOrganizationsRepository } from "../repositories/organizations.repository";
import type { IOrganizationMembersRepository } from "../repositories/organization-members.repository";
import { NotesRepository } from "../repositories/notes.repository";
import { NoteLinksRepository } from "../repositories/note-links.repository";
import { OrganizationsRepository } from "../repositories/organizations.repository";
import { OrganizationMembersRepository } from "../repositories/organization-members.repository";
import { AppError } from "../errors/app-error";

export interface INotesService {
  list(input: {
    organizationId: string;
    userId: string;
    page: number;
    limit: number;
    offset: number;
    targetType?: TargetType;
    targetId?: string;
  }): Promise<{ data: Note[]; pagination: { page: number; limit: number; total: number } }>;
  getById(input: {
    organizationId: string;
    noteId: string;
    userId: string;
  }): Promise<{ note: Note; links: NoteLink[] }>;
  create(input: {
    organizationId: string;
    userId: string;
    content: string;
    links?: NoteLinkInput[];
  }): Promise<{ note: Note; links: NoteLink[] }>;
  update(input: {
    organizationId: string;
    noteId: string;
    userId: string;
    content?: string;
    links?: NoteLinkInput[];
  }): Promise<{ note: Note; links: NoteLink[] }>;
  delete(input: {
    organizationId: string;
    noteId: string;
    userId: string;
  }): Promise<{ success: boolean }>;
}

export class NotesService implements INotesService {
  constructor(
    private notesRepo: INotesRepository = new NotesRepository(),
    private linksRepo: INoteLinksRepository = new NoteLinksRepository(),
    private orgsRepo: IOrganizationsRepository = new OrganizationsRepository(),
    private membersRepo: IOrganizationMembersRepository = new OrganizationMembersRepository(),
  ) {}

  async list(input: {
    organizationId: string;
    userId: string;
    page: number;
    limit: number;
    offset: number;
    targetType?: TargetType;
    targetId?: string;
  }): Promise<{ data: Note[]; pagination: { page: number; limit: number; total: number } }> {
    await this.requireAccess(input.organizationId, input.userId);

    if (input.targetType && input.targetId) {
      return this.listByTarget({
        organizationId: input.organizationId,
        page: input.page,
        limit: input.limit,
        offset: input.offset,
        targetType: input.targetType,
        targetId: input.targetId,
      });
    }

    const filters = { offset: input.offset, limit: input.limit };
    const [data, total] = await Promise.all([
      this.notesRepo.findByOrganizationId(input.organizationId, filters),
      this.notesRepo.countByOrganizationId(input.organizationId),
    ]);

    return {
      data,
      pagination: { page: input.page, limit: input.limit, total },
    };
  }

  private async listByTarget(input: {
    organizationId: string;
    page: number;
    limit: number;
    offset: number;
    targetType: TargetType;
    targetId: string;
  }): Promise<{ data: Note[]; pagination: { page: number; limit: number; total: number } }> {
    const noteLinks = await this.linksRepo.findByTarget(
      input.organizationId,
      input.targetType,
      input.targetId,
    );

    const noteIds = noteLinks.map((l) => l.noteId);
    if (noteIds.length === 0) {
      return {
        data: [],
        pagination: { page: input.page, limit: input.limit, total: 0 },
      };
    }

    const allNotes = await Promise.all(
      noteIds.map((id) => this.notesRepo.findById(id)),
    );

    const data = allNotes
      .filter((n): n is Note => n !== undefined)
      .slice(input.offset, input.offset + input.limit);

    return {
      data,
      pagination: { page: input.page, limit: input.limit, total: noteIds.length },
    };
  }

  async getById(input: {
    organizationId: string;
    noteId: string;
    userId: string;
  }): Promise<{ note: Note; links: NoteLink[] }> {
    await this.requireAccess(input.organizationId, input.userId);

    const note = await this.requireNoteInOrg(input.noteId, input.organizationId);
    const links = await this.linksRepo.findByNoteId(note.id);

    return { note, links };
  }

  async create(input: {
    organizationId: string;
    userId: string;
    content: string;
    links?: NoteLinkInput[];
  }): Promise<{ note: Note; links: NoteLink[] }> {
    await this.requireAccess(input.organizationId, input.userId);

    const note = await this.notesRepo.create({
      organizationId: input.organizationId,
      content: input.content,
      createdBy: input.userId,
    });

    let createdLinks: NoteLink[] = [];
    if (input.links && input.links.length > 0) {
      const linkRows = input.links.map((l) => ({
        organizationId: input.organizationId,
        noteId: note.id,
        targetType: l.targetType,
        targetId: l.targetId,
      }));
      createdLinks = await this.linksRepo.createBatch(linkRows);
    }

    return { note, links: createdLinks };
  }

  async update(input: {
    organizationId: string;
    noteId: string;
    userId: string;
    content?: string;
    links?: NoteLinkInput[];
  }): Promise<{ note: Note; links: NoteLink[] }> {
    await this.requireAccess(input.organizationId, input.userId);

    const note = await this.requireNoteInOrg(input.noteId, input.organizationId);

    if (input.content !== undefined) {
      await this.notesRepo.update(note.id, { content: input.content });
    }

    if (input.links !== undefined) {
      await this.linksRepo.deleteByNoteId(note.id);
      if (input.links.length > 0) {
        const linkRows = input.links.map((l) => ({
          organizationId: input.organizationId,
          noteId: note.id,
          targetType: l.targetType,
          targetId: l.targetId,
        }));
        await this.linksRepo.createBatch(linkRows);
      }
    }

    const updatedNote = await this.notesRepo.findById(note.id);
    const updatedLinks = await this.linksRepo.findByNoteId(note.id);

    return { note: updatedNote!, links: updatedLinks };
  }

  async delete(input: {
    organizationId: string;
    noteId: string;
    userId: string;
  }): Promise<{ success: boolean }> {
    await this.requireAccess(input.organizationId, input.userId);

    const note = await this.requireNoteInOrg(input.noteId, input.organizationId);
    await this.linksRepo.deleteByNoteId(note.id);
    await this.notesRepo.delete(note.id);

    return { success: true };
  }

  private async requireAccess(organizationId: string, userId: string): Promise<void> {
    const org = await this.orgsRepo.findById(organizationId);
    if (!org) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }
    const member = await this.membersRepo.findByOrganizationAndUser(organizationId, userId);
    if (!member) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }
  }

  private async requireNoteInOrg(noteId: string, organizationId: string): Promise<Note> {
    const note = await this.notesRepo.findById(noteId);
    if (!note || note.organizationId !== organizationId) {
      throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    }
    return note;
  }
}
