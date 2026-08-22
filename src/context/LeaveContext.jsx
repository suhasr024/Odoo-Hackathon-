import React, { createContext, useState, useEffect, useCallback } from 'react';
import { leaveService } from '../services/leaveService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const LeaveContext = createContext(null);

export const LeaveProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [balances, setBalances] = useState({
    annual: { total: 20, used: 0, available: 20 },
    sick: { total: 10, used: 0, available: 10 },
    unpaid: { total: 30, used: 0, available: 30 }
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLeaveData = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [userBalances, userRequests] = await Promise.all([
        leaveService.getLeaveBalances(user.id),
        leaveService.getLeaveRequests(user.id)
      ]);
      setBalances(userBalances);
      setLeaveRequests(userRequests);
      setError(null);
    } catch (err) {
      console.error('[LeaveContext] Error loading leave data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    loadLeaveData();
  }, [loadLeaveData]);

  const applyLeave = async (payload) => {
    if (!user) return;
    try {
      const newRequest = await leaveService.applyForLeave(user.id, payload);
      setLeaveRequests(prev => [newRequest, ...prev]);
      success('Leave request submitted successfully! Status is Pending.');
      return newRequest;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  const cancelLeave = async (requestId) => {
    if (!user) return;
    try {
      const cancelled = await leaveService.cancelLeaveRequest(user.id, requestId);
      setLeaveRequests(prev => prev.map(r => r.id === requestId ? cancelled : r));
      success('Leave request cancelled.');
      return cancelled;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  return (
    <LeaveContext.Provider value={{
      balances,
      leaveRequests,
      loading,
      error,
      applyLeave,
      cancelLeave,
      reloadLeaveData: loadLeaveData
    }}>
      {children}
    </LeaveContext.Provider>
  );
};
