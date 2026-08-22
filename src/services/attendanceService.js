import { storageAdapter } from './storage/storageAdapter';
import { generateInitialAttendance, INITIAL_USERS } from '../data/mockData';
import { evaluateAttendanceStatus } from '../config/attendanceRules';
import { getWorkingDatesInRange } from '../utils/durationCalculator';

const ATTENDANCE_HISTORY_KEY = 'attendance_records_';
const TODAY_SESSION_KEY = 'attendance_today_session_';
const USERS_KEY = 'users_db';

const getTodayDateStr = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const getAttendanceSortTimestamp = (r) => {
  if (r.checkIn) {
    const t = new Date(r.checkIn).getTime();
    if (!isNaN(t)) return t;
  }
  if (r.checkOut) {
    const t = new Date(r.checkOut).getTime();
    if (!isNaN(t)) return t;
  }
  if (r.date) {
    const t = new Date(r.date + 'T00:00:00').getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
};

export const sortAttendanceRecordsNewestFirst = (records) => {
  return [...records].sort((a, b) => {
    const timeA = getAttendanceSortTimestamp(a);
    const timeB = getAttendanceSortTimestamp(b);
    if (timeB !== timeA) return timeB - timeA;
    return (b.id || '').localeCompare(a.id || '');
  });
};

export const attendanceService = {
  async initUserAttendance(userId) {
    const key = `${ATTENDANCE_HISTORY_KEY}${userId}`;
    let records = await storageAdapter.get(key);
    if (!records || !Array.isArray(records)) {
      records = generateInitialAttendance(userId);
      await storageAdapter.set(key, records);
    }
    return records;
  },

  async getTodaySession(userId) {
    const todayStr = getTodayDateStr();
    const sessionKey = `${TODAY_SESSION_KEY}${userId}_${todayStr}`;
    let session = await storageAdapter.get(sessionKey);
    
    if (!session) {
      const history = await this.initUserAttendance(userId);
      const todayRecord = history.find(r => r.date === todayStr);
      if (todayRecord && todayRecord.checkIn) {
        session = {
          date: todayStr,
          status: todayRecord.checkOut ? 'COMPLETED' : 'CHECKED_IN',
          checkInTime: todayRecord.checkIn,
          checkOutTime: todayRecord.checkOut,
          totalHours: todayRecord.totalHours
        };
        await storageAdapter.set(sessionKey, session);
      } else {
        session = {
          date: todayStr,
          status: 'NOT_CHECKED_IN',
          checkInTime: null,
          checkOutTime: null,
          totalHours: null
        };
      }
    }
    return session;
  },

  async checkIn(userId) {
    const todayStr = getTodayDateStr();
    const currentSession = await this.getTodaySession(userId);

    if (currentSession.status === 'CHECKED_IN') {
      throw new Error('You are already checked in for today.');
    }
    if (currentSession.status === 'COMPLETED') {
      throw new Error('You have already completed your attendance for today.');
    }

    const checkInTime = new Date().toISOString();
    const sessionKey = `${TODAY_SESSION_KEY}${userId}_${todayStr}`;

    const newSession = {
      date: todayStr,
      status: 'CHECKED_IN',
      checkInTime: checkInTime,
      checkOutTime: null,
      totalHours: null
    };

    await storageAdapter.set(sessionKey, newSession);

    const historyKey = `${ATTENDANCE_HISTORY_KEY}${userId}`;
    const history = await this.initUserAttendance(userId);
    const existingIndex = history.findIndex(r => r.date === todayStr);

    const status = evaluateAttendanceStatus(checkInTime, null);
    const record = {
      id: `att_${todayStr}_${userId}`,
      userId,
      date: todayStr,
      checkIn: checkInTime,
      checkOut: null,
      totalHours: '--',
      status: status
    };

    if (existingIndex >= 0) {
      history[existingIndex] = record;
    } else {
      history.unshift(record);
    }
    await storageAdapter.set(historyKey, history);

    return newSession;
  },

  async checkOut(userId) {
    const todayStr = getTodayDateStr();
    const currentSession = await this.getTodaySession(userId);

    if (currentSession.status === 'NOT_CHECKED_IN') {
      throw new Error('Cannot check out before checking in.');
    }
    if (currentSession.status === 'COMPLETED') {
      throw new Error('You have already checked out for today.');
    }

    const checkOutTime = new Date().toISOString();
    const checkInDate = new Date(currentSession.checkInTime);
    const checkOutDate = new Date(checkOutTime);
    const diffMs = checkOutDate - checkInDate;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const totalHoursStr = `${diffHours}h ${diffMins}m`;

    const sessionKey = `${TODAY_SESSION_KEY}${userId}_${todayStr}`;
    const completedSession = {
      date: todayStr,
      status: 'COMPLETED',
      checkInTime: currentSession.checkInTime,
      checkOutTime: checkOutTime,
      totalHours: totalHoursStr
    };
    await storageAdapter.set(sessionKey, completedSession);

    const historyKey = `${ATTENDANCE_HISTORY_KEY}${userId}`;
    const history = await this.initUserAttendance(userId);
    const recordIndex = history.findIndex(r => r.date === todayStr);

    const evaluatedStatus = evaluateAttendanceStatus(currentSession.checkInTime, checkOutTime);
    if (recordIndex >= 0) {
      history[recordIndex] = {
        ...history[recordIndex],
        checkOut: checkOutTime,
        totalHours: totalHoursStr,
        status: evaluatedStatus
      };
    } else {
      history.unshift({
        id: `att_${todayStr}_${userId}`,
        userId,
        date: todayStr,
        checkIn: currentSession.checkInTime,
        checkOut: checkOutTime,
        totalHours: totalHoursStr,
        status: evaluatedStatus
      });
    }
    await storageAdapter.set(historyKey, history);

    return completedSession;
  },

  /**
   * Upsert attendance records for an approved leave date range using shared getWorkingDatesInRange.
   * Guard: If employee already has real checkIn data for a date, preserves checkIn/checkOut and sets status to 'Half Day' (partial attendance).
   * Does NOT erase existing timestamps under any circumstance.
   */
  async markLeaveAttendance(userId, startDateStr, endDateStr, leaveTypeName = 'Leave') {
    const historyKey = `${ATTENDANCE_HISTORY_KEY}${userId}`;
    const history = await this.initUserAttendance(userId);

    const workingDates = getWorkingDatesInRange(startDateStr, endDateStr);

    for (const dateStr of workingDates) {
      const existingIndex = history.findIndex(r => r.date === dateStr);

      if (existingIndex >= 0) {
        const existing = history[existingIndex];
        if (existing.checkIn) {
          history[existingIndex] = {
            ...existing,
            status: 'Half Day'
          };
        } else {
          history[existingIndex] = {
            ...existing,
            checkIn: null,
            checkOut: null,
            totalHours: '0h 0m',
            status: 'On Leave'
          };
        }
      } else {
        history.push({
          id: `att_${dateStr}_${userId}`,
          userId,
          date: dateStr,
          checkIn: null,
          checkOut: null,
          totalHours: '0h 0m',
          status: 'On Leave'
        });
      }
    }

    history.sort((a, b) => getAttendanceSortTimestamp(b) - getAttendanceSortTimestamp(a));
    await storageAdapter.set(historyKey, history);
    return history;
  },

  async getAttendanceHistory(userId, year, month) {
    const history = await this.initUserAttendance(userId);
    
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const prefix = `${year}-${monthStr}`;

    const filtered = history.filter(r => r.date.startsWith(prefix));
    const sorted = sortAttendanceRecordsNewestFirst(filtered);

    const presentCount = sorted.filter(r => r.status === 'Present').length;
    const lateCount = sorted.filter(r => r.status === 'Late').length;
    const absentCount = sorted.filter(r => r.status === 'Absent').length;
    const leaveCount = sorted.filter(r => r.status === 'On Leave' || r.status === 'Half Day').length;

    return {
      records: sorted,
      stats: {
        totalDays: sorted.length,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        leaves: leaveCount
      }
    };
  },

  async getAllAttendanceRecords(year, month, filters = {}) {
    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const prefix = `${year}-${monthStr}`;

    let combinedRecords = [];

    for (const u of users) {
      const records = await this.initUserAttendance(u.id);
      const userMonthRecords = records.filter(r => r.date.startsWith(prefix));
      for (const r of userMonthRecords) {
        combinedRecords.push({
          ...r,
          userName: u.name,
          employeeId: u.employeeId,
          userDepartment: u.department,
          userAvatar: u.avatar
        });
      }
    }

    // Sort newest actual event timestamp first
    combinedRecords = sortAttendanceRecordsNewestFirst(combinedRecords);

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      combinedRecords = combinedRecords.filter(r =>
        r.userName?.toLowerCase().includes(q) ||
        r.employeeId?.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      combinedRecords = combinedRecords.filter(r => r.status === filters.status);
    }

    const presentCount = combinedRecords.filter(r => r.status === 'Present').length;
    const lateCount = combinedRecords.filter(r => r.status === 'Late').length;
    const absentCount = combinedRecords.filter(r => r.status === 'Absent').length;
    const leaveCount = combinedRecords.filter(r => r.status === 'On Leave' || r.status === 'Half Day').length;

    return {
      records: combinedRecords,
      stats: {
        totalDays: combinedRecords.length,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        leaves: leaveCount
      }
    };
  }
};
