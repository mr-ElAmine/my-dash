export interface PdfCompany {
  name: string;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface PdfContact {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
}

export interface PdfItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface PdfConfig {
  sender: PdfCompany;
  recipient: PdfCompany;
  contact?: PdfContact;
  items: PdfItem[];
  subtotalHt: number;
  taxAmount: number;
  totalTtc: number;
}

export interface QuoteData extends PdfConfig {
  quoteNumber: string;
  issueDate: string;
  validUntil: string;
}

export interface InvoiceData extends PdfConfig {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
}
