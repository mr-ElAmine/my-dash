import PDFDocument from "pdfkit";

const PAGE_WIDTH = 595.28;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const HALF_WIDTH = CONTENT_WIDTH / 2 - 8;

export function createDocument(): PDFKit.PDFDocument {
  return new PDFDocument({
    size: "A4",
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
  });
}

export function drawHeader(doc: PDFKit.PDFDocument, title: string, number: string): void {
  const y = doc.y;

  // Title banner
  doc.rect(MARGIN, y, CONTENT_WIDTH, 40).fill("#2c3e50");
  doc.fontSize(20).font("Helvetica-Bold").fillColor("#fff")
    .text(title, MARGIN + 16, y + 10, { width: CONTENT_WIDTH / 2 });

  doc.fontSize(14).font("Helvetica-Bold").fillColor("#fff")
    .text(number, MARGIN, y + 12, { width: CONTENT_WIDTH - 16, align: "right" });

  doc.fillColor("#000");
  doc.y = y + 52;
  doc.x = MARGIN;
}

export interface AddressInfo {
  name: string;
  street?: string | null;
  zipCode?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
}

function measureBlockHeight(doc: PDFKit.PDFDocument, label: string, address: AddressInfo): number {
  const lines: string[] = [];
  lines.push(address.name);
  if (address.street) lines.push(address.street);
  if (address.zipCode && address.city) lines.push(`${address.zipCode} ${address.city}`);
  if (address.country) lines.push(address.country);
  if (address.email) lines.push(address.email);
  if (address.phone) lines.push(address.phone);

  const labelTextH = doc.fontSize(8).font("Helvetica-Bold").heightOfString(label.toUpperCase(), { width: HALF_WIDTH });
  doc.fontSize(9).font("Helvetica");
  let bodyH = 0;
  for (const line of lines) {
    bodyH += doc.heightOfString(line, { width: HALF_WIDTH });
  }
  return labelTextH + 4 + bodyH;
}

export function drawAddressBlocks(
  doc: PDFKit.PDFDocument,
  issuerLabel: string,
  issuer: AddressInfo,
  clientLabel: string,
  client: AddressInfo,
): void {
  const startY = doc.y;
  const leftX = MARGIN;
  const rightX = MARGIN + HALF_WIDTH + 16;

  // Measure both blocks to find the tallest
  const leftH = measureBlockHeight(doc, issuerLabel, issuer);
  const rightH = measureBlockHeight(doc, clientLabel, client);
  const blockMaxH = Math.max(leftH, rightH);

  // Draw issuer (left)
  drawSingleAddress(doc, issuerLabel, issuer, leftX, startY);
  // Draw client (right)
  drawSingleAddress(doc, clientLabel, client, rightX, startY);

  // Advance Y past the tallest block
  doc.y = startY + blockMaxH + 12;
  doc.x = MARGIN;
}

function drawSingleAddress(
  doc: PDFKit.PDFDocument,
  label: string,
  address: AddressInfo,
  x: number,
  y: number,
): void {
  const w = HALF_WIDTH;

  doc.fontSize(8).font("Helvetica-Bold").fillColor("#999")
    .text(label.toUpperCase(), x, y, { width: w });

  let cy = y + 14;

  doc.fontSize(10).font("Helvetica-Bold").fillColor("#000")
    .text(address.name, x, cy, { width: w });
  cy = doc.y + 2;

  doc.fontSize(9).font("Helvetica").fillColor("#333");
  if (address.street) {
    doc.text(address.street, x, cy, { width: w });
    cy = doc.y + 1;
  }
  if (address.zipCode && address.city) {
    doc.text(`${address.zipCode} ${address.city}`, x, cy, { width: w });
    cy = doc.y + 1;
  }
  if (address.country) {
    doc.text(address.country, x, cy, { width: w });
    cy = doc.y + 1;
  }
  if (address.email) {
    doc.text(address.email, x, cy, { width: w });
    cy = doc.y + 1;
  }
  if (address.phone) {
    doc.text(address.phone, x, cy, { width: w });
  }
}

export function drawMetaLine(doc: PDFKit.PDFDocument, label: string, value: string): void {
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#666").text(label, { continued: true });
  doc.fillColor("#000").font("Helvetica").text(` ${value}`);
}

export function drawSeparator(doc: PDFKit.PDFDocument): void {
  const y = doc.y;
  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_WIDTH, y)
    .strokeColor("#ddd").lineWidth(0.5).stroke();
  doc.y = y + 8;
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
  const startX = MARGIN;
  const tableWidth = cols.reduce((s, c) => s + c.width, 0);
  const headerHeight = 28;
  const cellPadX = 6;
  const cellPadY = 5;
  let y = doc.y;

  // Header
  doc.rect(startX, y, tableWidth, headerHeight).fill("#2c3e50");

  let x = startX;
  for (const col of cols) {
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#fff")
      .text(col.header, x + cellPadX, y + 8, {
        width: col.width - cellPadX * 2,
        align: col.align ?? "left",
      });
    x += col.width;
  }
  y += headerHeight;

  // Rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Dynamic row height
    let maxH = 16;
    for (let j = 0; j < cols.length && j < row.length; j++) {
      doc.fontSize(9).font("Helvetica");
      const h = doc.heightOfString(row[j], { width: cols[j].width - cellPadX * 2 });
      if (h + cellPadY * 2 > maxH) maxH = h + cellPadY * 2;
    }

    if (y + maxH > 770) {
      doc.addPage();
      y = MARGIN;
    }

    if (i % 2 === 0) {
      doc.rect(startX, y, tableWidth, maxH).fill("#f7f7f7");
    }

    x = startX;
    for (let j = 0; j < cols.length && j < row.length; j++) {
      doc.fontSize(9).font("Helvetica").fillColor("#000")
        .text(row[j], x + cellPadX, y + cellPadY, {
          width: cols[j].width - cellPadX * 2,
          align: cols[j].align ?? "left",
        });
      x += cols[j].width;
    }
    y += maxH;
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
  doc.moveDown(0.8);

  const tableWidth = 480;
  const labelX = MARGIN + tableWidth - 195;
  const valueX = MARGIN + tableWidth - 90;
  let y = doc.y;

  doc.fontSize(10).font("Helvetica").fillColor("#333");
  doc.text("Sous-total HT", labelX, y, { width: 100 });
  doc.text(`${subtotalHt} EUR`, valueX, y, { width: 90, align: "right" });

  y += 18;
  const taxLabel = taxRateLabel ? `TVA (${taxRateLabel})` : "TVA";
  doc.text(taxLabel, labelX, y, { width: 100 });
  doc.text(`${taxAmount} EUR`, valueX, y, { width: 90, align: "right" });

  y += 24;
  doc.rect(labelX - 8, y - 4, 200, 28).fill("#2c3e50");
  doc.fontSize(13).font("Helvetica-Bold").fillColor("#fff");
  doc.text("Total TTC", labelX, y + 2, { width: 100 });
  doc.text(`${totalTtc} EUR`, valueX, y + 2, { width: 90, align: "right" });

  doc.fillColor("#000");
  doc.y = y + 36;
  doc.x = MARGIN;
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
