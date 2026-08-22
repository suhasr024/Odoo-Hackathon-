/**
 * Reusable Working Days & Leave Duration Calculator
 * Rule: Standard HRMS policy excluding weekends (Saturday & Sunday).
 * Single shared source of truth for both calculateLeaveDuration and markLeaveAttendance.
 */

export const getWorkingDatesInRange = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return [];

  const start = new Date(startDateStr + 'T00:00:00Z');
  const end = new Date(endDateStr + 'T00:00:00Z');

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];

  const dates = [];
  let current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(current.toISOString().split('T')[0]);
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
};

export const calculateLeaveDuration = (startDateStr, endDateStr) => {
  return getWorkingDatesInRange(startDateStr, endDateStr).length;
};
