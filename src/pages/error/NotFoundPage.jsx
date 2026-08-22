import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-secondary mb-2">404</h1>
      <h2 className="text-xl font-bold text-primary mb-2">Page Not Found</h2>
      <p className="text-sm text-on-surface-variant max-w-md mb-6">
        The page you are looking for does not exist or has been relocated.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-6 py-2.5 rounded-xl bg-secondary text-white font-medium text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
};
