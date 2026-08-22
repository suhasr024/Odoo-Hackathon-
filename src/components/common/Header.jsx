import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from './Modal';
import { NotificationPopover } from './NotificationPopover';

export const Header = ({ onMobileMenuToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/attendance') return 'My Attendance';
    if (path === '/leave-requests') return 'Leave Requests';
    if (path === '/leave-requests/apply') return 'Apply for Leave';
    if (path === '/profile') return 'My Profile';
    return 'Vantage Portal';
  };

  return (
    <>
      <header className="w-full h-16 sticky top-0 z-30 bg-surface/90 backdrop-blur-md shadow-sm flex justify-between items-center px-4 md:px-8 border-b border-outline-variant">
        {/* Mobile menu hamburger toggle button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 text-primary hover:bg-surface-container-high rounded-lg transition-colors mr-2"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-primary font-bold text-lg tracking-tight">Vantage</span>
        </div>

        {/* Desktop Page Title */}
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-primary tracking-tight">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right Section: Notification Popover, Help, Profile Avatar */}
        <div className="flex items-center gap-3 md:gap-4">
          <NotificationPopover />

          {/* Quick Help Modal Trigger (Mandatory per stitch designs) */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-full text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
            title="Help & Guidelines"
            aria-label="Help & Guidelines"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>

          {/* User Profile Avatar with Direct Navigation */}
          {user && (
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-2 border-l border-outline-variant cursor-pointer group"
              title="View Profile"
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
                <span className="text-[10px] text-on-surface-variant leading-tight">
                  {user.employeeId}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Quick Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Vantage Employee Suite — Quick Guide"
        maxWidth="max-w-md"
      >
        <div className="space-y-3 text-sm text-on-surface-variant">
          <p>
            Welcome to the <strong>Vantage Employee Suite</strong>. Key features:
          </p>
          <ul className="space-y-2 list-disc list-inside text-xs">
            <li><strong>Dashboard:</strong> View daily check-in status, working timer, and current leave balances.</li>
            <li><strong>Attendance:</strong> Record punch-in/out and review monthly attendance history.</li>
            <li><strong>Leave Requests:</strong> Apply for paid or unpaid leaves and track approvals.</li>
            <li><strong>Profile:</strong> View official employee record, update contact details, and manage password.</li>
          </ul>
          <div className="pt-3 border-t border-surface-container flex justify-end">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
