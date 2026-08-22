import React, { useState } from 'react';
import { usePayroll } from '../../hooks/usePayroll';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminPayrollPage = () => {
  const { allSalaries, loading, editSalary } = usePayroll();

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({
    basicPay: 0,
    hra: 0,
    otherAllowances: 0,
    taxDeduction: 0,
    otherDeductions: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setEditForm({
      basicPay: emp.basicPay || 0,
      hra: emp.hra || 0,
      otherAllowances: emp.otherAllowances || 0,
      taxDeduction: emp.taxDeduction || 0,
      otherDeductions: emp.otherDeductions || 0
    });
  };

  // Live computed values in modal
  const liveGross = (Number(editForm.basicPay) || 0) + (Number(editForm.hra) || 0) + (Number(editForm.otherAllowances) || 0);
  const liveNet = Math.max(0, liveGross - (Number(editForm.taxDeduction) || 0) - (Number(editForm.otherDeductions) || 0));

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;
    try {
      setIsSubmitting(true);
      await editSalary(editingEmployee.userId, editForm);
      setEditingEmployee(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Organization Payroll Management</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Configure employee salary structures, allowances, deductions, and compensation packages
        </p>
      </div>

      {/* Salary Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant overflow-hidden">
        <div className="p-6 border-b border-surface-container flex justify-between items-center">
          <h2 className="text-lg font-bold text-primary">Employee Salary Structures</h2>
          <span className="text-xs text-on-surface-variant font-medium">
            {allSalaries.length} Employees Configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Basic Pay</th>
                <th className="p-4">Allowances</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Gross Salary</th>
                <th className="p-4">Net Salary</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container">
              {allSalaries.map((emp) => {
                const totalAllowances = (emp.hra || 0) + (emp.otherAllowances || 0);
                const totalDeductions = (emp.taxDeduction || 0) + (emp.otherDeductions || 0);

                return (
                  <tr key={emp.userId} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover bg-surface-container shrink-0 border border-surface-variant"
                        />
                        <div>
                          <span className="font-bold text-primary block leading-tight">{emp.name}</span>
                          <span className="text-xs font-mono text-secondary font-semibold">{emp.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant">{emp.department}</td>
                    <td className="p-4 text-xs font-bold text-primary">
                      {emp.basicPay > 0 ? (
                        `₹${emp.basicPay.toLocaleString()}`
                      ) : (
                        <span className="text-outline italic">Not set</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant">+₹{totalAllowances.toLocaleString()}</td>
                    <td className="p-4 text-xs text-error">-₹{totalDeductions.toLocaleString()}</td>
                    <td className="p-4 text-xs font-semibold text-primary">₹{emp.grossSalary.toLocaleString()}</td>
                    <td className="p-4 text-xs font-bold text-secondary">₹{emp.netSalary.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                        title="Edit Salary"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Salary Modal */}
      <Modal
        isOpen={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        title={`Edit Compensation: ${editingEmployee?.name}`}
        maxWidth="max-w-lg"
      >
        {editingEmployee && (
          <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-primary">{editingEmployee.name}</p>
                <p className="text-[11px] text-on-surface-variant">{editingEmployee.department} • {editingEmployee.employeeId}</p>
              </div>
              <span className="text-xs font-semibold text-secondary">Pay Period: August 2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Basic Pay (₹) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editForm.basicPay}
                  onChange={(e) => setEditForm({ ...editForm, basicPay: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  House Rent Allowance (HRA) (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.hra}
                  onChange={(e) => setEditForm({ ...editForm, hra: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Other Allowances (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.otherAllowances}
                  onChange={(e) => setEditForm({ ...editForm, otherAllowances: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Tax Deduction (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.taxDeduction}
                  onChange={(e) => setEditForm({ ...editForm, taxDeduction: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Other Deductions (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.otherDeductions}
                  onChange={(e) => setEditForm({ ...editForm, otherDeductions: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                />
              </div>
            </div>

            {/* Live Computed Totals Display */}
            <div className="p-4 rounded-xl bg-surface-container-high border border-surface-variant flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Live Computed Gross</span>
                <p className="text-base font-bold text-primary">₹{liveGross.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-secondary">Live Computed Net</span>
                <p className="text-lg font-black text-secondary">₹{liveNet.toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-low text-primary font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-secondary-container hover:text-on-secondary-container transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
