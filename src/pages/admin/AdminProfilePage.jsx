import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminProfilePage = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();

  // Personal Info Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    emergencyContact: '',
    address: '',
    bio: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA State (Demo configuration state)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [saving2FA, setSaving2FA] = useState(false);

  // Active Sessions State
  const [sessions, setSessions] = useState([]);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || '',
        address: user.address || '',
        bio: user.bio || ''
      });
      setIs2FAEnabled(Boolean(user.twoFactorEnabled));

      // Fetch dynamic sessions
      authService.getActiveSessions(user.id).then(setSessions);
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setPasswordError('New password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordError('New password must contain at least one special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword(currentPassword, newPassword, confirmPassword);
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!user) return;
    try {
      setSaving2FA(true);
      const nextState = !is2FAEnabled;
      await authService.toggle2FA(user.id, nextState);
      setIs2FAEnabled(nextState);
      setIs2FAModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving2FA(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!user) return;
    try {
      const updated = await authService.revokeSession(user.id, sessionId);
      setSessions(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) {
    return <LoadingSkeleton type="profile" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Administrator Profile</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Manage your personal details, credentials, and administrative security preferences
        </p>
      </div>

      {/* Bento Layout: Profile Card + Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Summary Card (Col Span 4) */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-outline-variant flex flex-col items-center text-center">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-surface bg-surface-container overflow-hidden mb-4 shadow-sm">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-lg font-bold text-primary">{user.name}</h2>
          <p className="text-xs font-semibold text-secondary mb-0.5">{user.designation}</p>
          <span className="inline-block text-[10px] uppercase font-bold text-on-secondary-fixed bg-secondary-fixed px-2.5 py-0.5 rounded-full mt-1">
            {user.role} Access
          </span>

          <div className="w-full mt-6 pt-6 border-t border-surface-container space-y-3 text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                Administrator ID (Read-Only)
              </span>
              <span className="text-xs font-mono font-bold text-primary bg-surface-container-low px-2 py-1 rounded inline-block mt-0.5">
                {user.employeeId}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                Email Address
              </span>
              <span className="text-xs text-primary font-medium truncate block">{user.email}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                Department
              </span>
              <span className="text-xs text-primary font-medium">{user.department}</span>
            </div>
          </div>
        </div>

        {/* Personal Details & Security Cards (Col Span 8) */}
        <div className="md:col-span-8 space-y-6">
          {/* Personal Info Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-outline-variant">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-container">
              <h3 className="text-base font-bold text-primary">Personal Details</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container transition-all"
                >
                  Edit Information
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-variant bg-white disabled:bg-surface-container-low text-primary outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-variant bg-white disabled:bg-surface-container-low text-primary outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Office / Residential Address
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-variant bg-white disabled:bg-surface-container-low text-primary outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Executive Bio
                </label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-surface-variant bg-white disabled:bg-surface-container-low text-primary resize-none outline-none focus:border-secondary"
                />
              </div>
            </div>
          </div>

          {/* Security & Authentication Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password Management */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary">lock</span>
                  <h4 className="text-sm font-bold text-primary">Password</h4>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">
                  Keep your account secure with regular password updates.
                </p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container text-primary transition-colors self-start"
              >
                Change Password
              </button>
            </div>

            {/* Two-Factor Authentication (2FA) */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary">security</span>
                  <h4 className="text-sm font-bold text-primary">Two-Factor Auth</h4>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">
                  Status: <strong>{is2FAEnabled ? 'Enabled' : 'Disabled'}</strong> (Demo State)
                </p>
              </div>
              <button
                onClick={() => setIs2FAModalOpen(true)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg self-start transition-colors ${
                  is2FAEnabled
                    ? 'bg-error-container/50 text-error hover:bg-error-container'
                    : 'bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container'
                }`}
              >
                {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>

          {/* Active Sessions Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary">devices</span>
                <h4 className="text-sm font-bold text-primary">Active Sessions</h4>
              </div>
              <p className="text-xs text-on-surface-variant">
                {sessions.length} active login session(s) recorded
              </p>
            </div>
            <button
              onClick={() => setIsSessionsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container text-primary transition-colors"
            >
              Review Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Administrator Password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          {passwordError && (
            <div className="p-3 rounded-lg bg-error-container/40 text-error font-medium">
              {passwordError}
            </div>
          )}

          <div>
            <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters with number and symbol"
              className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
            />
          </div>

          <div className="pt-3 border-t border-surface-container flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container-low text-primary font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-container disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2FA Confirmation Modal */}
      <Modal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        title={is2FAEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-on-surface-variant">
            {is2FAEnabled
              ? "Are you sure you want to disable two-factor authentication for your administrator account?"
              : "Enable two-factor authentication (Demo Mode) to protect administrative access."}
          </p>
          <div className="p-3 bg-surface-container-low rounded-xl text-outline">
            ℹ️ In demo mode, this toggle persists configuration state in the service layer. Real OTP/authenticator enrollment connects with production authentication services.
          </div>
          <div className="pt-3 border-t border-surface-container flex justify-end gap-2">
            <button
              onClick={() => setIs2FAModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-low text-primary font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleToggle2FA}
              disabled={saving2FA}
              className={`px-4 py-1.5 rounded-lg font-semibold text-white ${
                is2FAEnabled ? 'bg-error hover:bg-error/90' : 'bg-secondary hover:bg-secondary-container hover:text-on-secondary-container'
              }`}
            >
              {saving2FA ? 'Updating...' : (is2FAEnabled ? 'Confirm Disable' : 'Confirm Enable')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Active Sessions Modal */}
      <Modal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
        title="Active User Sessions"
        maxWidth="max-w-lg"
      >
        <div className="space-y-3 text-xs">
          <p className="text-on-surface-variant mb-2">
            Centralized active login sessions for your administrator account:
          </p>
          {sessions.map((sess) => (
            <div key={sess.id} className="p-3 bg-surface-container-low rounded-xl border border-surface-variant flex justify-between items-center">
              <div>
                <p className="font-bold text-primary">{sess.device}</p>
                <p className="text-[11px] text-on-surface-variant">{sess.ipAddress} • {sess.lastActive}</p>
              </div>
              {sess.isCurrent ? (
                <span className="text-[10px] font-bold text-on-tertiary-container bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">
                  Current Session
                </span>
              ) : (
                <button
                  onClick={() => handleRevokeSession(sess.id)}
                  className="text-xs text-error font-semibold hover:underline"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
          <div className="pt-3 border-t border-surface-container flex justify-end">
            <button
              onClick={() => setIsSessionsModalOpen(false)}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
