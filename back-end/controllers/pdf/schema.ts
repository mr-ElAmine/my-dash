import z from "zod";

const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export { idParam };
