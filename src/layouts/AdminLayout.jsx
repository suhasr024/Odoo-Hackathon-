import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { Toast } from '../components/common/Toast';

export const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-on-background min-h-screen flex antialiased">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Admin Workspace */}
      <div className="flex-1 ml-0 md:ml-[280px] w-full max-w-full md:max-w-[calc(100%-280px)] flex flex-col min-h-screen">
        <AdminHeader onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-surface-bright">
          <Outlet />
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
};
