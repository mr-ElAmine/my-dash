type QuoteItem = {
  quantity: string | number;
  unitPrice: string | number;
  taxRate: string | number;
};

export function calculateQuoteTotals(items: QuoteItem[]) {
  let subtotal = 0;
  let tax = 0;

  for (const item of items) {
    const lineHt = Number(item.quantity) * Number(item.unitPrice);
    const lineTax = lineHt * Number(item.taxRate) / 100;

    subtotal += lineHt;
    tax += lineTax;
  }

  return { subtotal, tax, total: subtotal + tax };
}
