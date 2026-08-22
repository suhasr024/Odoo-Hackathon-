import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const ProfilePage = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    emergencyContact: '',
    address: '',
    bio: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || '',
        address: user.address || '',
        bio: user.bio || ''
      });
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

  const handleCancelProfile = () => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
    setIsEditing(false);
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
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading || !user) {
    return <LoadingSkeleton type="profile" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Employee Profile</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Manage your personal information, contact details, and account security
        </p>
      </div>

      {/* Bento Grid: Avatar Profile Card + Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-surface-variant flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-surface bg-surface-container overflow-hidden shadow-sm">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="text-lg font-bold text-primary">{user.name}</h2>
          <p className="text-xs font-semibold text-secondary mb-1">{user.designation}</p>
          <p className="text-xs text-outline">{user.department}</p>

          <div className="w-full mt-6 pt-6 border-t border-surface-container space-y-3 text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                Employee ID (Read-Only)
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
                Joining Date
              </span>
              <span className="text-xs text-primary font-medium">{user.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Personal Details */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-surface-variant">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-container">
            <h3 className="text-base font-bold text-primary">Personal Details</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container transition-all"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelProfile}
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

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
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
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
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
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Residential Address
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
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Bio / Profile Note
              </label>
              <textarea
                rows={3}
                disabled={!isEditing}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border border-surface-variant bg-white disabled:bg-surface-container-low text-primary resize-none outline-none focus:border-secondary"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Security: Change Password Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-surface-variant">
        <h3 className="text-base font-bold text-primary mb-1">Account Security</h3>
        <p className="text-xs text-on-surface-variant mb-6">
          Update your password regularly to maintain account protection
        </p>

        {passwordError && (
          <div className="mb-4 p-3 rounded-xl bg-error-container/40 border border-error-container text-error text-xs font-medium">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Match new password"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
              />
            </div>
          </div>

          <p className="text-[11px] text-outline">
            Must be at least 8 characters and contain at least one number and one special character.
          </p>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50"
            >
              {savingPassword ? 'Updating Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
