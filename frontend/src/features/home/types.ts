import type { Schemas } from '@/api/types';

export type DashboardHome = Schemas['DashboardHome'];
export type BalanceDueRow = Schemas['BalanceDueRow'];
export type Expense = Schemas['Expense'];
export type EventSummary = Schemas['EventSummary'];
export type MonthPoint = Schemas['MonthPoint'];
export type ReminderMessage = Schemas['ReminderMessage'];

/** The four Home tiles, in the order the mini tiles show them. */
export const TILE_ORDER = ['received', 'toCollect', 'expenses', 'events'] as const;
export type TileKey = (typeof TILE_ORDER)[number];
export const DEFAULT_TILE: TileKey = 'received';
