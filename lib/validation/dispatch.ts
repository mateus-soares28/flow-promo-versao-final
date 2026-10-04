/** Interpret datetime-local values in Brasília time, independent of the server timezone. */
export function parseDispatchSchedule(value: string, now = new Date()): Date | null {
  if (!value) return now;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00-03:00`);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= now.getTime()) return null;
  // JavaScript normalizes invalid dates such as February 30; reject those inputs.
  const local = new Date(date.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
  return local === value ? date : null;
}
