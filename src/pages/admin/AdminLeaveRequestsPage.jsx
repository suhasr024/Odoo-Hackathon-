import React, { useState, useEffect, useMemo } from 'react';
import { leaveService } from '../../services/leaveService';
import { formatDate } from '../../utils/dateUtils';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminLeaveRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectModalRequest, setRejectModalRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getAllLeaveRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching admin leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const pendingCount = useMemo(() => requests.filter(r => r.status === 'Pending').length, [requests]);
  const approvedCount = useMemo(() => requests.filter(r => r.status === 'Approved').length, [requests]);
  const rejectedCount = useMemo(() => requests.filter(r => r.status === 'Rejected').length, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && r.leaveType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          r.userName?.toLowerCase().includes(q) ||
          r.reason?.toLowerCase().includes(q) ||
          r.userDepartment?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requests, statusFilter, typeFilter, searchQuery]);

  const handleApprove = async (requestId) => {
    try {
      setIsProcessing(true);
      await leaveService.approveLeaveRequest(requestId);
      await fetchAllRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      setRejectError('Rejection reason is mandatory (minimum 5 characters).');
      return;
    }

    try {
      setIsProcessing(true);
      await leaveService.rejectLeaveRequest(rejectModalRequest.id, rejectionReason);
      setRejectModalRequest(null);
      setRejectionReason('');
      setRejectError('');
      await fetchAllRequests();
    } catch (err) {
      setRejectError(err.message || 'Failed to reject leave request.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Organization Leave Management</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Review, approve, and manage leave applications across all departments
        </p>
      </div>

      {/* Summary Cards Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Review</span>
            <span className="material-symbols-outlined text-amber-600 text-[24px]">pending_actions</span>
          </div>
          <div className="text-3xl font-black text-amber-800">{pendingCount}</div>
          <p className="text-xs text-outline mt-1">Applications awaiting your decision</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-tertiary-container uppercase tracking-wider">Approved Requests</span>
            <span className="material-symbols-outlined text-tertiary-container text-[24px]">verified</span>
          </div>
          <div className="text-3xl font-black text-primary">{approvedCount}</div>
          <p className="text-xs text-outline mt-1">Successfully granted leave requests</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-error uppercase tracking-wider">Rejected Requests</span>
            <span className="material-symbols-outlined text-error text-[24px]">cancel</span>
          </div>
          <div className="text-3xl font-black text-error">{rejectedCount}</div>
          <p className="text-xs text-outline mt-1">Declined applications with feedback</p>
        </div>
      </div>

      {/* Leave Requests Table & Filters */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant overflow-hidden">
        <div className="p-6 border-b border-surface-container flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-primary">All Leave Applications</h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee or reason..."
              className="px-3.5 py-1.5 text-xs bg-surface-container-low border border-surface-variant rounded-xl text-primary outline-none focus:border-secondary w-48 sm:w-56"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-surface-container-low border border-surface-variant text-primary outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-surface-container-low border border-surface-variant text-primary outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon="event_busy"
            title="No leave applications found"
            description="No applications match your current search and filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Employee</th>
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
                    <td className="p-4">
                      <p className="font-bold text-primary leading-tight">{req.userName || 'Alex Rivers'}</p>
                      <p className="text-[11px] text-on-surface-variant">{req.userDepartment || 'General'}</p>
                    </td>
                    <td className="p-4 text-xs font-semibold text-secondary">{req.leaveTypeName}</td>
                    <td className="p-4 text-xs text-on-surface-variant">
                      {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </td>
                    <td className="p-4 text-xs font-bold text-primary">{req.durationDays} Days</td>
                    <td className="p-4 text-xs text-on-surface-variant max-w-xs truncate">{req.reason}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
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
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container text-primary transition-colors"
                        >
                          Details
                        </button>
                        {req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={isProcessing}
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModalRequest(req)}
                              disabled={isProcessing}
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-error-container/50 text-error hover:bg-error-container transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
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
        title="Leave Application Details"
        maxWidth="max-w-lg"
      >
        {selectedRequest && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
              <div>
                <p className="text-sm font-bold text-primary">{selectedRequest.userName}</p>
                <p className="text-[11px] text-on-surface-variant">{selectedRequest.userDepartment} • {selectedRequest.leaveTypeName}</p>
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
                <span className="text-outline uppercase font-semibold block">Date Range</span>
                <p className="font-semibold text-primary">{formatDate(selectedRequest.startDate)} — {formatDate(selectedRequest.endDate)}</p>
              </div>
              <div>
                <span className="text-outline uppercase font-semibold block">Duration</span>
                <p className="font-semibold text-primary">{selectedRequest.durationDays} Days</p>
              </div>
            </div>

            <div>
              <span className="text-outline uppercase font-semibold block">Reason for Application</span>
              <p className="p-3 bg-surface-container-low rounded-xl text-on-surface-variant mt-1 leading-relaxed">
                {selectedRequest.reason}
              </p>
            </div>

            {selectedRequest.rejectionReason && (
              <div className="p-3 bg-error-container/40 border border-error-container rounded-xl">
                <span className="text-error font-bold uppercase">Rejection Reason</span>
                <p className="text-error mt-0.5">{selectedRequest.rejectionReason}</p>
              </div>
            )}

            {selectedRequest.attachmentName && (
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">attachment</span>
                  <span className="font-medium text-primary truncate max-w-xs">{selectedRequest.attachmentName}</span>
                </div>
                <span className="text-[10px] text-outline italic">Attached Document</span>
              </div>
            )}

            <div className="pt-3 border-t border-surface-container flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal with Mandatory Reason */}
      <Modal
        isOpen={Boolean(rejectModalRequest)}
        onClose={() => setRejectModalRequest(null)}
        title="Reject Leave Application"
        maxWidth="max-w-md"
      >
        {rejectModalRequest && (
          <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
            <p className="text-on-surface-variant">
              You are declining the leave request for <strong>{rejectModalRequest.userName}</strong> ({rejectModalRequest.leaveTypeName}, {rejectModalRequest.durationDays} Days).
            </p>

            {rejectError && (
              <div className="p-3 rounded-lg bg-error-container/40 text-error font-medium">
                {rejectError}
              </div>
            )}

            <div>
              <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Reason for Rejection <span className="text-error">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain the reason for rejection..."
                className="w-full p-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary resize-none"
              />
              <span className="text-[10px] text-outline">Minimum 5 characters.</span>
            </div>

            <div className="pt-3 border-t border-surface-container flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalRequest(null)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low text-primary font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-error text-white font-semibold hover:bg-error/90 disabled:opacity-50"
              >
                {isProcessing ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
