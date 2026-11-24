const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const HOURS_IN_HALF_DAY = 12;

/** Reads an API date ("2026-11-01") as a calendar day, with no time-zone shift. */
function parseDay(isoDate: string): Date {
  const [year = 0, month = 1, day = 1] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function parts(isoDate: string) {
  const d = parseDay(isoDate);
  return {
    weekday: WEEKDAYS[d.getDay()] ?? '',
    day: d.getDate(),
    month: MONTHS_SHORT[d.getMonth()] ?? '',
    year: d.getFullYear(),
  };
}

/** Sun, 1 Nov 2026 */
export function formatDate(isoDate: string): string {
  const p = parts(isoDate);
  return `${p.weekday}, ${p.day} ${p.month} ${p.year}`;
}

/** Sun, 1 Nov */
export function formatDateNoYear(isoDate: string): string {
  const p = parts(isoDate);
  return `${p.weekday}, ${p.day} ${p.month}`;
}

/** Sun 13 Dec */
export function formatDateShort(isoDate: string): string {
  const p = parts(isoDate);
  return `${p.weekday} ${p.day} ${p.month}`;
}

/** 3 Nov */
export function formatDayMonth(isoDate: string): string {
  const p = parts(isoDate);
  return `${p.day} ${p.month}`;
}

/** { weekday: "SUN", day: "1" } for the date block. */
export function dateBlockParts(isoDate: string): { weekday: string; day: string } {
  const p = parts(isoDate);
  return { weekday: p.weekday.toUpperCase(), day: String(p.day) };
}

/** "19:00" → "7:00 PM" */
export function formatTime(time: string): string {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  const suffix = hours >= HOURS_IN_HALF_DAY ? 'PM' : 'AM';
  const hour12 = hours % HOURS_IN_HALF_DAY === 0 ? HOURS_IN_HALF_DAY : hours % HOURS_IN_HALF_DAY;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function monthIndex(yearMonth: string): number {
  return Number(yearMonth.split('-')[1] ?? 1) - 1;
}

/** "2026-11" → "November" */
export function monthName(yearMonth: string): string {
  return MONTHS_LONG[monthIndex(yearMonth)] ?? '';
}

/** "2026-11" → "Nov" */
export function monthShort(yearMonth: string): string {
  return MONTHS_SHORT[monthIndex(yearMonth)] ?? '';
}

/** "2026-11" → "Oct"; "2026-01" → "Dec" */
export function previousMonthShort(yearMonth: string): string {
  return MONTHS_SHORT[(monthIndex(yearMonth) + 11) % 12] ?? '';
}
