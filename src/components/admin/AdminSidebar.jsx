import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: 'dashboard',
      exact: true
    },
    {
      name: 'Employee Management',
      path: '/admin/employees',
      icon: 'badge'
    },
    {
      name: 'Attendance',
      path: '/admin/attendance',
      icon: 'event_available'
    },
    {
      name: 'Leave Requests',
      path: '/admin/leaves',
      icon: 'event_busy'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: 'settings'
    },
    {
      name: 'Profile',
      path: '/admin/profile',
      icon: 'person'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Admin Sidebar Shell matching Executive Zenith design */}
      <aside
        className={`w-[280px] h-screen fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant z-50 flex flex-col py-6 px-4 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Portal Header */}
        <div className="px-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-sm">
              <span className="material-symbols-outlined text-[22px] text-secondary-container">
                corporate_fare
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary tracking-tight leading-none">
                Vantage
              </h1>
              <p className="text-[11px] text-secondary font-semibold mt-0.5">
                Admin Portal
              </p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden text-on-surface-variant hover:text-primary p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Admin User Chip */}
        {user && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-surface-container-low rounded-xl border border-surface-variant/70">
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-surface-variant bg-surface-container">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-primary truncate">{user.name}</p>
              <p className="text-xs text-secondary font-medium truncate">{user.designation || 'Administrator'}</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto space-y-1.5 py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'text-secondary font-bold border-l-4 border-secondary bg-secondary-fixed text-on-secondary-container shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-[20px] transition-colors ${
                      isActive ? 'fill text-secondary' : 'group-hover:text-primary'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Action */}
        <div className="pt-4 border-t border-surface-container mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
