import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../hooks/useEmployees';
import { useLeave } from '../../hooks/useLeave';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import { leaveService } from '../../services/leaveService';
import { formatDate } from '../../utils/dateUtils';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { employees, fetchEmployees, loading: empLoading } = useEmployees();
  const { leaveRequests, loading: leaveLoading } = useLeave();
  const { success, error: toastError } = useToast();

  const [allLeaves, setAllLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [rejectModalRequest, setRejectModalRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectError, setRejectError] = useState('');

  // Pending Admin Signups
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Fetch all organization leave requests for admin
  const loadAllLeaves = async () => {
    try {
      setLoadingLeaves(true);
      const data = await leaveService.getAllLeaveRequests();
      setAllLeaves(data);
    } catch (err) {
      console.error('Error loading leaves for admin dashboard:', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const loadPendingAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const data = await authService.getPendingAdminSignups();
      setPendingAdmins(data);
    } catch (err) {
      console.error('Error loading pending admins:', err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAllLeaves();
    loadPendingAdmins();
  }, [leaveRequests]);

  const pendingLeaves = useMemo(() => {
    return allLeaves.filter(r => r.status === 'Pending');
  }, [allLeaves]);

  const departments = useMemo(() => {
    const set = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(set);
  }, [employees]);

  const handleApprove = async (requestId) => {
    try {
      setIsProcessing(true);
      await leaveService.approveLeaveRequest(requestId);
      await loadAllLeaves();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      setRejectError('Rejection reason is required (min 5 characters).');
      return;
    }

    try {
      setIsProcessing(true);
      await leaveService.rejectLeaveRequest(rejectModalRequest.id, rejectionReason);
      setRejectModalRequest(null);
      setRejectionReason('');
      setRejectError('');
      await loadAllLeaves();
    } catch (err) {
      setRejectError(err.message || 'Failed to reject request.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve pending admin account
  const handleApproveAdmin = async (pendingId, name) => {
    try {
      setIsProcessing(true);
      await authService.approveAdminSignup(pendingId);
      success(`Admin access approved for ${name}.`);
      await loadPendingAdmins();
      if (fetchEmployees) fetchEmployees();
    } catch (err) {
      toastError(err.message || 'Failed to approve admin request.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject pending admin account
  const handleRejectAdmin = async (pendingId, name) => {
    try {
      setIsProcessing(true);
      await authService.rejectAdminSignup(pendingId);
      success(`Admin request rejected for ${name}.`);
      await loadPendingAdmins();
    } catch (err) {
      toastError('Failed to reject request.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Metric Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Total Employees */}
        <div
          onClick={() => navigate('/admin/employees')}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between hover:border-secondary transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Total Workforce
            </span>
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-primary flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-primary">{employees.length}</div>
            <div className="text-xs text-secondary font-medium mt-1 flex items-center gap-1">
              <span>View Employee Directory</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Leave Requests */}
        <div
          onClick={() => navigate('/admin/leaves')}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between hover:border-secondary transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">pending_actions</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-800">{pendingLeaves.length + pendingAdmins.length}</div>
            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <span>Awaiting Admin Action</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Card 3: Today's Attendance Overview */}
        <div
          onClick={() => navigate('/admin/attendance')}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between hover:border-secondary transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-tertiary-container uppercase tracking-wider">
              Current Status
            </span>
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/30 text-on-tertiary-container flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">event_available</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-primary">
              {employees.filter(e => e.status === 'Active').length}
              <span className="text-xs font-normal text-on-surface-variant"> Active</span>
            </div>
            <div className="text-xs text-secondary font-medium mt-1 flex items-center gap-1">
              <span>Review Attendance Logs</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Card 4: Departments */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Departments
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">domain</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-primary">{departments.length}</div>
            <div className="text-xs text-outline mt-1">Cross-functional teams</div>
          </div>
        </div>
      </div>

      {/* Pending Admin Registrations Notice Banner (if any) */}
      {pendingAdmins.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border-2 border-secondary/30 p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">admin_panel_settings</span>
              <h3 className="text-base font-bold text-primary">Pending HR / Admin Account Approvals</h3>
            </div>
            <span className="text-xs bg-secondary-fixed text-primary px-2.5 py-0.5 rounded-full font-bold">
              {pendingAdmins.length} Request(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAdmins.map((adm) => (
              <div key={adm.id} className="p-4 rounded-xl bg-surface-container-low border border-surface-variant flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <img src={adm.avatar} alt={adm.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-primary">{adm.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{adm.email}</p>
                    <p className="text-[10px] text-secondary font-medium">Requested: {adm.requestedDate} • {adm.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRejectAdmin(adm.id, adm.name)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-error-container/50 text-error hover:bg-error-container text-xs font-semibold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveAdmin(adm.id, adm.name)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container text-xs font-semibold transition-colors shadow-sm"
                  >
                    Approve Admin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Employee Status Directory + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Quick Status Directory (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-primary">Employee Status Overview</h3>
                <p className="text-xs text-on-surface-variant">Latest synchronized employee records</p>
              </div>
              <button
                onClick={() => navigate('/admin/employees')}
                className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                View Full Directory
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-variant text-xs font-semibold uppercase text-on-surface-variant">
                    <th className="pb-3">Employee</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3 hidden sm:table-cell">Designation</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant text-sm">
                  {employees.slice(0, 5).map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => navigate('/admin/employees')}
                      className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover bg-surface-container shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-primary block leading-tight">{emp.name}</span>
                            <span className="text-[10px] text-outline">{emp.employeeId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-on-surface-variant">{emp.department}</td>
                      <td className="py-3 text-xs text-on-surface-variant hidden sm:table-cell">{emp.designation}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          emp.status === 'Active'
                            ? 'bg-tertiary-fixed/20 text-on-tertiary-container'
                            : 'bg-surface-variant text-on-surface-variant'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending Approvals Widget (1 col) */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">pending_actions</span>
                <h3 className="text-base font-bold text-primary">Pending Approvals</h3>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                {pendingLeaves.length}
              </span>
            </div>

            {loadingLeaves ? (
              <div className="space-y-3">
                <div className="h-16 bg-surface-container-low rounded-xl animate-pulse"></div>
                <div className="h-16 bg-surface-container-low rounded-xl animate-pulse"></div>
              </div>
            ) : pendingLeaves.length === 0 ? (
              <div className="p-8 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-secondary-container mb-2">task_alt</span>
                <p className="font-semibold text-primary">No pending requests</p>
                <p className="text-outline text-[11px] mt-0.5">All leave applications are up to date.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.slice(0, 3).map((req) => (
                  <div key={req.id} className="p-3.5 rounded-xl bg-surface-container-low border border-surface-variant flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-primary">{req.userName || 'Employee'}</p>
                        <p className="text-[11px] text-on-surface-variant">{req.leaveTypeName} • {req.durationDays} Days</p>
                      </div>
                      <span className="text-[10px] text-outline">{formatDate(req.appliedDate)}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant line-clamp-1 italic">"{req.reason}"</p>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setRejectModalRequest(req)}
                        disabled={isProcessing}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-error-container/50 text-error hover:bg-error-container transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={isProcessing}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-surface-container">
            <button
              onClick={() => navigate('/admin/leaves')}
              className="w-full text-center text-xs font-semibold text-secondary hover:underline"
            >
              View All Leave Applications →
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal with Mandatory Reason */}
      <Modal
        isOpen={Boolean(rejectModalRequest)}
        onClose={() => setRejectModalRequest(null)}
        title="Reject Leave Application"
        maxWidth="max-w-md"
      >
        {rejectModalRequest && (
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <p className="text-xs text-on-surface-variant">
              Rejecting leave application for <strong>{rejectModalRequest.userName}</strong> ({rejectModalRequest.leaveTypeName}, {rejectModalRequest.durationDays} Days).
            </p>

            {rejectError && (
              <div className="p-3 rounded-lg bg-error-container/40 text-error text-xs font-medium">
                {rejectError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Reason for Rejection <span className="text-error">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                className="w-full p-2.5 text-xs rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary resize-none"
              />
              <span className="text-[10px] text-outline">Minimum 5 characters. Visible to employee in their Leave Details.</span>
            </div>

            <div className="pt-3 border-t border-surface-container flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalRequest(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-low text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-error text-white hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
