import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePayroll } from '../../hooks/usePayroll';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const PayrollPage = () => {
  const { user } = useAuth();
  const { salary, loading, downloadSlip } = usePayroll();
  const navigate = useNavigate();

  const [showAllHistory, setShowAllHistory] = useState(false);

  if (loading || !salary) {
    return <LoadingSkeleton count={3} />;
  }

  const historyList = salary.history || [];
  const displayedHistory = showAllHistory ? historyList : historyList.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">My Payroll & Compensation</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Review your salary breakdown, disbursement history, and official payslips
        </p>
      </div>

      {/* Main Pay Summary Bento Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-outline-variant">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-surface-container">
          <div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
              Net Monthly Disbursed Pay
            </span>
            <div className="text-4xl md:text-5xl font-black text-primary tracking-tight">
              ${salary.netSalary.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-secondary-container bg-secondary/10 px-2.5 py-0.5 rounded-full">
                Pay Period: {salary.payPeriod}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Gross: ${salary.grossSalary.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => downloadSlip(user, salary, 'PAY-CURRENT')}
              className="bg-secondary text-white font-semibold text-xs md:text-sm px-5 py-2.5 rounded-xl hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download Salary Slip
            </button>
            <button
              onClick={() => navigate('/profile?tab=documents')}
              className="bg-surface-container-low text-primary font-semibold text-xs md:text-sm px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors border border-surface-variant flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              View Tax Documents
            </button>
          </div>
        </div>

        {/* Breakdown Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">Basic Pay</span>
            <span className="text-lg font-bold text-primary block mt-1">${salary.basicPay.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">HRA (Housing)</span>
            <span className="text-lg font-bold text-primary block mt-1">${salary.hra.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">Other Allowances</span>
            <span className="text-lg font-bold text-primary block mt-1">${salary.otherAllowances.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-xl bg-error-container/20 border border-error-container/40">
            <span className="text-[10px] uppercase font-bold text-error tracking-wider block">Tax Deduction</span>
            <span className="text-lg font-bold text-error block mt-1">-${salary.taxDeduction.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-xl bg-error-container/20 border border-error-container/40">
            <span className="text-[10px] uppercase font-bold text-error tracking-wider block">Other Deductions</span>
            <span className="text-lg font-bold text-error block mt-1">-${salary.otherDeductions.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payroll History Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant overflow-hidden">
        <div className="p-6 border-b border-surface-container flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-primary">Disbursement History</h2>
            <p className="text-xs text-on-surface-variant">Previous monthly salary slips and payment records</p>
          </div>
          {historyList.length > 3 && (
            <button
              onClick={() => setShowAllHistory(prev => !prev)}
              className="text-xs font-semibold text-secondary hover:underline"
            >
              {showAllHistory ? 'Show Recent Only' : 'View All History'}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Pay Period</th>
                <th className="p-4">Reference ID</th>
                <th className="p-4">Net Amount</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Paid On</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container">
              {displayedHistory.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 font-bold text-primary">{row.period}</td>
                  <td className="p-4 font-mono text-xs text-on-surface-variant">{row.id}</td>
                  <td className="p-4 font-bold text-primary">${row.netAmount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary-fixed/20 text-on-tertiary-container">
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-on-surface-variant">{row.paidOn}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => downloadSlip(user, salary, row.id)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors"
                      title="Download Payslip"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
