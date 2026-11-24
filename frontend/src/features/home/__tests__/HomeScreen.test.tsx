import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { apiGet } from '@/api/client';
import { ApiError, NETWORK_ERROR_MESSAGE } from '@/api/errors';

import { HomeScreen } from '../HomeScreen';
import type { DashboardHome } from '../types';
import { dashboardFixture } from './fixtures';

jest.mock('@/api/client', () => ({ apiGet: jest.fn() }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useIsFocused: () => true }));

const mockedGet = jest.mocked(apiGet);
const SAFE_AREA = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const RETRY_WAIT_MS = 3000;
const WHATSAPP_URL = 'https://wa.me/919840012345?text=hi';

function respondWith(data: DashboardHome) {
  mockedGet.mockImplementation(async (path: string) => {
    if (path === '/dashboard/home') return data;
    return { phone: '+919840012345', text: 'hi', whatsappUrl: WHATSAPP_URL };
  });
}

async function renderHome() {
  // gcTime Infinity: no cache clean-up timers left running after a test.
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  return await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA}>
      <QueryClientProvider client={client}>
        <HomeScreen />
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('US03 Home', () => {
  it('US03_renders_received_state_by_default', async () => {
    respondWith(dashboardFixture());
    await renderHome();
    expect(await screen.findByText('Received · Nov')).toBeTruthy();
    expect(screen.getByText('₹1,35,000')).toBeTruthy();
    expect(screen.getByText('3 payments')).toBeTruthy();
    expect(screen.getByText('65% of ₹2,08,000 billed')).toBeTruthy();
    expect(screen.getByText('Revenue vs expenses · last 6 months')).toBeTruthy();
    expect(screen.getByText('Profit · November')).toBeTruthy();
    expect(screen.getByText('+91% vs Oct')).toBeTruthy();
    expect(screen.getByText('₹73K')).toBeTruthy();
    expect(mockedGet).toHaveBeenCalledTimes(1);
    expect(mockedGet).toHaveBeenCalledWith('/dashboard/home');
  });

  it('US03_tapping_each_mini_tile_switches_the_state', async () => {
    respondWith(dashboardFixture());
    await renderHome();
    await fireEvent.press(await screen.findByTestId('mini-tile-toCollect'));
    expect(screen.getByText('Pending by client')).toBeTruthy();
    expect(screen.getByText('₹15,000 of ₹88,000 collected')).toBeTruthy();
    expect(screen.getByText('₹73,000 still to collect from 3 clients')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('mini-tile-expenses'));
    expect(screen.getByText('Expenses · November')).toBeTruthy();
    expect(screen.getByText('3% of money received')).toBeTruthy();
    expect(screen.getByText('Salary · Karthik')).toBeTruthy();
    expect(screen.getByText("Meera's event · Salary · 3 Nov")).toBeTruthy();
    expect(screen.getByText('Transport · 5 Nov')).toBeTruthy();
    expect(screen.getByText('−₹2,000')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('mini-tile-events'));
    expect(screen.getByText('4 upcoming')).toBeTruthy();
    expect(screen.getByText('Next: Sun, 1 Nov')).toBeTruthy();
    expect(screen.getByText('1 of 4 done this month')).toBeTruthy();
    expect(screen.getByText('House Warming · 6:00 PM')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('mini-tile-received'));
    expect(screen.getByText('Received · Nov')).toBeTruthy();
  });

  it('US03_tapping_a_chart_month_shows_its_figures_without_an_api_call', async () => {
    respondWith(dashboardFixture());
    await renderHome();
    await fireEvent.press(await screen.findByTestId('chart-month-2026-10'));
    expect(screen.getByText('Oct · Received ₹97,000 · Expenses ₹28,000')).toBeTruthy();
    expect(mockedGet).toHaveBeenCalledTimes(1);
  });
});

