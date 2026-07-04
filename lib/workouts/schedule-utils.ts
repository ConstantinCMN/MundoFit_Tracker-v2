export const SCHEDULE_LENGTH_DAYS = 14;

export function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// `dateOnly` is a DATE column value ('YYYY-MM-DD'); appending a local-midnight
// time avoids `new Date()` parsing it as UTC and shifting a day in negative
// UTC-offset timezones.
export function parseDateOnly(dateOnly: string): Date {
  return new Date(`${dateOnly}T00:00:00`);
}

// Which day_index (0-13) of the schedule corresponds to today, or null if
// today falls outside the 14-day window.
export function getTodayDayIndex(startDate: string, today: Date = new Date()): number | null {
  const start = parseDateOnly(startDate);
  start.setHours(0, 0, 0, 0);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const diffDays = Math.round((t.getTime() - start.getTime()) / 86_400_000);
  return diffDays >= 0 && diffDays < SCHEDULE_LENGTH_DAYS ? diffDays : null;
}
