export interface IItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
  documentType: "quote" | "invoice";
  documentId: number;
}
