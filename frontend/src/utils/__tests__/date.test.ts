import {
  dateBlockParts,
  formatDate,
  formatDateNoYear,
  formatDateShort,
  formatDayMonth,
  formatTime,
  monthName,
  monthShort,
  previousMonthShort,
} from '../date';

describe('dates', () => {
  it('formats the full date', () => {
    expect(formatDate('2026-11-01')).toBe('Sun, 1 Nov 2026');
  });

  it('formats the short forms', () => {
    expect(formatDateNoYear('2026-11-01')).toBe('Sun, 1 Nov');
    expect(formatDateShort('2026-12-13')).toBe('Sun 13 Dec');
    expect(formatDayMonth('2026-11-03')).toBe('3 Nov');
    expect(dateBlockParts('2026-11-28')).toEqual({ weekday: 'SAT', day: '28' });
  });

  it('formats months', () => {
    expect(monthName('2026-11')).toBe('November');
    expect(monthShort('2026-11')).toBe('Nov');
    expect(previousMonthShort('2026-11')).toBe('Oct');
    expect(previousMonthShort('2026-01')).toBe('Dec');
  });
});

describe('times', () => {
  it('formats 12-hour times', () => {
    expect(formatTime('18:00')).toBe('6:00 PM');
    expect(formatTime('19:00')).toBe('7:00 PM');
    expect(formatTime('11:00')).toBe('11:00 AM');
    expect(formatTime('00:05')).toBe('12:05 AM');
    expect(formatTime('12:30')).toBe('12:30 PM');
  });
});
