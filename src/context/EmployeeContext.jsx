import React, { createContext, useState, useEffect, useCallback } from 'react';
import { employeeService } from '../services/employeeService';
import { useToast } from '../hooks/useToast';

export const EmployeeContext = createContext(null);

export const EmployeeProvider = ({ children }) => {
  const { success, error: toastError } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAllEmployees({
        search: searchQuery,
        department: departmentFilter,
        role: roleFilter,
        status: statusFilter
      });
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error('[EmployeeContext] Error fetching employees:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, departmentFilter, roleFilter, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const addEmployee = async (payload) => {
    try {
      const newEmp = await employeeService.addEmployee(payload);
      setEmployees(prev => [...prev, newEmp]);
      success(`Employee "${newEmp.name}" added successfully.`);
      return newEmp;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  const updateEmployee = async (id, payload) => {
    try {
      const updated = await employeeService.updateEmployee(id, payload);
      setEmployees(prev => prev.map(e => e.id === id ? updated : e));
      success(`Employee profile for "${updated.name}" updated.`);
      return updated;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  const toggleStatus = async (id) => {
    try {
      const updated = await employeeService.toggleEmployeeStatus(id);
      setEmployees(prev => prev.map(e => e.id === id ? updated : e));
      success(`Status for "${updated.name}" updated to ${updated.status}.`);
      return updated;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  return (
    <EmployeeContext.Provider value={{
      employees,
      loading,
      error,
      searchQuery,
      setSearchQuery,
      departmentFilter,
      setDepartmentFilter,
      roleFilter,
      setRoleFilter,
      statusFilter,
      setStatusFilter,
      addEmployee,
      updateEmployee,
      toggleStatus,
      refreshEmployees: fetchEmployees
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};
