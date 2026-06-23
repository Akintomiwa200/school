export function buildDateTime(baseDate: Date, hours: number, minutes: number): Date {
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function isWithinScheduleWindow(now: Date, startsAt: Date, endsAt: Date): boolean {
  const time = now.getTime();
  return time >= startsAt.getTime() && time < endsAt.getTime();
}

export function getActiveScheduleItemId<T extends { id: string; startsAt: Date; endsAt: Date }>(
  items: readonly T[],
  now: Date,
): string | null {
  const active = items.find((item) => isWithinScheduleWindow(now, item.startsAt, item.endsAt));
  return active?.id ?? null;
}

export function formatScheduleTimeRange(start: Date, end: Date): string {
  const formatClock = (date: Date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const period = end.getHours() >= 12 ? "PM" : "AM";
  return `${formatClock(start)} - ${formatClock(end)} ${period}`;
}

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
