export function isLastDayOfMonthNow(): boolean {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return tomorrow.getMonth() !== now.getMonth();
}

export function isAfterReminderHour(hour = 21): boolean {
  return new Date().getHours() >= hour;
}

export function currentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
