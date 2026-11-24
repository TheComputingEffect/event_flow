import type { DashboardHome } from '../types';

/** Test-only response shaped like design pages 2, 16, 17 and 18. */
export function dashboardFixture(): DashboardHome {
  return {
    month: '2026-11',
    profit: { profitSoFar: '131500.00', expectedProfit: '160000.00', changeVsLastMonthPct: 91.2 },
    received: { amount: '135000.00', billed: '208000.00', percentOfBilled: 65, paymentCount: 3 },
    toCollect: {
      amount: '73000.00',
      collected: '15000.00',
      billed: '88000.00',
      clientCount: 3,
      byClient: [
        {
          eventId: 'ev-divya',
          clientName: 'Divya K',
          eventName: 'Engagement',
          eventDate: '2026-12-13',
          balance: '45000.00',
          received: '0.00',
          agreed: '45000.00',
        },
        {
          eventId: 'ev-arun',
          clientName: 'Arun',
          eventName: 'House Warming',
          eventDate: '2026-11-01',
          balance: '15000.00',
          received: '10000.00',
          agreed: '25000.00',
        },
      ],
    },
    expenses: {
      amount: '3500.00',
      count: 2,
      recent: [
        {
          id: 'ex-1',
          category: { id: 'c1', name: 'Salary' },
          amount: '2000.00',
          spentOn: '2026-11-03',
          crewMemberName: 'Karthik',
          eventClientName: 'Meera',
          source: 'SALARY',
        },
        {
          id: 'ex-2',
          category: { id: 'c2', name: 'Transport' },
          amount: '1500.00',
          spentOn: '2026-11-05',
          note: 'Van hire',
          eventClientName: null,
          crewMemberName: null,
          source: 'MANUAL',
        },
      ],
    },
    events: {
      thisMonth: 4,
      done: 1,
      upcomingCount: 4,
      upcoming: [
        {
          id: 'ev-arun',
          client: { id: 'cl-1', name: 'Arun', mobile: '+919840012345' },
          eventType: 'House Warming',
          startDate: '2026-11-01',
          startTime: '18:00',
        },
        {
          id: 'ev-meera',
          client: { id: 'cl-2', name: 'Meera Nair', mobile: '+919840012346' },
          eventType: 'Wedding Reception',
          startDate: '2026-11-28',
          startTime: '19:00',
        },
      ],
    },
    chart: [
      { month: '2026-06', received: '60000.00', expenses: '18000.00' },
      { month: '2026-07', received: '47000.00', expenses: '14000.00' },
      { month: '2026-08', received: '85000.00', expenses: '25000.00' },
      { month: '2026-09', received: '53000.00', expenses: '16000.00' },
      { month: '2026-10', received: '97000.00', expenses: '28000.00' },
      { month: '2026-11', received: '135000.00', expenses: '3500.00' },
    ],
    unreadNotifications: 3,
  };
}
