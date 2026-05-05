import PDFDocument from "pdfkit";

export function createDocument(): PDFKit.PDFDocument {
  return new PDFDocument({ size: "A4", margins: { top: 50, bottom: 50, left: 50, right: 50 } });
}

export function drawHeader(doc: PDFKit.PDFDocument, title: string): void {
  doc.fontSize(20).font("Helvetica-Bold").text(title, { align: "left" });
  doc.moveDown(0.5);
}

export function drawAddressBlock(
  doc: PDFKit.PDFDocument,
  label: string,
  address: {
    name: string;
    street?: string | null;
    zipCode?: string | null;
    city?: string | null;
    country?: string | null;
    email?: string | null;
    phone?: string | null;
  },
): void {
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#666").text(label.toUpperCase());
  doc.font("Helvetica").fillColor("#000").fontSize(10);
  doc.text(address.name);
  if (address.street) doc.text(address.street);
  if (address.zipCode && address.city) {
    doc.text(`${address.zipCode} ${address.city}`);
  }
  if (address.country) doc.text(address.country);
  if (address.email) doc.text(address.email);
  if (address.phone) doc.text(address.phone);
  doc.moveDown(1);
}

export function drawMetaLine(doc: PDFKit.PDFDocument, label: string, value: string): void {
  doc.fontSize(10).font("Helvetica-Bold").text(label, { continued: true });
  doc.font("Helvetica").text(` ${value}`);
}

export interface TableCol {
  header: string;
  width: number;
  align?: "left" | "right";
}

export function drawTable(
  doc: PDFKit.PDFDocument,
  cols: TableCol[],
  rows: string[][],
): void {
  const startX = doc.x;
  const rowHeight = 22;
  const headerHeight = 26;
  let y = doc.y;

  doc.rect(startX, y, cols.reduce((s, c) => s + c.width, 0), headerHeight)
    .fill("#2c3e50");

  let x = startX;
  for (const col of cols) {
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#fff")
      .text(col.header, x + 6, y + 7, { width: col.width - 12, align: col.align ?? "left" });
    x += col.width;
  }

  y += headerHeight;

  for (let i = 0; i < rows.length; i++) {
    if (y + rowHeight > 750) {
      doc.addPage();
      y = 50;
    }

    if (i % 2 === 0) {
      doc.rect(startX, y, cols.reduce((s, c) => s + c.width, 0), rowHeight)
        .fill("#f5f5f5");
    }

    x = startX;
    const row = rows[i];
    for (let j = 0; j < cols.length && j < row.length; j++) {
      doc.fontSize(9).font("Helvetica").fillColor("#000")
        .text(row[j], x + 6, y + 6, { width: cols[j].width - 12, align: cols[j].align ?? "left" });
      x += cols[j].width;
    }
    y += rowHeight;
  }

  doc.y = y;
  doc.x = startX;
  doc.fillColor("#000");
}

export function drawTotals(
  doc: PDFKit.PDFDocument,
  subtotalHt: string,
  taxAmount: string,
  totalTtc: string,
  taxRateLabel?: string,
): void {
  doc.moveDown(0.5);
  const labelX = 340;
  const valueX = 440;
  const y = doc.y;

  doc.fontSize(10).font("Helvetica");
  doc.text("Sous-total HT", labelX, y, { width: 90, align: "left" });
  doc.text(`${subtotalHt} EUR`, valueX, y, { width: 100, align: "right" });

  const taxLabel = taxRateLabel ? `TVA (${taxRateLabel})` : "TVA";
  doc.text(taxLabel, labelX, y + 18, { width: 90, align: "left" });
  doc.text(`${taxAmount} EUR`, valueX, y + 18, { width: 100, align: "right" });

  doc.moveDown(2);
  const totalY = doc.y;
  doc.rect(labelX - 10, totalY - 4, 210, 24).fill("#2c3e50");
  doc.fontSize(12).font("Helvetica-Bold").fillColor("#fff");
  doc.text("Total TTC", labelX, totalY, { width: 90, align: "left" });
  doc.text(`${totalTtc} EUR`, valueX, totalY, { width: 100, align: "right" });

  doc.fillColor("#000");
}

export function toBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}
