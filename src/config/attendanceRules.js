/**
 * Configurable Attendance Rules
 * Can be replaced by backend policy / company settings.
 */
export const ATTENDANCE_RULES = {
  standardWorkHours: 8,
  expectedCheckInTime: "09:00",
  lateThresholdMinutes: 15,
  halfDayWorkHours: 4,
  overtimeThresholdHours: 9
};

export const evaluateAttendanceStatus = (checkInTime, checkOutTime) => {
  if (!checkInTime) return 'Absent';
  
  const checkInDate = new Date(checkInTime);
  const hours = checkInDate.getHours();
  const minutes = checkInDate.getMinutes();
  
  // Rule: Check-in after 9:15 AM considered Late
  const [expectedH, expectedM] = ATTENDANCE_RULES.expectedCheckInTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const thresholdMinutes = expectedH * 60 + expectedM + ATTENDANCE_RULES.lateThresholdMinutes;

  if (totalMinutes > thresholdMinutes) {
    return 'Late';
  }
  return 'Present';
};
