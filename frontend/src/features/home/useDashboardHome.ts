import { useQuery } from '@tanstack/react-query';
import { useIsFocused } from 'expo-router';

import { apiGet } from '@/api/client';
import { isUnauthorized } from '@/api/errors';

import type { DashboardHome } from './types';

export const DASHBOARD_HOME_KEY = ['dashboard', 'home'] as const;
const STALE_TIME_MS = 30_000;
const MAX_RETRIES = 1;

function shouldRetry(failureCount: number, error: Error): boolean {
  return !isUnauthorized(error) && failureCount < MAX_RETRIES;
}

/**
 * Home's one API call (no `month`, so the server uses the current month).
 * Re-subscribing when the screen regains focus refetches only if the data is stale.
 */
export function useDashboardHome() {
  const isFocused = useIsFocused();
  return useQuery({
    queryKey: DASHBOARD_HOME_KEY,
    queryFn: () => apiGet<DashboardHome>('/dashboard/home'),
    staleTime: STALE_TIME_MS,
    retry: shouldRetry,
    subscribed: isFocused,
  });
}
