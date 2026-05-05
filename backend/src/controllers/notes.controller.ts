import type { Response, NextFunction } from "express";
import { z } from "zod";
import { NotesService } from "../services/notes.service";
import type { INotesService } from "../services/notes.service";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUserId, getValidatedBody, getValidatedQuery } from "../middlewares/auth.middleware";
import {
  listNotesQuery,
  createNoteBody,
  updateNoteBody,
} from "../validators/notes.validators";

const orgIdParam = z.object({ organizationId: z.string() });
const noteIdParam = z.object({ organizationId: z.string(), noteId: z.string() });

export class NotesController {
  constructor(private notesService: INotesService = new NotesService()) {}

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const query = getValidatedQuery(req, listNotesQuery);
      const offset = (query.page - 1) * query.limit;
      const result = await this.notesService.list({
        organizationId,
        userId: getUserId(req),
        page: query.page,
        limit: query.limit,
        offset,
        targetType: query.targetType,
        targetId: query.targetId,
      });
      res.json({ data: result.data, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, noteId } = noteIdParam.parse(req.params);
      const result = await this.notesService.getById({
        organizationId,
        noteId,
        userId: getUserId(req),
      });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = orgIdParam.parse(req.params);
      const body = getValidatedBody(req, createNoteBody);
      const result = await this.notesService.create({
        organizationId,
        userId: getUserId(req),
        content: body.content,
        links: body.links,
      });
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, noteId } = noteIdParam.parse(req.params);
      const body = getValidatedBody(req, updateNoteBody);
      const result = await this.notesService.update({
        organizationId,
        noteId,
        userId: getUserId(req),
        content: body.content,
        links: body.links,
      });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId, noteId } = noteIdParam.parse(req.params);
      const result = await this.notesService.delete({
        organizationId,
        noteId,
        userId: getUserId(req),
      });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}
