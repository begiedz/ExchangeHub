/** Parses an amount input with a dot or comma and at most two decimal places. */
export function parseAmountInput(input: string, maxAmount: number) {
  const value = Number(input.replace(',', '.'));
  const isValid =
    /^\d+(?:[.,]\d{1,2})?$/.test(input) && value >= 0.01 && value <= maxAmount;

  return { value, isValid };
}
