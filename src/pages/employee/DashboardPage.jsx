import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAttendance } from '../../hooks/useAttendance';
import { useLeave } from '../../hooks/useLeave';
import { formatFullDateHeader, formatDate, formatTime } from '../../utils/dateUtils';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { todaySession, elapsedTime, loading: attLoading, checkIn, checkOut } = useAttendance();
  const { balances, leaveRequests, loading: leaveLoading } = useLeave();

  const isCheckedIn = todaySession?.status === 'CHECKED_IN';
  const isCompleted = todaySession?.status === 'COMPLETED';
  const isNotCheckedIn = todaySession?.status === 'NOT_CHECKED_IN';

  const recentRequests = leaveRequests.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Hero Welcome Banner - Glass Card design from Stitch */}
      <div className="relative rounded-2xl overflow-hidden glass-card shadow-level-1 p-6 md:p-8">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight mb-2">
            Good morning, {user?.name?.split(' ')[0] || 'there'}.
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant max-w-2xl">
            Here's a quick overview of your attendance and leave balances for today. Have a productive day ahead!
          </p>
        </div>
      </div>

      {/* Bento Grid: Today's Status & Leave Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Today's Check-in Status */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-surface-variant flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">schedule</span>
              Today's Status
            </h3>
            <p className="text-xs text-outline mb-6">
              {formatFullDateHeader(new Date())}
            </p>

            {/* Status Badge & Check-in Time */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {isNotCheckedIn && (
                <div className="bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
                  Not Checked In
                </div>
              )}

              {isCheckedIn && (
                <>
                  <div className="bg-tertiary-fixed/20 text-on-tertiary-container px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
                    Checked In
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    {formatTime(todaySession.checkInTime)}
                  </div>
                </>
              )}

              {isCompleted && (
                <>
                  <div className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    Completed
                  </div>
                  <div className="text-sm font-semibold text-on-surface-variant">
                    Total: {todaySession.totalHours}
                  </div>
                </>
              )}
            </div>

            {/* Live elapsed timer */}
            {isCheckedIn && (
              <div className="mb-6 p-3 bg-surface-container-low rounded-xl border border-surface-variant flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">Elapsed Working Time:</span>
                <span className="text-sm font-bold text-secondary font-mono">{elapsedTime}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            {isNotCheckedIn && (
              <button
                onClick={checkIn}
                className="bg-secondary text-white font-semibold text-sm py-3 px-6 rounded-xl hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                Check In
              </button>
            )}

            {isCheckedIn && (
              <button
                onClick={checkOut}
                className="bg-error text-white font-semibold text-sm py-3 px-6 rounded-xl hover:bg-error/90 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Check Out
              </button>
            )}

            {isCompleted && (
              <div className="text-xs text-on-surface-variant italic py-2">
                ✅ Attendance logged for today. Check-in at {formatTime(todaySession.checkInTime)}, Check-out at {formatTime(todaySession.checkOutTime)}.
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Leave Balances */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-surface-variant flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">beach_access</span>
                Leave Balance
              </h3>
              <button
                onClick={() => navigate('/leave-requests/apply')}
                className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                Apply Leave
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="flex items-center gap-6">
              {/* Circular Progress Display */}
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-surface-container-highest"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-secondary transition-all duration-500"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * ((balances?.annual?.available || 0) / (balances?.annual?.total || 20)))}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-primary leading-none">
                    {balances?.annual?.available ?? 14}
                  </span>
                  <span className="text-[10px] text-outline mt-0.5">Days</span>
                </div>
              </div>

              {/* Progress Bars for Annual & Sick Leave */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-medium text-on-surface-variant">Annual Leave</span>
                    <span className="font-bold text-primary">
                      {balances?.annual?.available} / {balances?.annual?.total}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2">
                    <div
                      className="bg-secondary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, ((balances?.annual?.available || 0) / (balances?.annual?.total || 20)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-medium text-on-surface-variant">Sick Leave</span>
                    <span className="font-bold text-primary">
                      {balances?.sick?.available} / {balances?.sick?.total}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2">
                    <div
                      className="bg-secondary-container h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, ((balances?.sick?.available || 0) / (balances?.sick?.total || 10)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-surface-container flex justify-between items-center">
            <span className="text-xs text-on-surface-variant">Unpaid Allowance: <strong>{balances?.unpaid?.available} Days</strong></span>
            <button
              onClick={() => navigate('/leave-requests')}
              className="text-xs font-semibold text-secondary hover:underline"
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Recent Leave Requests Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-surface-variant overflow-hidden">
        <div className="p-6 border-b border-surface-container flex justify-between items-center">
          <h3 className="text-lg font-semibold text-primary">Recent Leave Requests</h3>
          <button
            onClick={() => navigate('/leave-requests')}
            className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
          >
            View All Requests
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Type</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container">
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-on-surface-variant">
                    No leave requests on record.
                  </td>
                </tr>
              ) : (
                recentRequests.map((req) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
