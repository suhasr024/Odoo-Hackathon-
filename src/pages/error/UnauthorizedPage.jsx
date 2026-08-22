import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error } = useToast();

  useEffect(() => {
    error("You don't have permission to access that page.");
  }, [error]);

  const handleReturn = () => {
    if (user?.role === 'Admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-error-container text-error flex items-center justify-center mb-6 shadow-level-1">
        <span className="material-symbols-outlined text-[36px]">shield_person</span>
      </div>
      <h1 className="text-2xl font-bold text-primary mb-2">Access Restricted</h1>
      <p className="text-sm text-on-surface-variant max-w-md mb-8">
        Your role (<strong>{user?.role || 'Employee'}</strong>) does not have authorization to view this administrative resource.
      </p>
      <button
        onClick={handleReturn}
        className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-container transition-colors shadow-sm"
      >
        Return to {user?.role === 'Admin' ? 'Admin Dashboard' : 'Employee Dashboard'}
      </button>
    </div>
  );
};
