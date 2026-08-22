import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { LeaveProvider } from './context/LeaveContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { SettingsProvider } from './context/SettingsContext';
import { PayrollProvider } from './context/PayrollContext';

import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { RoleRoute } from './components/routing/RoleRoute';

import { EmployeeLayout } from './layouts/EmployeeLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

// Employee Pages
import { DashboardPage } from './pages/employee/DashboardPage';
import { AttendancePage } from './pages/employee/AttendancePage';
import { LeaveRequestsPage } from './pages/employee/LeaveRequestsPage';
import { ApplyLeavePage } from './pages/employee/ApplyLeavePage';
import { PayrollPage } from './pages/employee/PayrollPage';
import { ProfilePage } from './pages/employee/ProfilePage';
import { SettingsPage } from './pages/employee/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { EmployeeManagementPage } from './pages/admin/EmployeeManagementPage';
import { AdminAttendancePage } from './pages/admin/AdminAttendancePage';
import { AdminLeaveRequestsPage } from './pages/admin/AdminLeaveRequestsPage';
import { AdminPayrollPage } from './pages/admin/AdminPayrollPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

// Error Pages
import { UnauthorizedPage } from './pages/error/UnauthorizedPage';
import { NotFoundPage } from './pages/error/NotFoundPage';

export const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AttendanceProvider>
          <LeaveProvider>
            <EmployeeProvider>
              <SettingsProvider>
                <PayrollProvider>
                  <BrowserRouter>
                    <Routes>
                      {/* Public Auth Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />

                      {/* Protected Employee Routes */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <RoleRoute allowedRoles={['Employee', 'Admin']}>
                              <EmployeeLayout />
                            </RoleRoute>
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="attendance" element={<AttendancePage />} />
                        <Route path="leave-requests" element={<LeaveRequestsPage />} />
                        <Route path="leave-requests/apply" element={<ApplyLeavePage />} />
                        <Route path="payroll" element={<PayrollPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                      </Route>

                      {/* Protected Admin Routes */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute>
                            <RoleRoute allowedRoles={['Admin']}>
                              <AdminLayout />
                            </RoleRoute>
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="employees" element={<EmployeeManagementPage />} />
                        <Route path="attendance" element={<AdminAttendancePage />} />
                        <Route path="leaves" element={<AdminLeaveRequestsPage />} />
                        <Route path="leave-requests" element={<AdminLeaveRequestsPage />} />
                        <Route path="payroll" element={<AdminPayrollPage />} />
                        <Route path="reports" element={<AdminReportsPage />} />
                        <Route path="settings" element={<AdminSettingsPage />} />
                        <Route path="profile" element={<AdminProfilePage />} />
                      </Route>

                      {/* Error & Fallback Routes */}
                      <Route path="/unauthorized" element={<UnauthorizedPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </BrowserRouter>
                </PayrollProvider>
              </SettingsProvider>
            </EmployeeProvider>
          </LeaveProvider>
        </AttendanceProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
