import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { role, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
