import React, { useState, useMemo } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { useLeave } from '../../hooks/useLeave';
import { usePayroll } from '../../hooks/usePayroll';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/common/Modal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const AdminReportsPage = () => {
  const { allSalaries, downloadSlip } = usePayroll();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState('attendance');
  const [payrollSearch, setPayrollSearch] = useState('');
  const [selectedSlipEmployee, setSelectedSlipEmployee] = useState(null);

  // Quick Action Handler
  const handleQuickAction = (actionName) => {
    success(`Action "${actionName}" executed successfully.`);
  };

  // Leave chart data
  const leaveChartData = [
    { name: 'Annual Leave', value: 12, color: '#0ea5e9' },
    { name: 'Sick Leave', value: 5, color: '#f59e0b' },
    { name: 'Unpaid Leave', value: 2, color: '#8b5cf6' }
  ];

  const filteredPayroll = useMemo(() => {
    if (!payrollSearch.trim()) return allSalaries;
    const q = payrollSearch.toLowerCase();
    return allSalaries.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }, [allSalaries, payrollSearch]);

  const tabs = [
    { id: 'attendance', name: 'Attendance Report', icon: 'event_available' },
    { id: 'leaves', name: 'Leave Report', icon: 'event_busy' },
    { id: 'payroll', name: 'Payroll & Salary Slips', icon: 'payments' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Organization Reports & Analytics</h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Cross-department insights on attendance compliance, leave utilization, and payroll disbursements
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuickAction('Email Absent Employees')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface-container-low border border-surface-variant text-primary hover:bg-surface-container transition-colors"
          >
            Email Absent Staff
          </button>
          <button
            onClick={() => handleQuickAction('Schedule Attendance Review')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container transition-colors"
          >
            Schedule Review
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-container gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all shrink-0 ${
              activeTab === tab.id
                ? 'border-secondary text-secondary bg-secondary/5'
                : 'border-transparent text-on-surface-variant hover:text-primary hover:border-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Attendance Report */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant">
              <span className="text-xs font-bold text-tertiary-container uppercase tracking-wider block">Present Rate</span>
              <span className="text-3xl font-black text-primary block mt-1">94.2%</span>
              <p className="text-xs text-outline mt-1">August 2026 compliance</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Late Arrivals</span>
              <span className="text-3xl font-black text-amber-800 block mt-1">6</span>
              <p className="text-xs text-outline mt-1">Across all departments</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Half Days</span>
              <span className="text-3xl font-black text-primary block mt-1">3</span>
              <p className="text-xs text-outline mt-1">Partial sessions logged</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant">
              <span className="text-xs font-bold text-error uppercase tracking-wider block">Absences</span>
              <span className="text-3xl font-black text-error block mt-1">2</span>
              <p className="text-xs text-outline mt-1">Unexcused absences</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant p-6">
            <h3 className="text-base font-bold text-primary mb-4">Monthly Department Attendance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-semibold uppercase tracking-wider">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Present Days</th>
                    <th className="p-3">Late Days</th>
                    <th className="p-3">Half Days</th>
                    <th className="p-3">Leaves Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {allSalaries.map(emp => (
                    <tr key={emp.userId} className="hover:bg-surface-container-low/50">
                      <td className="p-3 font-bold text-primary">{emp.name} ({emp.employeeId})</td>
                      <td className="p-3 text-on-surface-variant">{emp.department}</td>
                      <td className="p-3 font-bold text-tertiary-container">18 Days</td>
                      <td className="p-3 text-amber-800">1 Day</td>
                      <td className="p-3 text-on-surface-variant">0 Days</td>
                      <td className="p-3 font-bold text-secondary">2 Days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Leave Report */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Total Requests</span>
              <span className="text-3xl font-black text-primary block mt-1">19</span>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant">
              <span className="text-xs font-bold text-tertiary-container uppercase tracking-wider block">Approved</span>
              <span className="text-3xl font-black text-primary block mt-1">14</span>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Pending</span>
              <span className="text-3xl font-black text-amber-800 block mt-1">3</span>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant">
              <span className="text-xs font-bold text-error uppercase tracking-wider block">Rejected</span>
              <span className="text-3xl font-black text-error block mt-1">2</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recharts Chart */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant p-6 flex flex-col justify-between">
              <h3 className="text-base font-bold text-primary mb-2">Leave Type Distribution</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leaveChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {leaveChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leave Details Table */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant p-6">
              <h3 className="text-base font-bold text-primary mb-4">Recent Leave Utilization</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-semibold uppercase tracking-wider">
                      <th className="p-3">Employee</th>
                      <th className="p-3">Leave Type</th>
                      <th className="p-3">Days</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    <tr>
                      <td className="p-3 font-bold text-primary">Alex Rivers</td>
                      <td className="p-3 text-secondary">Annual Leave</td>
                      <td className="p-3 font-bold">3 Days</td>
                      <td className="p-3"><span className="text-tertiary-container font-semibold">Approved</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-primary">Michael Ross</td>
                      <td className="p-3 text-secondary">Annual Leave</td>
                      <td className="p-3 font-bold">4 Days</td>
                      <td className="p-3"><span className="text-amber-800 font-semibold">Pending</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-primary">David Chen</td>
                      <td className="p-3 text-amber-700">Sick Leave</td>
                      <td className="p-3 font-bold">2 Days</td>
                      <td className="p-3"><span className="text-amber-800 font-semibold">Pending</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Payroll & Salary Slips */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-primary">Generate & Print Salary Slips</h3>
                <p className="text-xs text-on-surface-variant">Select an employee to generate printable payslip</p>
              </div>

              {/* Search */}
              <input
                type="text"
                value={payrollSearch}
                onChange={(e) => setPayrollSearch(e.target.value)}
                placeholder="Search by name, ID, department..."
                className="px-3.5 py-2 text-xs bg-surface-container-low border border-surface-variant rounded-xl text-primary outline-none focus:border-secondary w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-semibold uppercase tracking-wider">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Gross Salary</th>
                    <th className="p-3">Net Salary</th>
                    <th className="p-3 text-right">Generate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {filteredPayroll.map(emp => (
                    <tr key={emp.userId} className="hover:bg-surface-container-low/50">
                      <td className="p-3 font-bold text-primary">{emp.name} ({emp.employeeId})</td>
                      <td className="p-3 text-on-surface-variant">{emp.department}</td>
                      <td className="p-3 font-semibold text-primary">₹{emp.grossSalary.toLocaleString()}</td>
                      <td className="p-3 font-bold text-secondary">₹{emp.netSalary.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedSlipEmployee(emp)}
                          className="px-3 py-1.5 rounded-lg bg-secondary text-white font-semibold hover:bg-secondary-container hover:text-on-secondary-container transition-colors"
                        >
                          Generate Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Printable Salary Slip Modal */}
      <Modal
        isOpen={Boolean(selectedSlipEmployee)}
        onClose={() => setSelectedSlipEmployee(null)}
        title="Official Salary Payslip Preview"
        maxWidth="max-w-lg"
      >
        {selectedSlipEmployee && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-variant space-y-2">
              <div className="flex justify-between items-start border-b border-surface-container pb-2">
                <div>
                  <h4 className="text-base font-bold text-primary">Vantage Technologies Inc.</h4>
                  <p className="text-[11px] text-on-surface-variant">Confidential Salary Payslip</p>
                </div>
                <span className="text-xs font-semibold text-secondary">Period: August 2026</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div><span className="text-outline">Employee:</span> <span className="font-bold text-primary">{selectedSlipEmployee.name}</span></div>
                <div><span className="text-outline">ID:</span> <span className="font-mono font-bold text-primary">{selectedSlipEmployee.employeeId}</span></div>
                <div><span className="text-outline">Department:</span> <span className="font-semibold text-primary">{selectedSlipEmployee.department}</span></div>
                <div><span className="text-outline">Designation:</span> <span className="font-semibold text-primary">{selectedSlipEmployee.designation}</span></div>
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">Basic Salary:</span>
                <span className="font-bold text-primary">₹{selectedSlipEmployee.basicPay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">House Rent Allowance (HRA):</span>
                <span className="font-bold text-primary">₹{selectedSlipEmployee.hra.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">Other Allowances:</span>
                <span className="font-bold text-primary">₹{selectedSlipEmployee.otherAllowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-error font-medium">Income Tax (TDS):</span>
                <span className="font-bold text-error">-₹{selectedSlipEmployee.taxDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-error font-medium">Other Deductions:</span>
                <span className="font-bold text-error">-₹{selectedSlipEmployee.otherDeductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-black border-t-2 border-surface-container">
                <span className="text-primary">Net Disbursed Pay:</span>
                <span className="text-secondary">₹{selectedSlipEmployee.netSalary.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSlipEmployee(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-low text-primary font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadSlip(selectedSlipEmployee, selectedSlipEmployee, 'PAY-2026-08');
                  setSelectedSlipEmployee(null);
                }}
                className="px-5 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-secondary-container hover:text-on-secondary-container flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print / Download
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
