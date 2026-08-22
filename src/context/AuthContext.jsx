import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { useToast } from '../hooks/useToast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { success, error: toastError } = useToast();

  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      const session = await authService.getCurrentSession();
      if (session) {
        setUser(session.user);
        setRole(session.role);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('[AuthContext] Session init error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const session = await authService.login(email, password);
      setUser(session.user);
      setRole(session.role);
      setIsAuthenticated(true);
      success(`Welcome back, ${session.user.name}!`);
      return session;
    } catch (err) {
      toastError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
      success('Logged out successfully.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (editableFields) => {
    if (!user) return;
    try {
      const updated = await profileService.updateProfile(user.id, editableFields);
      setUser(updated);
      success('Profile updated successfully!');
      return updated;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    if (!user) return;
    try {
      await profileService.changePassword(user.id, currentPassword, newPassword, confirmPassword);
      success('Password changed successfully!');
      return true;
    } catch (err) {
      toastError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated,
      loading,
      error,
      login,
      logout,
      updateProfile,
      changePassword,
      refreshSession: initSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};
