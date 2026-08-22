import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAttendance } from '../../hooks/useAttendance';
import { useLeave } from '../../hooks/useLeave';
import { formatFullDateHeader, formatDate, formatTime } from '../../utils/dateUtils';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { todaySession, elapsedTime, loading: attLoading, checkIn, checkOut } = useAttendance();
  const { balances, leaveRequests, loading: leaveLoading } = useLeave();

  const isCheckedIn = todaySession?.status === 'CHECKED_IN';
  const isCompleted = todaySession?.status === 'COMPLETED';
  const isNotCheckedIn = todaySession?.status === 'NOT_CHECKED_IN';

  const recentRequests = leaveRequests.slice(0, 3);

  const handleLogoutShortcut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Hero Welcome Banner */}
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

      {/* PRD 3.2.1: 4 Compact Quick-Access Shortcut Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {/* Shortcut 1: Profile */}
        <div
          onClick={() => navigate('/profile')}
          className="bg-surface-container-lowest rounded-2xl p-4 shadow-level-1 border border-outline-variant hover:border-secondary hover:shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">account_circle</span>
          </div>
          <span className="text-xs font-bold text-primary group-hover:text-secondary transition-colors">
            Profile
          </span>
        </div>

        {/* Shortcut 2: Attendance */}
        <div
          onClick={() => navigate('/attendance')}
          className="bg-surface-container-lowest rounded-2xl p-4 shadow-level-1 border border-outline-variant hover:border-secondary hover:shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/30 text-on-tertiary-container flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
          </div>
          <span className="text-xs font-bold text-primary group-hover:text-secondary transition-colors">
            Attendance
          </span>
        </div>

        {/* Shortcut 3: Leave Requests */}
        <div
          onClick={() => navigate('/leave-requests')}
          className="bg-surface-container-lowest rounded-2xl p-4 shadow-level-1 border border-outline-variant hover:border-secondary hover:shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">event_busy</span>
          </div>
          <span className="text-xs font-bold text-primary group-hover:text-secondary transition-colors">
            Leave Requests
          </span>
        </div>

        {/* Shortcut 4: Logout */}
        <div
          onClick={handleLogoutShortcut}
          className="bg-surface-container-lowest rounded-2xl p-4 shadow-level-1 border border-outline-variant hover:border-error hover:shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-error-container/40 text-error flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">logout</span>
          </div>
          <span className="text-xs font-bold text-primary group-hover:text-error transition-colors">
            Logout
          </span>
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
              <div className="text-xs text-outline italic">
                You have completed your work hours for today. See you tomorrow!
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Leave Balance Widget */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-surface-variant flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">beach_access</span>
                Leave Balance
              </h3>
              <button
                onClick={() => navigate('/leave-requests')}
                className="text-xs font-semibold text-secondary hover:text-secondary-container transition-colors"
              >
                View Details
              </button>
            </div>

            {leaveLoading ? (
              <LoadingSkeleton count={3} />
            ) : (
              <div className="space-y-4">
                {/* Annual Leave */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-primary">Annual Leave</span>
                    <span className="font-bold text-primary">
                      {balances.annual?.available || 0} / {balances.annual?.total || 20} Days
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-secondary h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, ((balances.annual?.available || 0) / (balances.annual?.total || 20)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Sick Leave */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-primary">Sick Leave</span>
                    <span className="font-bold text-primary">
                      {balances.sick?.available || 0} / {balances.sick?.total || 10} Days
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-tertiary-container h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, ((balances.sick?.available || 0) / (balances.sick?.total || 10)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Unpaid Leave */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-primary">Unpaid Leave</span>
                    <span className="font-bold text-primary">
                      {balances.unpaid?.available || 0} / {balances.unpaid?.total || 30} Days
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-outline h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, ((balances.unpaid?.available || 0) / (balances.unpaid?.total || 30)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6">
            <button
              onClick={() => navigate('/leave-requests/apply')}
              className="w-full py-2.5 rounded-xl border border-secondary text-secondary font-semibold text-xs hover:bg-secondary/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Apply for Leave
            </button>
          </div>
        </div>
      </div>

      {/* Recent Leave Requests Section */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-surface-variant">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-primary">Recent Leave Requests</h3>
            <p className="text-xs text-outline">Status of your recently submitted time-off applications</p>
          </div>
          <button
            onClick={() => navigate('/leave-requests')}
            className="text-xs font-semibold text-secondary hover:underline"
          >
            View All
          </button>
        </div>

        {leaveLoading ? (
          <LoadingSkeleton type="table" count={3} />
        ) : recentRequests.length === 0 ? (
          <div className="text-center py-8 text-xs text-on-surface-variant">
            No recent leave requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-variant text-on-surface-variant font-semibold uppercase">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Date Range</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 font-semibold text-primary">{req.leaveTypeName}</td>
                    <td className="py-3 text-on-surface-variant">
                      {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </td>
                    <td className="py-3 text-on-surface-variant">{req.durationDays} Days</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        req.status === 'Approved' ? 'bg-tertiary-fixed/20 text-on-tertiary-container' :
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'Cancelled' ? 'bg-surface-variant text-on-surface-variant' :
                        'bg-error-container/50 text-error'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
