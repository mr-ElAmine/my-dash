import { Request, Response } from "express";
import { ContactRepository } from "../../model/repositories";
import { sendSuccess, sendError } from "../../utils/response";
import { idParam } from "./schema";

export class ProspectController {
  constructor(private contactRepo = new ContactRepository()) {}

  async list(_req: Request, res: Response) {
    const prospects = await this.contactRepo.findList();
    sendSuccess(res, prospects);
  }

  async get(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return sendError(res, "ID invalide", 400);

    const prospect = await this.contactRepo.findDetail(parsed.data.id);
    if (!prospect) return sendError(res, "Prospect introuvable", 404);

    sendSuccess(res, prospect);
  }
}
