const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SEQ_LENGTH = 8;

function randomSeq(): string {
  let seq = "";
  for (let i = 0; i < SEQ_LENGTH; i++) {
    seq += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return seq;
}

export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  return `DEV-${year}-${randomSeq()}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  return `FAC-${year}-${randomSeq()}`;
}

export function isExpired(date: Date): boolean {
  return date < new Date();
}
