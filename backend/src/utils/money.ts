export function calculateLineSubtotal(
  quantity: number,
  unitPriceHtCents: number,
): number {
  return Math.round(quantity * unitPriceHtCents);
}

export function calculateLineTax(
  lineSubtotalHtCents: number,
  taxRateBasisPoints: number,
): number {
  return Math.round((lineSubtotalHtCents * taxRateBasisPoints) / 10000);
}

export function calculateLineTotal(
  lineSubtotalHtCents: number,
  lineTaxAmountCents: number,
): number {
  return lineSubtotalHtCents + lineTaxAmountCents;
}

export function calculateTotals(
  items: {
    lineSubtotalHtCents: number;
    lineTaxAmountCents: number;
    lineTotalTtcCents: number;
  }[],
): {
  subtotalHtCents: number;
  taxAmountCents: number;
  totalTtcCents: number;
} {
  return items.reduce(
    (acc, item) => ({
      subtotalHtCents: acc.subtotalHtCents + item.lineSubtotalHtCents,
      taxAmountCents: acc.taxAmountCents + item.lineTaxAmountCents,
      totalTtcCents: acc.totalTtcCents + item.lineTotalTtcCents,
    }),
    { subtotalHtCents: 0, taxAmountCents: 0, totalTtcCents: 0 },
  );
}

export function formatCents(cents: number): string {
  const euros = Math.floor(cents / 100);
  const remaining = Math.abs(cents % 100);
  return `${euros}.${remaining.toString().padStart(2, "0")}`;
}

export function validatePaymentAmount(
  amountCents: number,
  remainingCents: number,
): boolean {
  return amountCents > 0 && amountCents <= remainingCents;
}
