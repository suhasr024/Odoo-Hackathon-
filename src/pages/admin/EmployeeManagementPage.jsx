import React, { useState, useMemo } from 'react';
import { useEmployees } from '../../hooks/useEmployees';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { DEPARTMENTS, DESIGNATIONS } from '../../config/organizationOptions';

export const EmployeeManagementPage = () => {
  const {
    employees,
    loading,
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    addEmployee,
    updateEmployee,
    toggleStatus
  } = useEmployees();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [statusConfirmEmployee, setStatusConfirmEmployee] = useState(null);

  // Add Employee Form State
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    role: 'Employee', // System Access Role
    status: 'Active'
  });
  const [addError, setAddError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Employee Form State
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    designation: '',
    role: 'Employee',
    phone: '',
    status: 'Active'
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    try {
      setIsSubmitting(true);
      await addEmployee(addForm);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        email: '',
        phone: '',
        department: 'Engineering',
        designation: '',
        role: 'Employee',
        status: 'Active'
      });
    } catch (err) {
      setAddError(err.message || 'Failed to add employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setEditForm({
      name: emp.name,
      department: emp.department,
      designation: emp.designation,
      role: emp.role,
      phone: emp.phone,
      status: emp.status
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateEmployee(editingEmployee.id, editForm);
      setEditingEmployee(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatusConfirm = async () => {
    if (!statusConfirmEmployee) return;
    try {
      setIsSubmitting(true);
      await toggleStatus(statusConfirmEmployee.id);
      setStatusConfirmEmployee(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header & Add Employee Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Employee Management</h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Manage employee directory, job designations, system access roles, and employment status
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-secondary text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Employee
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-level-1 border border-outline-variant flex flex-wrap justify-between items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-variant rounded-xl text-xs text-primary outline-none focus:border-secondary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-surface-container-low border border-surface-variant text-primary outline-none"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* System Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-surface-container-low border border-surface-variant text-primary outline-none"
          >
            <option value="ALL">All System Roles</option>
            <option value="Employee">Employee Access</option>
            <option value="Admin">Admin Access</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-surface-container-low border border-surface-variant text-primary outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employee Directory Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant overflow-hidden">
        <div className="p-6 border-b border-surface-container flex justify-between items-center">
          <h2 className="text-lg font-bold text-primary">Workforce Directory</h2>
          <span className="text-xs text-on-surface-variant font-medium">
            {employees.length} Employees Found
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : employees.length === 0 ? (
          <EmptyState
            icon="group"
            title="No employees found"
            description="No employees matched your current search and filter criteria."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setDepartmentFilter('ALL');
              setRoleFilter('ALL');
              setStatusFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-surface-container">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-surface-container-low/50 transition-colors">
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
                    <td className="p-4">
                      <p className="text-xs text-primary font-medium">{emp.email}</p>
                      <p className="text-[11px] text-on-surface-variant">{emp.phone}</p>
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant font-medium">{emp.department}</td>
                    <td className="p-4 text-xs text-primary font-semibold">{emp.designation}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        emp.role === 'Admin'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-surface-container-high text-primary'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        emp.status === 'Active'
                          ? 'bg-tertiary-fixed/20 text-on-tertiary-container'
                          : 'bg-surface-variant text-on-surface-variant'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingEmployee(emp)}
                          className="p-1.5 text-on-surface-variant hover:text-secondary rounded-lg hover:bg-surface-container transition-colors"
                          title="View Profile"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container transition-colors"
                          title="Edit Employee"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setStatusConfirmEmployee(emp)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            emp.status === 'Active'
                              ? 'text-amber-700 hover:bg-amber-100'
                              : 'text-tertiary-container hover:bg-tertiary-fixed/30'
                          }`}
                          title={emp.status === 'Active' ? 'Deactivate Employee' : 'Activate Employee'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {emp.status === 'Active' ? 'person_off' : 'person_check'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          {addError && (
            <div className="p-3 rounded-lg bg-error-container/40 text-error font-medium">
              {addError}
            </div>
          )}

          <div>
            <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Full Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="e.g. Rachel Adams"
              className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Work Email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                required
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="name@vantage.io"
                className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Department <span className="text-error">*</span>
              </label>
              <select
                value={addForm.department}
                onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Designation <span className="text-error">*</span>
              </label>
              <input
                type="text"
                list="add-designation-options"
                required
                value={addForm.designation}
                onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                placeholder="Select or type role"
                className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
              />
              <datalist id="add-designation-options">
                {DESIGNATIONS.map(d => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                System Access Role <span className="text-error">*</span>
              </label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
              >
                <option value="Employee">Employee (Standard Portal)</option>
                <option value="Admin">Admin (Full Control)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Employment Status
              </label>
              <select
                value={addForm.status}
                onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-container flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container-low text-primary font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-secondary-container hover:text-on-secondary-container transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        title={`Edit Employee: ${editingEmployee?.name}`}
        maxWidth="max-w-lg"
      >
        {editingEmployee && (
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  list="edit-designation-options"
                  required
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  placeholder="Select or type role"
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                />
                <datalist id="edit-designation-options">
                  {DESIGNATIONS.map(d => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  System Access Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
              />
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

      {/* Employee Details Modal */}
      <Modal
        isOpen={Boolean(viewingEmployee)}
        onClose={() => setViewingEmployee(null)}
        title="Employee Profile Details"
        maxWidth="max-w-lg"
      >
        {viewingEmployee && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
              <img
                src={viewingEmployee.avatar}
                alt={viewingEmployee.name}
                className="w-14 h-14 rounded-full object-cover border border-surface-variant"
              />
              <div>
                <h3 className="text-base font-bold text-primary">{viewingEmployee.name}</h3>
                <p className="text-xs font-semibold text-secondary">{viewingEmployee.designation}</p>
                <p className="text-outline text-[11px]">{viewingEmployee.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-outline uppercase font-semibold block">Employee ID</span>
                <span className="font-mono font-bold text-primary">{viewingEmployee.employeeId}</span>
              </div>
              <div>
                <span className="text-outline uppercase font-semibold block">System Access</span>
                <span className="font-semibold text-primary">{viewingEmployee.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-outline uppercase font-semibold block">Email</span>
                <span className="font-semibold text-primary truncate block">{viewingEmployee.email}</span>
              </div>
              <div>
                <span className="text-outline uppercase font-semibold block">Phone</span>
                <span className="font-semibold text-primary">{viewingEmployee.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-outline uppercase font-semibold block">Join Date</span>
                <span className="font-semibold text-primary">{viewingEmployee.joinDate}</span>
              </div>
              <div>
                <span className="text-outline uppercase font-semibold block">Status</span>
                <span className="font-semibold text-primary">{viewingEmployee.status}</span>
              </div>
            </div>

            {viewingEmployee.bio && (
              <div>
                <span className="text-outline uppercase font-semibold block">Bio</span>
                <p className="p-3 bg-surface-container-low rounded-xl text-on-surface-variant mt-1 leading-relaxed">
                  {viewingEmployee.bio}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-surface-container flex justify-end">
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal
        isOpen={Boolean(statusConfirmEmployee)}
        onClose={() => setStatusConfirmEmployee(null)}
        title="Confirm Status Change"
        maxWidth="max-w-md"
      >
        {statusConfirmEmployee && (
          <div className="space-y-4 text-xs">
            <p className="text-on-surface-variant">
              Are you sure you want to change the status of <strong>{statusConfirmEmployee.name}</strong> from <strong>{statusConfirmEmployee.status}</strong> to <strong>{statusConfirmEmployee.status === 'Active' ? 'Inactive' : 'Active'}</strong>?
            </p>
            <div className="pt-3 border-t border-surface-container flex justify-end gap-2">
              <button
                onClick={() => setStatusConfirmEmployee(null)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low text-primary font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatusConfirm}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-secondary text-white font-semibold hover:bg-secondary-container hover:text-on-secondary-container"
              >
                {isSubmitting ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
