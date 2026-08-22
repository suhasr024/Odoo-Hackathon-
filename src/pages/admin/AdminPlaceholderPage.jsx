import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const AdminPlaceholderPage = () => {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-level-1 border border-surface-variant">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-secondary text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Control Center</h1>
            <p className="text-xs text-on-surface-variant">Restricted Admin Area Placeholder (Role-Guard Verified)</p>
          </div>
        </div>
        <p className="text-sm text-on-surface mb-4">
          Logged in as: <strong>{user?.name}</strong> ({user?.role})
        </p>
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant text-xs text-on-surface-variant">
          ✅ Part 1 route protection active. Standard employee accounts cannot reach this page and will be redirected.
        </div>
      </div>
    </div>
  );
};
