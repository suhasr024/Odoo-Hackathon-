import React, { useState, useEffect, useMemo } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { formatDate, formatTime, getMonthName } from '../../utils/dateUtils';
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
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'weekly'

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

  // Group records by calendar week for Weekly View
  const weeklyRecords = useMemo(() => {
    const records = historyData.records || [];
    const weeks = {};

    records.forEach((r) => {
      const dayNum = parseInt(r.date.split('-')[2], 10);
      const weekIndex = Math.min(4, Math.floor((dayNum - 1) / 7));
      const weekKey = `Week ${weekIndex + 1}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          name: weekKey,
          range: `Aug ${(weekIndex * 7) + 1} - Aug ${Math.min(31, (weekIndex + 1) * 7)}`,
          present: 0,
          late: 0,
          halfDay: 0,
          leave: 0,
          absent: 0,
          totalHoursMins: 0,
          count: 0
        };
      }

      weeks[weekKey].count++;
      if (r.status === 'Present') weeks[weekKey].present++;
      else if (r.status === 'Late') weeks[weekKey].late++;
      else if (r.status === 'Half Day') weeks[weekKey].halfDay++;
      else if (r.status === 'On Leave') weeks[weekKey].leave++;
      else if (r.status === 'Absent') weeks[weekKey].absent++;
    });

    return Object.values(weeks);
  }, [historyData.records]);

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

      {/* Month Navigation & View Toggle Toolbar */}
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

        {/* PRD 3.4.1: Daily vs Weekly View Toggle */}
        <div className="flex bg-surface-container-lowest rounded-xl p-1 border border-surface-variant">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'daily'
                ? 'bg-secondary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'weekly'
                ? 'bg-secondary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Weekly View
          </button>
        </div>
      </div>

      {/* Monthly Statistics Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-variant shadow-level-1">
          <div className="text-xs font-semibold uppercase text-tertiary-container mb-1">Present Days</div>
          <div className="text-2xl md:text-3xl font-black text-primary">{stats.present}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">On-time attendances</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-variant shadow-level-1">
          <div className="text-xs font-semibold uppercase text-amber-800 mb-1">Late Arrivals</div>
          <div className="text-2xl md:text-3xl font-black text-amber-800">{stats.late}</div>
          <div className="text-[11px] text-amber-700 mt-1">Arrivals past 09:15 AM</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-variant shadow-level-1">
          <div className="text-xs font-semibold uppercase text-secondary mb-1">Leaves / Half-day</div>
          <div className="text-2xl md:text-3xl font-black text-primary">{stats.leaves}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Approved absences</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-variant shadow-level-1">
          <div className="text-xs font-semibold uppercase text-error mb-1">Absences</div>
          <div className="text-2xl md:text-3xl font-black text-error">{stats.absent}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Unrecorded working days</div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-surface-variant overflow-hidden">
        <div className="p-6 border-b border-surface-container flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-primary">
              {viewMode === 'daily' ? 'Daily Attendance History' : 'Weekly Attendance Summary'}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {viewMode === 'daily' ? 'Individual punch-in and punch-out logs' : 'Aggregated attendance metrics by calendar week'}
            </p>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            {getMonthName(selectedMonth - 1)} {selectedYear}
          </span>
        </div>

        {historyLoading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchHistory(selectedYear, selectedMonth)} />
        ) : (!historyData.records || historyData.records.length === 0) ? (
          <EmptyState
            icon="calendar_month"
            title="No Attendance Records"
            description={`No attendance records found for ${getMonthName(selectedMonth - 1)} ${selectedYear}.`}
          />
        ) : viewMode === 'daily' ? (
          /* Daily View Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-semibold uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Check In</th>
                  <th className="p-4">Check Out</th>
                  <th className="p-4">Total Hours</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {historyData.records.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-bold text-primary">{formatDate(row.date)}</td>
                    <td className="p-4 text-on-surface-variant">{row.checkIn ? formatTime(row.checkIn) : '--'}</td>
                    <td className="p-4 text-on-surface-variant">{row.checkOut ? formatTime(row.checkOut) : '--'}</td>
                    <td className="p-4 font-semibold text-primary">{row.totalHours}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        row.status === 'Present' ? 'bg-tertiary-fixed/20 text-on-tertiary-container' :
                        row.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                        row.status === 'Half Day' ? 'bg-blue-100 text-blue-800' :
                        row.status === 'On Leave' ? 'bg-purple-100 text-purple-800' :
                        'bg-error-container/50 text-error'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Weekly View Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-semibold uppercase tracking-wider">
                  <th className="p-4">Week</th>
                  <th className="p-4">Date Range</th>
                  <th className="p-4">Present Days</th>
                  <th className="p-4">Late Days</th>
                  <th className="p-4">Half Days</th>
                  <th className="p-4">Leaves Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {weeklyRecords.map((w) => (
                  <tr key={w.name} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-bold text-primary">{w.name}</td>
                    <td className="p-4 text-on-surface-variant">{w.range}</td>
                    <td className="p-4 font-bold text-tertiary-container">{w.present} Days</td>
                    <td className="p-4 text-amber-800">{w.late} Days</td>
                    <td className="p-4 text-on-surface-variant">{w.halfDay} Days</td>
                    <td className="p-4 font-semibold text-secondary">{w.leave} Days</td>
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
