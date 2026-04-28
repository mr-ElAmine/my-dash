export interface INoteLink {
  id: number;
  noteId: number;
  targetType: "company" | "contact" | "quote" | "invoice";
  targetId: number;
}
