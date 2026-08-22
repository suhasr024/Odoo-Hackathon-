import React, { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { formatDate, formatTime, getMonthName } from '../../utils/dateUtils';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminAttendancePage = () => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(8); // August (1-indexed)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalDays: 0, present: 0, late: 0, absent: 0, leaves: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getAllAttendanceRecords(selectedYear, selectedMonth, {
        search: searchQuery,
        status: statusFilter
      });
      setRecords(data.records);
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching admin attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, searchQuery, statusFilter]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

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

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Organization Attendance Overview</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Latest synchronized attendance records across the enterprise
        </p>
      </div>

      {/* Month Navigation Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
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

        {/* Month, Year, Search, Status Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee..."
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-surface-variant text-primary outline-none focus:border-secondary"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-surface-variant text-primary outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
            <option value="On Leave">On Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Logged</span>
          <div className="text-3xl font-black text-primary">{stats.totalDays}</div>
          <p className="text-xs text-outline mt-1">Sessions recorded</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between">
          <span className="text-xs font-bold text-tertiary-container uppercase tracking-wider">Present</span>
          <div className="text-3xl font-black text-primary">{stats.present}</div>
          <p className="text-xs text-on-tertiary-container mt-1">On-time attendances</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Late Arrivals</span>
          <div className="text-3xl font-black text-amber-800">{stats.late}</div>
          <p className="text-xs text-amber-700 mt-1">Arrivals past threshold</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">On Leave / Half</span>
          <div className="text-3xl font-black text-primary">{stats.leaves}</div>
          <p className="text-xs text-on-surface-variant mt-1">Approved absences</p>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant overflow-hidden">
        <div className="p-6 border-b border-surface-container flex justify-between items-center">
          <h2 className="text-lg font-bold text-primary">Daily Attendance Log</h2>
          <span className="text-xs text-on-surface-variant font-medium">
            Showing {records.length} records
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : records.length === 0 ? (
          <EmptyState
            icon="event_available"
            title="No attendance records found"
            description={`No attendance records exist for ${getMonthName(selectedMonth - 1)} ${selectedYear}.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Check In</th>
                  <th className="p-4">Check Out</th>
                  <th className="p-4">Total Hours</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-surface-container">
                {records.map((r, idx) => (
                  <tr key={`${r.id}_${idx}`} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-primary leading-tight">{r.userName}</p>
                      <p className="text-[11px] text-on-surface-variant">{r.userDepartment} • {r.employeeId}</p>
                    </td>
                    <td className="p-4 font-medium text-xs text-primary">{formatDate(r.date)}</td>
                    <td className="p-4 text-xs text-on-surface-variant">{r.checkIn ? formatTime(r.checkIn) : '--'}</td>
                    <td className="p-4 text-xs text-on-surface-variant">{r.checkOut ? formatTime(r.checkOut) : '--'}</td>
                    <td className="p-4 text-xs font-bold text-primary">{r.totalHours}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        r.status === 'Present' ? 'bg-tertiary-fixed/20 text-on-tertiary-container' :
                        r.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                        r.status === 'Half Day' ? 'bg-blue-100 text-blue-800' :
                        r.status === 'On Leave' ? 'bg-purple-100 text-purple-800' :
                        'bg-error-container/50 text-error'
                      }`}>
                        {r.status}
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
