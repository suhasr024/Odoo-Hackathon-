import { storageAdapter } from './storage/storageAdapter';
import { generateInitialAttendance } from '../data/mockData';
import { evaluateAttendanceStatus } from '../config/attendanceRules';

const ATTENDANCE_HISTORY_KEY = 'attendance_records_';
const TODAY_SESSION_KEY = 'attendance_today_session_';

const getTodayDateStr = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
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
      // Check if today already has a completed record in history
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

    // Update or insert into history
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

    // Update history record
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

  async getAttendanceHistory(userId, year, month) {
    const history = await this.initUserAttendance(userId);
    
    // month is 1-indexed (1 to 12)
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const prefix = `${year}-${monthStr}`;

    const filtered = history.filter(r => r.date.startsWith(prefix));
    
    // Sort descending by date
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Compute monthly stats
    const presentCount = filtered.filter(r => r.status === 'Present').length;
    const lateCount = filtered.filter(r => r.status === 'Late').length;
    const absentCount = filtered.filter(r => r.status === 'Absent').length;
    const leaveCount = filtered.filter(r => r.status === 'On Leave' || r.status === 'Half Day').length;

    return {
      records: filtered,
      stats: {
        totalDays: filtered.length,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        leaves: leaveCount
      }
    };
  }
};
