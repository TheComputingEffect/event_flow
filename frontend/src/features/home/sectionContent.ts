import { routes } from '@/navigation/routes';
import { formatDateNoYear, monthName, monthShort } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import { countLabel } from '@/utils/text';

import type { BalanceDueRow, DashboardHome, EventSummary, Expense, TileKey } from './types';

export type SectionItem =
  | { kind: 'client'; key: string; row: BalanceDueRow }
  | { kind: 'expense'; key: string; expense: Expense }
  | { kind: 'event'; key: string; event: EventSummary };

export type SectionView = {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string; chevron: boolean };
  items: SectionItem[];
  emptyText?: string;
};

function receivedSection(d: DashboardHome): SectionView {
  return {
    title: 'Revenue vs expenses · last 6 months',
    subtitle: d.month ? `${monthShort(d.month)} highlighted · tap a month for details` : undefined,
    items: [],
  };
}

function toCollectSection(d: DashboardHome): SectionView {
  const t = d.toCollect;
  const rows = t?.byClient ?? [];
  const hasSummary = t?.amount !== undefined && t.clientCount !== undefined;
  return {
    title: 'Pending by client',
    subtitle: hasSummary
      ? `${formatMoney(t.amount ?? '0')} still to collect from ${countLabel(t.clientCount ?? 0, 'client')}`
      : undefined,
    items: rows.map((row, i) => ({ kind: 'client', key: row.eventId ?? `client-${i}`, row })),
    emptyText: 'No payments to collect',
  };
}

function expensesSection(d: DashboardHome): SectionView {
  const e = d.expenses;
  const hasSummary = e?.count !== undefined && e.amount !== undefined;
  return {
    title: d.month ? `Expenses · ${monthName(d.month)}` : 'Expenses',
    subtitle: hasSummary
      ? `${countLabel(e.count ?? 0, 'expense')} · ${formatMoney(e.amount ?? '0')} in total`
      : undefined,
    action: { label: 'See all', href: routes.moneySpent, chevron: false },
    items: (e?.recent ?? []).map((expense, i) => ({
      kind: 'expense',
      key: expense.id ?? `expense-${i}`,
      expense,
    })),
    emptyText: 'No expenses this month',
  };
}

function eventsSection(d: DashboardHome): SectionView {
  const upcoming = d.events?.upcoming ?? [];
  const count = d.events?.upcomingCount;
  const next = upcoming[0]?.startDate;
  return {
    title: 'Upcoming events',
    subtitle:
      count !== undefined && next
        ? `${count} upcoming · next on ${formatDateNoYear(next)}`
        : undefined,
    action: { label: 'See all', href: routes.eventsUpcoming, chevron: true },
    items: upcoming.map((event, i) => ({ kind: 'event', key: event.id ?? `event-${i}`, event })),
    emptyText: 'No upcoming events',
  };
}

const SECTIONS: Record<TileKey, (d: DashboardHome) => SectionView> = {
  received: receivedSection,
  toCollect: toCollectSection,
  expenses: expensesSection,
  events: eventsSection,
};

export function sectionView(data: DashboardHome, tile: TileKey): SectionView {
  return SECTIONS[tile](data);
}
