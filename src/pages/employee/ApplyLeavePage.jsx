import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeave } from '../../hooks/useLeave';
import { useToast } from '../../hooks/useToast';
import { getLeavePolicy, LEAVE_POLICIES } from '../../config/leavePolicy';
import { calculateLeaveDuration } from '../../utils/durationCalculator';
import { attachmentService } from '../../services/attachmentService';
import { Modal } from '../../components/common/Modal';

export const ApplyLeavePage = () => {
  const navigate = useNavigate();
  const { balances, applyLeave } = useLeave();
  const { error: toastError } = useToast();

  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Form dirty state check
  const isDirty = Boolean(leaveType || startDate || endDate || reason || attachment);

  // Reusable duration calculation
  const durationDays = useMemo(() => {
    return calculateLeaveDuration(startDate, endDate);
  }, [startDate, endDate]);

  // Selected policy details
  const policy = useMemo(() => {
    return getLeavePolicy(leaveType);
  }, [leaveType]);

  // Available and projected balance calculation
  const availableBalance = useMemo(() => {
    if (!leaveType || !balances[leaveType]) return 0;
    return balances[leaveType].available || 0;
  }, [leaveType, balances]);

  const remainingIfApproved = useMemo(() => {
    if (!policy || !policy.requiresBalance) return availableBalance;
    return Math.max(0, availableBalance - durationDays);
  }, [policy, availableBalance, durationDays]);

  const isExcessBalance = useMemo(() => {
    if (!policy || !policy.requiresBalance) return false;
    return durationDays > availableBalance;
  }, [policy, durationDays, availableBalance]);

  // Date validation rules based on configurable leavePolicy
  const todayStr = new Date().toISOString().split('T')[0];
  const minStartDate = policy && !policy.allowPastDates ? todayStr : undefined;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = attachmentService.validateFile(file);
    if (!validation.isValid) {
      setAttachmentError(validation.error);
      setAttachment(null);
      return;
    }

    setAttachmentError('');
    setAttachment(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leaveType) {
      toastError('Please select a valid Leave Type.');
      return;
    }
    if (!startDate || !endDate) {
      toastError('Start Date and End Date are required.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toastError('End Date cannot be earlier than Start Date.');
      return;
    }
    if (isExcessBalance) {
      toastError(`You only have ${availableBalance} ${policy.name} days remaining.`);
      return;
    }
    if (reason.trim().length < 10) {
      toastError('Reason must be at least 10 characters.');
      return;
    }
    if (reason.trim().length > 500) {
      toastError('Reason cannot exceed 500 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await applyLeave({
        leaveType,
        startDate,
        endDate,
        durationDays,
        reason,
        attachmentName: attachment ? attachment.name : null,
        attachmentUrl: null
      });
      navigate('/leave-requests');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      navigate('/leave-requests');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Header matching Stitch light theme */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Apply for Leave</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Submit your time off request for review and approval
        </p>
      </header>

      {/* Main Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-level-1 border border-surface-variant space-y-6"
      >
        {/* Leave Type Dropdown */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Leave Type <span className="text-error">*</span>
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-surface-variant focus:border-secondary focus:ring-1 focus:ring-secondary text-sm bg-white text-primary outline-none"
            required
          >
            <option value="" disabled>Select leave type</option>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>

          {policy && (
            <p className="text-xs text-outline mt-1.5">
              ℹ️ {policy.description} {policy.allowPastDates ? '(Past dates allowed)' : ''}
            </p>
          )}
        </div>

        {/* Live Projected Leave Balance Indicator */}
        {leaveType && (
          <div className={`p-4 rounded-xl border transition-all ${
            isExcessBalance
              ? 'bg-error-container/40 border-error-container text-error'
              : 'bg-surface-container-low border-surface-variant text-primary'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-outline uppercase font-semibold block">Available Balance</span>
                <span className="text-base font-bold">{availableBalance} Days</span>
              </div>
              <div>
                <span className="text-outline uppercase font-semibold block">Requested Days</span>
                <span className="text-base font-bold">{durationDays} Days</span>
              </div>
              <div>
                <span className="text-outline uppercase font-semibold block">Remaining if Approved</span>
                <span className={`text-base font-bold ${isExcessBalance ? 'text-error' : 'text-secondary'}`}>
                  {remainingIfApproved} Days
                </span>
              </div>
            </div>

            {isExcessBalance && (
              <p className="text-xs font-semibold text-error mt-2">
                ⚠️ Insufficient balance: You only have {availableBalance} {policy?.name} days remaining.
              </p>
            )}
          </div>
        )}

        {/* Start Date and End Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Start Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              required
              min={minStartDate}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-variant focus:border-secondary focus:ring-1 focus:ring-secondary text-sm bg-white text-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              End Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              required
              min={startDate || minStartDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-variant focus:border-secondary focus:ring-1 focus:ring-secondary text-sm bg-white text-primary outline-none"
            />
          </div>
        </div>

        {/* Reason For Leave */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Reason for Leave <span className="text-error">*</span>
            </label>
            <span className={`text-[11px] ${
              reason.length > 500 ? 'text-error font-bold' : 'text-outline'
            }`}>
              {reason.length} / 500 chars (min. 10)
            </span>
          </div>
          <textarea
            rows={4}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide details for your time off request..."
            className="w-full p-3 rounded-xl border border-surface-variant focus:border-secondary focus:ring-1 focus:ring-secondary text-sm bg-white text-primary resize-none outline-none"
          />
        </div>

        {/* Attachments Upload (Optional, validates PNG, JPG, PDF up to 10MB) */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Attachments <span className="font-normal text-outline lowercase">(optional)</span>
          </label>
          <div className="border-2 border-dashed border-surface-variant rounded-xl p-6 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors text-center">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-[32px] text-secondary mb-2">
                cloud_upload
              </span>
              <label htmlFor="file-upload" className="cursor-pointer text-xs font-semibold text-secondary hover:underline">
                <span>Click to upload attachment</span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <p className="text-[11px] text-outline mt-1">
                Supported formats: PNG, JPG, JPEG, PDF (max. 10MB)
              </p>
              {attachment && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-variant text-xs text-primary font-medium">
                  <span className="material-symbols-outlined text-[16px] text-secondary">check</span>
                  {attachment.name} ({(attachment.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
              {attachmentError && (
                <p className="text-xs text-error font-medium mt-2">{attachmentError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-surface-container">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || isExcessBalance}
            className="px-6 py-2.5 rounded-xl bg-secondary text-white font-semibold text-xs hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>
      </form>

      {/* Discard Changes Warning Modal */}
      <Modal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        title="Unsaved Changes"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            You have entered information in the leave request form. Are you sure you want to discard your changes and return to Leave Requests?
          </p>
          <div className="pt-4 border-t border-surface-container flex justify-end gap-3">
            <button
              onClick={() => setShowDiscardModal(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-low text-primary"
            >
              Continue Editing
            </button>
            <button
              onClick={() => navigate('/leave-requests')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-error text-white hover:bg-error/90"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
