import { formatDateNoYear, monthShort } from '@/utils/date';
import { formatMoney, formatMoneyCompact, isPositiveMoney, ratioPercent } from '@/utils/money';
import { countLabel } from '@/utils/text';

import type { DashboardHome, TileKey } from './types';

/** What the selected-tile card shows. Any part may be missing when the API has no data for it. */
export type TileView = {
  label: string;
  pill?: string;
  headline?: string;
  barPercent?: number;
  subtitle?: string;
};

const money = (v?: string) => (v === undefined ? undefined : formatMoney(v));
const withMonth = (label: string, month?: string) =>
  month ? `${label} · ${monthShort(month)}` : label;

function receivedView(d: DashboardHome): TileView {
  const r = d.received;
  const pct = r?.percentOfBilled;
  return {
    label: withMonth('Received', d.month),
    pill: r?.paymentCount === undefined ? undefined : countLabel(r.paymentCount, 'payment'),
    headline: money(r?.amount),
    barPercent: pct === undefined ? undefined : Math.round(pct),
    subtitle:
      pct === undefined || !r?.billed
        ? undefined
        : `${Math.round(pct)}% of ${formatMoney(r.billed)} billed`,
  };
}

function toCollectView(d: DashboardHome): TileView {
  const t = d.toCollect;
  const collected = t?.collected;
  const billed = t?.billed;
  const hasTotals = collected !== undefined && billed !== undefined;
  return {
    label: 'To collect',
    pill: t?.clientCount === undefined ? undefined : countLabel(t.clientCount, 'client'),
    headline: money(t?.amount),
    barPercent: hasTotals ? ratioPercent(collected, billed) : undefined,
    subtitle: hasTotals
      ? `${formatMoney(collected)} of ${formatMoney(billed)} collected`
      : undefined,
  };
}

function expensesView(d: DashboardHome): TileView {
  const spent = d.expenses?.amount;
  const received = d.received?.amount;
  const showRatio = spent !== undefined && received !== undefined && isPositiveMoney(received);
  const pct = showRatio ? ratioPercent(spent, received) : undefined;
  const count = d.expenses?.count;
  return {
    label: withMonth('Expenses', d.month),
    pill: count === undefined ? undefined : countLabel(count, 'expense'),
    headline: money(spent),
    barPercent: pct,
    subtitle: pct === undefined ? undefined : `${pct}% of money received`,
  };
}

function eventsView(d: DashboardHome): TileView {
  const e = d.events;
  const next = e?.upcoming?.[0]?.startDate;
  const hasProgress = e?.done !== undefined && e?.thisMonth !== undefined;
  return {
    label: 'Events',
    pill: next ? `Next: ${formatDateNoYear(next)}` : undefined,
    headline: e?.upcomingCount === undefined ? undefined : `${e.upcomingCount} upcoming`,
    barPercent: hasProgress ? ratioPercent(String(e.done), String(e.thisMonth)) : undefined,
    subtitle: hasProgress ? `${e.done} of ${e.thisMonth} done this month` : undefined,
  };
}

const VIEWS: Record<TileKey, (d: DashboardHome) => TileView> = {
  received: receivedView,
  toCollect: toCollectView,
  expenses: expensesView,
  events: eventsView,
};

export function tileView(data: DashboardHome, tile: TileKey): TileView {
  return VIEWS[tile](data);
}

export const TILE_LABELS: Record<TileKey, string> = {
  received: 'Received',
  toCollect: 'To collect',
  expenses: 'Expenses',
  events: 'Events',
};

/** Value in a mini tile: compact money, or the upcoming count for Events. */
export function miniTileValue(data: DashboardHome, tile: TileKey): string | undefined {
  const compact = (v?: string) => (v === undefined ? undefined : formatMoneyCompact(v));
  if (tile === 'received') return compact(data.received?.amount);
  if (tile === 'toCollect') return compact(data.toCollect?.amount);
  if (tile === 'expenses') return compact(data.expenses?.amount);
  const count = data.events?.upcomingCount;
  return count === undefined ? undefined : String(count);
}