describe('US11a Remind', () => {
  it('US11a_remind_calls_the_reminder_api_and_opens_whatsapp', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    respondWith(dashboardFixture());
    await renderHome();
    await fireEvent.press(await screen.findByTestId('mini-tile-toCollect'));
    await fireEvent.press(screen.getAllByLabelText('Remind')[0]!);
    await waitFor(() => expect(openURL).toHaveBeenCalledWith(WHATSAPP_URL));
    expect(mockedGet).toHaveBeenCalledWith('/events/ev-divya/reminder');
  });

  it('E20_remind_is_hidden_when_the_balance_is_zero', async () => {
    const data = dashboardFixture();
    const rows = data.toCollect?.byClient ?? [];
    data.toCollect = { ...data.toCollect, byClient: rows.map((r) => ({ ...r, balance: '0.00' })) };
    respondWith(data);
    await renderHome();
    await fireEvent.press(await screen.findByTestId('mini-tile-toCollect'));
    expect(screen.getByText('Divya K')).toBeTruthy();
    expect(screen.queryByLabelText('Remind')).toBeNull();
  });
});

describe('Proposed contract fields', () => {
  it('hides only the lines whose proposed fields are missing', async () => {
    const data = dashboardFixture();
    delete data.received?.paymentCount;
    delete data.toCollect?.collected;
    delete data.toCollect?.clientCount;
    delete data.expenses?.count;
    delete data.events?.upcomingCount;
    respondWith(data);
    await renderHome();

    expect(await screen.findByText('₹1,35,000')).toBeTruthy();
    expect(screen.queryByText(/payments?$/)).toBeNull();
    await fireEvent.press(screen.getByTestId('mini-tile-toCollect'));
    expect(screen.getByText('₹73,000')).toBeTruthy();
    expect(screen.queryByText(/collected$/)).toBeNull();
    expect(screen.queryByText(/\d+ clients?$/)).toBeNull();
    await fireEvent.press(screen.getByTestId('mini-tile-expenses'));
    expect(screen.queryByText(/expenses? ·/)).toBeNull();
    await fireEvent.press(screen.getByTestId('mini-tile-events'));
    expect(screen.queryByText(/upcoming$/)).toBeNull();
    expect(screen.getByText('Arun')).toBeTruthy();
    expect(screen.queryByText(/undefined/)).toBeNull();
  });
});

describe('States', () => {
  it('shows "You\'re not signed in." on 401', async () => {
    mockedGet.mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', "You're not signed in."));
    await renderHome();
    expect(await screen.findByText("You're not signed in.")).toBeTruthy();
    expect(screen.queryByText('Try again')).toBeNull();
  });

  it('shows the error with Try again, which refetches', async () => {
    mockedGet.mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', NETWORK_ERROR_MESSAGE));
    await renderHome();
    // The hook retries a failed load once (not on 401) before showing the error.
    expect(
      await screen.findByText(NETWORK_ERROR_MESSAGE, {}, { timeout: RETRY_WAIT_MS }),
    ).toBeTruthy();
    expect(mockedGet).toHaveBeenCalledTimes(2);
    respondWith(dashboardFixture());
    await fireEvent.press(screen.getByText('Try again'));
    expect(await screen.findByText('Received · Nov')).toBeTruthy();
  });

  it('shows a skeleton while loading', async () => {
    mockedGet.mockReturnValue(new Promise(() => undefined));
    await renderHome();
    expect(screen.getByTestId('home-skeleton')).toBeTruthy();
  });

  it('shows the empty texts', async () => {
    const data = dashboardFixture();
    data.toCollect = { ...data.toCollect, byClient: [] };
    data.expenses = { ...data.expenses, recent: [] };
    data.events = { ...data.events, upcoming: [] };
    respondWith(data);
    await renderHome();
    await fireEvent.press(await screen.findByTestId('mini-tile-toCollect'));
    expect(screen.getByText('No payments to collect')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('mini-tile-expenses'));
    expect(screen.getByText('No expenses this month')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('mini-tile-events'));
    expect(screen.getByText('No upcoming events')).toBeTruthy();
  });
});
