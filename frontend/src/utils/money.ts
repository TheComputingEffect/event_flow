import { Decimal } from 'decimal.js';

const RUPEE = '₹';
const MINUS = '−';
const COMPACT_FROM = new Decimal(10_000);
const THOUSAND = new Decimal(1_000);
const LAKH = new Decimal(1_00_000);
const CRORE = new Decimal(1_00_00_000);

/** Groups digits the Indian way: 1234567 → 12,34,567. */
function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${lastThree}`;
}

function withSign(value: Decimal, body: string): string {
  return value.isNegative() && !value.isZero() ? `${MINUS}${RUPEE}${body}` : `${RUPEE}${body}`;
}

/** ₹1,35,000 · ₹1,234.50 · −₹2,000. Paise are shown only when not zero. */
export function formatMoney(amount: string): string {
  const value = new Decimal(amount);
  const [whole = '0', paise = '00'] = value.abs().toFixed(2).split('.');
  const body = paise === '00' ? groupIndian(whole) : `${groupIndian(whole)}.${paise}`;
  return withSign(value, body);
}

function compactUnit(abs: Decimal, unit: Decimal, places: number, suffix: string): string {
  return `${abs.div(unit).toDecimalPlaces(places, Decimal.ROUND_HALF_UP).toString()}${suffix}`;
}

/** ₹73K · ₹1.35L · ₹1.2Cr from ₹10,000 up; below that the full format (₹3,500). */
export function formatMoneyCompact(amount: string): string {
  const value = new Decimal(amount);
  const abs = value.abs();
  if (abs.lessThan(COMPACT_FROM)) return formatMoney(amount);
  const roundsToLakh = abs.div(THOUSAND).toDecimalPlaces(1, Decimal.ROUND_HALF_UP).gte(100);
  let body: string;
  if (abs.gte(CRORE)) body = compactUnit(abs, CRORE, 2, 'Cr');
  else if (abs.gte(LAKH) || roundsToLakh) body = compactUnit(abs, LAKH, 2, 'L');
  else body = compactUnit(abs, THOUSAND, 1, 'K');
  return withSign(value, body);
}

/** Display-only ratio for progress bars and "x%" text: part ÷ whole × 100, 0–100, whole number. */
export function ratioPercent(part: string, whole: string): number {
  const total = new Decimal(whole);
  if (total.lte(0)) return 0;
  const pct = new Decimal(part).div(total).times(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  return Decimal.min(Decimal.max(pct, 0), 100).toNumber();
}

/** True when the amount is more than zero (E-20: no Remind for a ₹0 balance). */
export function isPositiveMoney(amount: string): boolean {
  return new Decimal(amount).greaterThan(0);
}

/** Money going out, shown with a minus: "2000.00" → "−₹2,000". */
export function formatMoneyOut(amount: string): string {
  return formatMoney(new Decimal(amount).abs().neg().toFixed(2));
}
