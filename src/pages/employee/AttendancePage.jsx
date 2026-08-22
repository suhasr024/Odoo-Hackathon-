import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { formatDate, formatTime, getMonthName, formatDurationHours } from '../../utils/dateUtils';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const AttendancePage = () => {
  const {
    todaySession,
    elapsedTime,
    loading: todayLoading,
    historyLoading,
    historyData,
    error,
    checkIn,
    checkOut,
    fetchHistory
  } = useAttendance();

  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(8); // August (1-indexed)

  useEffect(() => {
    fetchHistory(selectedYear, selectedMonth);
  }, [fetchHistory, selectedYear, selectedMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    // Only allow up to current month (August 2026) to prevent fabricating future records
    if (selectedYear === 2026 && selectedMonth >= 8) return;
    
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const isCurrentMonthMax = selectedYear === 2026 && selectedMonth >= 8;

  const isCheckedIn = todaySession?.status === 'CHECKED_IN';
  const isCompleted = todaySession?.status === 'COMPLETED';
  const isNotCheckedIn = todaySession?.status === 'NOT_CHECKED_IN';

  const stats = historyData.stats || {
    totalDays: 0,
    present: 0,
    late: 0,
    absent: 0,
    leaves: 0
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header & Check In/Out Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 border border-surface-variant">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-primary">Attendance Management</h2>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Track daily work sessions and monthly logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isNotCheckedIn && (
            <button
              onClick={checkIn}
              className="bg-secondary text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-xl hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">timer</span>
              Check In
            </button>
          )}

          {isCheckedIn && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-secondary-fixed text-primary px-3 py-1.5 rounded-lg font-bold">
                {elapsedTime}
              </span>
              <button
                onClick={checkOut}
                className="bg-error text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-xl hover:bg-error/90 transition-all active:scale-95 shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Check Out
              </button>
            </div>
          )}

          {isCompleted && (
            <div className="text-xs font-semibold text-tertiary-container bg-tertiary-fixed/30 px-4 py-2 rounded-xl flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Today Completed ({todaySession.totalHours})
            </div>
          )}
        </div>
      </div>

      {/* Month Navigation Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-surface-variant">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary transition-colors border border-surface-variant"
            title="Previous Month"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="text-base font-bold text-primary px-2">
            {getMonthName(selectedMonth - 1)} {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={isCurrentMonthMax}
            className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary transition-colors border border-surface-variant disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next Month"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>

        {/* Quick Month & Year Dropdowns */}
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-surface-variant text-primary outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m} disabled={selectedYear === 2026 && m > 8}>
                {getMonthName(m - 1)}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-surface-variant text-primary outline-none"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      {/* Summary Metrics Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Total Working Days */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-surface-variant shadow-level-1">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="material-symbols-outlined text-secondary">date_range</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Total Logged</span>
          </div>
          <div className="text-3xl font-black text-primary">{stats.totalDays}</div>
          <div className="text-xs text-outline mt-1">Days logged in {getMonthName(selectedMonth - 1)}</div>
        </div>

        {/* Present */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-surface-variant shadow-level-1">
          <div className="flex items-center gap-2 text-on-tertiary-container mb-2">
            <span className="material-symbols-outlined text-tertiary-container">check_circle</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Present</span>
          </div>
          <div className="text-3xl font-black text-primary">{stats.present}</div>
          <div className="text-xs text-on-tertiary-container mt-1">On-time attendances</div>
        </div>

        {/* Late Occurrences */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-surface-variant shadow-level-1">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <span className="material-symbols-outlined text-amber-600">schedule</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Late</span>
          </div>
          <div className="text-3xl font-black text-primary">{stats.late}</div>
          <div className="text-xs text-amber-700 mt-1">Check-ins after threshold</div>
        </div>

        {/* Leaves / Half Days */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-surface-variant shadow-level-1">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <span className="material-symbols-outlined">event_busy</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Leaves/Half</span>
          </div>
          <div className="text-3xl font-black text-primary">{stats.leaves}</div>
          <div className="text-xs text-on-surface-variant mt-1">Approved time off</div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-surface-variant overflow-hidden">
        <div className="p-6 border-b border-surface-container flex justify-between items-center">
          <h3 className="text-lg font-semibold text-primary">Daily Attendance Log</h3>
          <span className="text-xs text-on-surface-variant">
            Showing {historyData.records.length} records
          </span>
        </div>

        {historyLoading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchHistory(selectedYear, selectedMonth)} />
        ) : historyData.records.length === 0 ? (
          <EmptyState
            icon="calendar_today"
            title="No attendance records found"
            description={`No attendance records exist for ${getMonthName(selectedMonth - 1)} ${selectedYear}.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Check In</th>
                  <th className="p-4">Check Out</th>
                  <th className="p-4">Total Hours</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-surface-container">
                {historyData.records.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-semibold text-primary">{formatDate(record.date)}</td>
                    <td className="p-4 text-on-surface-variant text-xs">
                      {record.checkIn ? formatTime(record.checkIn) : '--'}
                    </td>
                    <td className="p-4 text-on-surface-variant text-xs">
                      {record.checkOut ? formatTime(record.checkOut) : '--'}
                    </td>
                    <td className="p-4 text-xs font-medium text-primary">{record.totalHours}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Present' ? 'bg-tertiary-fixed/20 text-on-tertiary-container' :
                        record.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                        record.status === 'Half Day' ? 'bg-blue-100 text-blue-800' :
                        record.status === 'On Leave' ? 'bg-purple-100 text-purple-800' :
                        'bg-error-container/50 text-error'
                      }`}>
                        {record.status}
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
