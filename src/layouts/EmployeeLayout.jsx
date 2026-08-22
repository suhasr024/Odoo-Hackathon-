import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { Toast } from '../components/common/Toast';

export const EmployeeLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-on-background min-h-screen flex antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 ml-0 md:ml-[280px] w-full max-w-full md:max-w-[calc(100%-280px)] flex flex-col min-h-screen">
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
};
