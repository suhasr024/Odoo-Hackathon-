import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeave } from '../../hooks/useLeave';
import { formatDate } from '../../utils/dateUtils';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const LeaveRequestsPage = () => {
  const navigate = useNavigate();
  const { balances, leaveRequests, loading, cancelLeave } = useLeave();

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [cancelModalRequest, setCancelModalRequest] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Request Summary counts
  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const usedDays = (balances?.annual?.used || 0) + (balances?.sick?.used || 0);

  // Filtered requests
  const filteredRequests = leaveRequests.filter((req) => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && req.leaveType !== typeFilter) return false;
    return true;
  });

  const handleConfirmCancel = async () => {
    if (!cancelModalRequest) return;
    try {
      setIsCancelling(true);
      await cancelLeave(cancelModalRequest.id);
      setCancelModalRequest(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Leave Requests</h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Manage your time off balances and track request statuses
          </p>
        </div>
        <button
          onClick={() => navigate('/leave-requests/apply')}
          className="bg-secondary text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Apply for Leave
        </button>
      </div>

      {/* Bento Grid: Leave Balances & Request Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Annual Leave Balance */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-surface-variant">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">beach_access</span>
            </div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Annual Allowance</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">
              {balances?.annual?.available} <span className="text-xs font-normal text-on-surface-variant">/ {balances?.annual?.total} Days</span>
            </div>
            <p className="text-xs text-on-surface-variant">Annual Leave Available</p>
          </div>
        </div>

        {/* Card 2: Sick Leave Balance */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-surface-variant">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">local_hospital</span>
            </div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Medical</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">
              {balances?.sick?.available} <span className="text-xs font-normal text-on-surface-variant">/ {balances?.sick?.total} Days</span>
            </div>
            <p className="text-xs text-on-surface-variant">Sick Leave Available</p>
          </div>
        </div>

        {/* Card 3: Pending Requests Count */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-surface-variant">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">pending_actions</span>
            </div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Awaiting Review</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-800 mb-1">{pendingCount}</div>
            <p className="text-xs text-on-surface-variant">Pending Requests</p>
          </div>
        </div>

        {/* Card 4: Approved & Used Days */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-surface-variant">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/30 text-on-tertiary-container flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Approved Count</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">{approvedCount} ({usedDays} Days)</div>
            <p className="text-xs text-on-surface-variant">Approved Requests (Used)</p>
          </div>
        </div>
      </div>

      {/* Main Leave Requests Table & Filters */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-surface-variant overflow-hidden">
        <div className="p-6 border-b border-surface-container flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-primary">Leave History & Requests</h2>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-low border border-surface-variant text-primary outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Leave Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-low border border-surface-variant text-primary outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={4} />
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon="event_busy"
            title="No leave requests found"
            description="You haven't submitted any leave requests matching this filter criteria."
            actionLabel="Apply for Leave"
            onAction={() => navigate('/leave-requests/apply')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Type</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-surface-container">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-semibold text-primary">{req.leaveTypeName}</td>
                    <td className="p-4 text-on-surface-variant text-xs">
                      {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </td>
                    <td className="p-4 text-xs font-medium text-primary">{req.durationDays} Days</td>
                    <td className="p-4 text-xs text-on-surface-variant max-w-xs truncate">{req.reason}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        req.status === 'Approved' ? 'bg-tertiary-fixed/20 text-on-tertiary-container' :
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'Cancelled' ? 'bg-surface-variant text-on-surface-variant' :
                        'bg-error-container/50 text-error'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container text-primary transition-colors"
                        >
                          Details
                        </button>
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => setCancelModalRequest(req)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-error-container/50 hover:bg-error-container text-error transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leave Details Modal */}
      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title="Leave Request Details"
        maxWidth="max-w-lg"
      >
        {selectedRequest && (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-semibold">Leave Type</span>
                <p className="text-base font-bold text-primary">{selectedRequest.leaveTypeName}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                selectedRequest.status === 'Approved' ? 'bg-tertiary-fixed/20 text-on-tertiary-container' :
                selectedRequest.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                selectedRequest.status === 'Cancelled' ? 'bg-surface-variant text-on-surface-variant' :
                'bg-error-container/50 text-error'
              }`}>
                {selectedRequest.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-outline font-medium">Start Date</span>
                <p className="font-semibold text-primary">{formatDate(selectedRequest.startDate)}</p>
              </div>
              <div>
                <span className="text-xs text-outline font-medium">End Date</span>
                <p className="font-semibold text-primary">{formatDate(selectedRequest.endDate)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-outline font-medium">Duration</span>
                <p className="font-semibold text-primary">{selectedRequest.durationDays} Days</p>
              </div>
              <div>
                <span className="text-xs text-outline font-medium">Applied Date</span>
                <p className="font-semibold text-primary">{formatDate(selectedRequest.appliedDate)}</p>
              </div>
            </div>

            <div>
              <span className="text-xs text-outline font-medium">Reason for Request</span>
              <p className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant mt-1 leading-relaxed">
                {selectedRequest.reason}
              </p>
            </div>

            {selectedRequest.rejectionReason && (
              <div className="p-3 bg-error-container/40 border border-error-container rounded-xl">
                <span className="text-xs text-error font-bold uppercase">Rejection Reason</span>
                <p className="text-xs text-error mt-0.5">{selectedRequest.rejectionReason}</p>
              </div>
            )}

            {selectedRequest.attachmentName && (
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">attachment</span>
                  <span className="text-xs font-medium text-primary truncate max-w-xs">{selectedRequest.attachmentName}</span>
                </div>
                <span className="text-[10px] text-outline italic">Attached document</span>
              </div>
            )}

            <div className="pt-3 border-t border-surface-container flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Leave Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelModalRequest)}
        onClose={() => setCancelModalRequest(null)}
        title="Cancel Leave Request"
        maxWidth="max-w-md"
      >
        {cancelModalRequest && (
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              Are you sure you want to cancel your <strong>{cancelModalRequest.leaveTypeName}</strong> request for <strong>{formatDate(cancelModalRequest.startDate)}</strong> to <strong>{formatDate(cancelModalRequest.endDate)}</strong> ({cancelModalRequest.durationDays} Days)?
            </p>
            <p className="text-xs text-outline">
              This will update the status to <em>Cancelled</em>. The record will remain visible in your leave history.
            </p>
            <div className="pt-4 border-t border-surface-container flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalRequest(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              >
                Keep Request
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-error text-white hover:bg-error/90 transition-colors flex items-center gap-2"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
