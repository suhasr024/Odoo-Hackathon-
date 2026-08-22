import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEmployees } from '../../hooks/useEmployees';
import { Modal } from '../common/Modal';
import { NotificationPopover } from '../common/NotificationPopover';

export const AdminHeader = ({ onMobileMenuToggle }) => {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const navigate = useNavigate();
  const location = useLocation();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Admin Overview';
    if (path === '/admin/employees') return 'Employee Management';
    if (path === '/admin/attendance') return 'Attendance Overview';
    if (path === '/admin/leaves' || path === '/admin/leave-requests') return 'Leave Management';
    if (path === '/admin/settings') return 'System Settings';
    if (path === '/admin/profile') return 'Administrator Profile';
    return 'Admin Panel';
  };

  // Scoped Global Search: Directory Search
  const matchingEmployees = searchQuery.trim()
    ? employees.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <>
      <header className="w-full h-16 sticky top-0 z-30 bg-surface/90 backdrop-blur-md shadow-sm flex justify-between items-center px-4 md:px-8 border-b border-outline-variant">
        {/* Mobile Hamburger Toggle & Title */}
        <div className="flex items-center md:hidden">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 text-primary hover:bg-surface-container-high rounded-lg transition-colors mr-2"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-primary font-bold text-lg tracking-tight">Vantage Admin</span>
        </div>

        {/* Desktop Page Title */}
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-primary tracking-tight">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right Section: Scoped Search, Notifications, Help, Profile */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Scoped Directory Search */}
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search directory..."
              className="pl-9 pr-4 py-1.5 rounded-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary text-sm w-48 md:w-60 transition-all outline-none"
            />

            {/* Quick Search Dropdown */}
            {isSearchOpen && matchingEmployees.length > 0 && (
              <div className="absolute left-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-level-2 border border-surface-variant p-2 z-50">
                <div className="text-[10px] uppercase font-bold text-outline px-2 py-1">
                  Matching Employees
                </div>
                {matchingEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigate('/admin/employees');
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    <img src={emp.avatar} alt={emp.name} className="w-7 h-7 rounded-full object-cover" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-primary truncate">{emp.name}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">{emp.department} • {emp.employeeId}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Notifications Popover */}
          <NotificationPopover />

          {/* Quick Help Modal Trigger */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-full text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
            title="Admin Documentation"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>

          {/* Admin User Chip */}
          {user && (
            <div
              onClick={() => navigate('/admin/profile')}
              className="flex items-center gap-2 pl-2 border-l border-outline-variant cursor-pointer group"
              title="View Admin Profile"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant group-hover:ring-2 group-hover:ring-secondary transition-all shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-primary group-hover:text-secondary leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-secondary font-medium leading-tight">
                  Admin Panel
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Admin Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Vantage Admin Portal — Quick Help"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-sm text-on-surface-variant">
          <p>
            Welcome to the <strong>Admin Control Center</strong>. Overview of administrative modules:
          </p>
          <ul className="space-y-2 list-disc list-inside text-xs">
            <li><strong>Dashboard:</strong> High-level metrics, active employee status, and pending leave approvals.</li>
            <li><strong>Employee Management:</strong> Directory search, filter by department/role/status, add/edit employees, and status toggle.</li>
            <li><strong>Attendance Overview:</strong> Sourced from centralized attendance logs with monthly navigation and status metrics.</li>
            <li><strong>Leave Management:</strong> Review employee leave requests with single-action approval and mandatory rejection reasons.</li>
            <li><strong>Settings:</strong> Organization defaults, attendance thresholds, and leave policies.</li>
            <li><strong>Profile:</strong> Admin credentials, password management, 2FA demo configuration, and active session review.</li>
          </ul>
          <div className="pt-3 border-t border-surface-container flex justify-end">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
