/** Every route path in the app, in one place. */
export const routes = {
  home: '/',
  events: '/events',
  eventsUpcoming: '/events?tab=UPCOMING',
  newEvent: '/events/new',
  eventDetail: (id: string) => `/events/${id}`,
  quotations: '/quotations',
  newQuotation: '/quotations/new',
  newPayment: '/payments/new',
  newExpense: '/expenses/new',
  money: '/money',
  moneySpent: '/money?tab=accounts&tile=spent',
  more: '/more',
  notifications: '/notifications',
} as const;

/** Bottom tabs, in order. `name` is the route file in app/(tabs). */
export const TABS = [
  { name: 'index', title: 'Home', icon: 'grid' },
  { name: 'events', title: 'Events', icon: 'calendar' },
  { name: 'quotations', title: 'Quotes', icon: 'file-text' },
  { name: 'money', title: 'Money', icon: 'credit-card' },
  { name: 'more', title: 'More', icon: 'menu' },
] as const;
