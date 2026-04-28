import { api } from "./client";

export async function fetchQuotePdf(id: number): Promise<ArrayBuffer> {
  const res = await api.get(`/generate-quote/${id}`, {
    responseType: "arraybuffer",
  });
  return res.data;
}

export async function fetchInvoicePdf(id: number): Promise<ArrayBuffer> {
  const res = await api.get(`/generate-invoice/${id}`, {
    responseType: "arraybuffer",
  });
  return res.data;
}
