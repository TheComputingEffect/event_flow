import { Decimal } from 'decimal.js';

import type { MonthPoint } from './types';

const LAKH = new Decimal(1_00_000);
const GRID_STEPS = 3;

/** Y-axis step in rupees: whole lakhs, so 3 gridlines cover the largest bar (₹1L/₹2L/₹3L in the design). */
export function axisStep(points: readonly MonthPoint[]): Decimal {
  const values = points.flatMap((p) => [p.received ?? '0', p.expenses ?? '0']);
  const max = Decimal.max(0, ...values);
  const lakhsPerStep = Decimal.max(1, max.div(LAKH).div(GRID_STEPS).ceil());
  return lakhsPerStep.times(LAKH);
}

/** Gridline values from top to bottom, as Money strings: ["300000.00", "200000.00", "100000.00", "0.00"]. */
export function axisTicks(step: Decimal): string[] {
  return Array.from({ length: GRID_STEPS + 1 }, (_, i) => step.times(GRID_STEPS - i).toFixed(2));
}

/** Bar height as a display-only percent of the axis top. */
export function barPercent(value: string | undefined, step: Decimal): number {
  const top = step.times(GRID_STEPS);
  return new Decimal(value ?? '0').div(top).times(100).toDecimalPlaces(1).toNumber();
}
