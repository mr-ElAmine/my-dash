import { Response } from "express";

export const sendSuccess = (res: Response, data: unknown, status = 200) => {
  res.status(status).json({ success: true, data });
};

export const sendError = (
  res: Response,
  message: string,
  status = 500,
) => {
  res.status(status).json({ success: false, error: message });
};

export const sendPdf = (
  res: Response,
  buffer: Buffer,
  filename: string,
) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.send(buffer);
};
