/**
 * Reusable Leave Duration Calculator
 * Rule: Inclusive calendar days by default ((endDate - startDate) + 1).
 * Extensible for future weekend/holiday exclusions.
 */
export const calculateLeaveDuration = (startDateStr, endDateStr, options = {}) => {
  if (!startDateStr || !endDateStr) return 0;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end < start) return 0;

  // Calculate inclusive calendar days (normalized to UTC dates)
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  let totalDays = Math.floor((utcEnd - utcStart) / msPerDay) + 1;

  if (options.excludeWeekends) {
    let workingDays = 0;
    let current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    totalDays = workingDays;
  }

  return Math.max(0, totalDays);
};
