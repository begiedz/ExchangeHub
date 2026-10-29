import { parseAmountInput } from '@/lib/money';

describe('parseAmountInput', () => {
  it.each([
    ['0.01', 0.01],
    ['30,25', 30.25],
    ['100000.00', 100_000],
  ])('accepts decimal input %s', (input, value) => {
    expect(parseAmountInput(input, 100_000)).toEqual({ value, isValid: true });
  });

  it.each(['', '0', '-1', '1.001', '1e2', '1,000.00', '100000.01', ' 1 '])(
    'rejects invalid input %s',
    input => {
      expect(parseAmountInput(input, 100_000).isValid).toBe(false);
    },
  );

  it('keeps the different wallet transfer and exchange limits', () => {
    expect(parseAmountInput('1000000', 100_000).isValid).toBe(false);
    expect(parseAmountInput('1000000', 1_000_000).isValid).toBe(true);
  });
});
