import { z } from "zod";

const organizationIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const noteIdParam = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  noteId: z.string().min(1, "Note ID is required"),
});

const linkSchema = z.object({
  targetType: z.enum(["company", "contact", "quote", "invoice"]),
  targetId: z.string().min(1, "Target ID is required"),
});

export const listNotesQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  targetType: z.enum(["company", "contact", "quote", "invoice"]).optional(),
  targetId: z.string().optional(),
});

export const createNoteBody = z.object({
  content: z.string().min(1, "Content is required"),
  links: z.array(linkSchema).optional().default([]),
});

export const updateNoteBody = z.object({
  content: z.string().optional(),
  links: z.array(linkSchema).optional(),
});

export const listNotesSchema = {
  params: organizationIdParam,
  query: listNotesQuery,
};
export const createNoteSchema = {
  params: organizationIdParam,
  body: createNoteBody,
};
export const getNoteSchema = { params: noteIdParam };
export const updateNoteSchema = {
  params: noteIdParam,
  body: updateNoteBody,
};
export const deleteNoteSchema = { params: noteIdParam };

export type CreateNoteBody = z.infer<typeof createNoteBody>;
export type UpdateNoteBody = z.infer<typeof updateNoteBody>;
export type ListNotesQuery = z.infer<typeof listNotesQuery>;
