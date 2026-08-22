import React, { createContext, useState, useEffect, useCallback } from 'react';
import { payrollService } from '../services/payrollService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const PayrollContext = createContext(null);

export const PayrollProvider = ({ children }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [salary, setSalary] = useState(null);
  const [allSalaries, setAllSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMySalary = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await payrollService.getSalaryByEmployeeId(user.id);
      setSalary(data);
      setError(null);
    } catch (err) {
      console.error('[PayrollContext] fetchMySalary error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAllSalaries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await payrollService.getAllSalaries();
      setAllSalaries(data);
      setError(null);
    } catch (err) {
      console.error('[PayrollContext] fetchAllSalaries error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMySalary();
      if (user.role === 'Admin') {
        fetchAllSalaries();
      }
    }
  }, [user, fetchMySalary, fetchAllSalaries]);

  const editSalary = async (employeeId, payload) => {
    try {
      const updated = await payrollService.updateSalary(employeeId, payload);
      setAllSalaries(prev => prev.map(s => (s.userId === employeeId || s.employeeId === employeeId) ? { ...s, ...updated } : s));
      if (user && (user.id === employeeId || user.employeeId === employeeId)) {
        setSalary(prev => ({ ...prev, ...updated }));
      }
      success('Salary configuration updated successfully.');
      return updated;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  const downloadSlip = (emp, salData, periodId) => {
    try {
      payrollService.downloadSalarySlip(emp || user, salData || salary, periodId);
      success('Salary slip downloaded successfully.');
    } catch (err) {
      toastError('Failed to download salary slip.');
    }
  };

  return (
    <PayrollContext.Provider value={{
      salary,
      allSalaries,
      loading,
      error,
      fetchMySalary,
      fetchAllSalaries,
      editSalary,
      downloadSlip
    }}>
      {children}
    </PayrollContext.Provider>
  );
};
