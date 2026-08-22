import React, { createContext, useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDurationHours } from '../utils/dateUtils';

export const AttendanceContext = createContext(null);

export const AttendanceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [todaySession, setTodaySession] = useState({
    status: 'NOT_CHECKED_IN',
    checkInTime: null,
    checkOutTime: null,
    totalHours: null
  });
  const [elapsedTime, setElapsedTime] = useState('0h 0m');
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState({ records: [], stats: {} });
  const [error, setError] = useState(null);

  // Load today session
  const loadTodaySession = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const session = await attendanceService.getTodaySession(user.id);
      setTodaySession(session);
      setError(null);
    } catch (err) {
      console.error('[AttendanceContext] Error loading session:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    loadTodaySession();
  }, [loadTodaySession]);

  // Live timer: recalculates elapsed time continuously from stored checkInTime ISO string
  useEffect(() => {
    if (todaySession.status !== 'CHECKED_IN' || !todaySession.checkInTime) {
      if (todaySession.status === 'COMPLETED' && todaySession.totalHours) {
        setElapsedTime(todaySession.totalHours);
      } else {
        setElapsedTime('0h 0m');
      }
      return;
    }

    const updateTimer = () => {
      const checkInDate = new Date(todaySession.checkInTime);
      const now = new Date();
      const diffMs = now - checkInDate;
      setElapsedTime(formatDurationHours(diffMs));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // 1s tick
    return () => clearInterval(interval);
  }, [todaySession.status, todaySession.checkInTime, todaySession.totalHours]);

  const checkIn = async () => {
    if (!user) return;
    try {
      const updated = await attendanceService.checkIn(user.id);
      setTodaySession(updated);
      success('Checked in successfully! Have a productive day.');
      return updated;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  const checkOut = async () => {
    if (!user) return;
    try {
      const updated = await attendanceService.checkOut(user.id);
      setTodaySession(updated);
      success(`Checked out successfully! Total working hours: ${updated.totalHours}`);
      return updated;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  const fetchHistory = useCallback(async (year, month) => {
    if (!user) return;
    try {
      setHistoryLoading(true);
      const data = await attendanceService.getAttendanceHistory(user.id, year, month);
      setHistoryData(data);
      return data;
    } catch (err) {
      console.error('[AttendanceContext] Error fetching history:', err);
      toastError('Failed to load attendance history.');
      throw err;
    } finally {
      setHistoryLoading(false);
    }
  }, [user, toastError]);

  return (
    <AttendanceContext.Provider value={{
      todaySession,
      elapsedTime,
      loading,
      historyLoading,
      historyData,
      error,
      checkIn,
      checkOut,
      fetchHistory,
      reloadTodaySession: loadTodaySession
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};
