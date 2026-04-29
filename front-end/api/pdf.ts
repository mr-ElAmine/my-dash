import { api } from "./client";

export async function getQuotePdf(id: number): Promise<ArrayBuffer> {
  const res = await api.get(`/quotes/${id}/pdf`, {
    responseType: "arraybuffer",
  });
  return res.data;
}

export async function getInvoicePdf(id: number): Promise<ArrayBuffer> {
  const res = await api.get(`/invoices/${id}/pdf`, {
    responseType: "arraybuffer",
  });
  return res.data;
}
