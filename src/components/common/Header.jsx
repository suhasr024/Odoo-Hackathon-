import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from './Modal';

export const Header = ({ onMobileMenuToggle }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/attendance') return 'Attendance';
    if (path === '/leave-requests') return 'Leave Requests';
    if (path === '/leave-requests/apply') return 'Apply for Leave';
    if (path === '/profile') return 'Employee Profile';
    return 'HRMS Portal';
  };

  return (
    <>
      <header className="w-full h-16 sticky top-0 z-30 bg-surface/90 backdrop-blur-md shadow-sm flex justify-between items-center px-4 md:px-8 border-b border-surface-variant">
        {/* Mobile brand & toggle */}
        <div className="flex items-center md:hidden">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 text-primary hover:bg-surface-container-high rounded-lg transition-colors mr-2"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-lg tracking-tight">Vantage</span>
          </div>
        </div>

        {/* Desktop Active Page Title */}
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-primary tracking-tight">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right Action Icons: Search, Notifications, Help, User Preview */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Quick Search */}
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 rounded-full bg-surface-container-low border border-surface-variant focus:border-secondary focus:ring-1 focus:ring-secondary text-sm w-48 md:w-60 transition-all outline-none"
            />
          </div>

          {/* Notification Bell */}
          <button
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
          </button>

          {/* Help `?` Icon - Preserved strictly in top header */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-full text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
            title="Help & Documentation"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>

          {/* User Profile avatar preview */}
          {user && (
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-2 border-l border-surface-variant cursor-pointer group"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-surface-variant group-hover:ring-2 group-hover:ring-secondary transition-all shrink-0">
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
                <span className="text-[10px] text-on-surface-variant leading-tight">
                  {user.designation || role}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Vantage Employee Portal — Quick Help"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-sm text-on-surface-variant">
          <p>
            Welcome to the <strong>Vantage Employee Suite</strong>. Here is a quick guide on navigating the employee portal:
          </p>
          <ul className="space-y-2 list-disc list-inside text-xs">
            <li><strong>Dashboard:</strong> View daily check-in status, today's elapsed timer, and leave balance summary.</li>
            <li><strong>Attendance:</strong> Record your daily punch in/out and review monthly attendance logs.</li>
            <li><strong>Leave Requests:</strong> Apply for annual, sick, or unpaid leave, track approval statuses, or cancel pending requests.</li>
            <li><strong>Profile:</strong> Update your personal contact information and manage security credentials.</li>
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
