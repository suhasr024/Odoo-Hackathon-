import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { role, loading } = useAuth();
  const { error } = useToast();

  const isAllowed = allowedRoles.includes(role);

  useEffect(() => {
    if (!loading && !isAllowed) {
      error("You don't have permission to access that page.");
    }
  }, [loading, isAllowed, error]);

  if (loading) {
    return null;
  }

  if (!isAllowed) {
    const destination = role === 'Admin' ? '/admin' : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
};
