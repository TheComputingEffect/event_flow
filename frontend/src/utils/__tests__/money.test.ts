import { formatMoney, formatMoneyCompact, isPositiveMoney, ratioPercent } from '../money';

describe('formatMoney', () => {
  it('uses Indian grouping', () => {
    expect(formatMoney('135000.00')).toBe('₹1,35,000');
    expect(formatMoney('208000.00')).toBe('₹2,08,000');
    expect(formatMoney('12345678.00')).toBe('₹1,23,45,678');
    expect(formatMoney('3500.00')).toBe('₹3,500');
    expect(formatMoney('999.00')).toBe('₹999');
    expect(formatMoney('0.00')).toBe('₹0');
  });

  it('keeps paise only when not zero', () => {
    expect(formatMoney('1234.50')).toBe('₹1,234.50');
  });

  it('shows negatives with a minus sign before ₹', () => {
    expect(formatMoney('-2000.00')).toBe('−₹2,000');
    expect(formatMoney('-0.00')).toBe('₹0');
  });
});

describe('formatMoneyCompact', () => {
  it('uses the full format below ₹10,000', () => {
    expect(formatMoneyCompact('3500.00')).toBe('₹3,500');
    expect(formatMoneyCompact('9999.00')).toBe('₹9,999');
  });

  it('uses K, L and Cr from ₹10,000 up', () => {
    expect(formatMoneyCompact('10000.00')).toBe('₹10K');
    expect(formatMoneyCompact('73000.00')).toBe('₹73K');
    expect(formatMoneyCompact('73500.00')).toBe('₹73.5K');
    expect(formatMoneyCompact('135000.00')).toBe('₹1.35L');
    expect(formatMoneyCompact('100000.00')).toBe('₹1L');
    expect(formatMoneyCompact('12000000.00')).toBe('₹1.2Cr');
  });

  it('moves to L when K would round to 100', () => {
    expect(formatMoneyCompact('99990.00')).toBe('₹1L');
  });

  it('handles negatives', () => {
    expect(formatMoneyCompact('-135000.00')).toBe('−₹1.35L');
  });
});

describe('ratioPercent', () => {
  it('returns a rounded whole percentage', () => {
    expect(ratioPercent('3500.00', '135000.00')).toBe(3);
    expect(ratioPercent('15000.00', '88000.00')).toBe(17);
  });

  it('is 0 when the whole is zero and caps at 100', () => {
    expect(ratioPercent('100.00', '0.00')).toBe(0);
    expect(ratioPercent('200.00', '100.00')).toBe(100);
  });
});

describe('isPositiveMoney', () => {
  it('is true only above zero', () => {
    expect(isPositiveMoney('0.00')).toBe(false);
    expect(isPositiveMoney('-1.00')).toBe(false);
    expect(isPositiveMoney('0.01')).toBe(true);
  });
});
