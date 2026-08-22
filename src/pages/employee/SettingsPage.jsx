import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { success } = useToast();

  const [notifications, setNotifications] = useState({
    emailOnLeaveApproval: true,
    emailOnAttendanceReminder: true,
    weeklyDigest: false
  });
  const [themeMode, setThemeMode] = useState('light');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success('Employee preferences saved.');
    }, 200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Account & Portal Settings</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Customize your employee notifications, portal preferences, and account security
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Notification Preferences */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-outline-variant space-y-4">
          <h3 className="text-base font-bold text-primary border-b border-surface-container pb-2">
            Notification Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant cursor-pointer">
              <div>
                <p className="font-bold text-primary">Leave Request Status Updates</p>
                <p className="text-outline text-[11px]">Receive emails when an administrator approves or rejects your leave application.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailOnLeaveApproval}
                onChange={(e) => setNotifications({ ...notifications, emailOnLeaveApproval: e.target.checked })}
                className="w-4 h-4 text-secondary rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant cursor-pointer">
              <div>
                <p className="font-bold text-primary">Daily Attendance Check-Out Reminders</p>
                <p className="text-outline text-[11px]">Send evening push/email notification if session is still checked in.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailOnAttendanceReminder}
                onChange={(e) => setNotifications({ ...notifications, emailOnAttendanceReminder: e.target.checked })}
                className="w-4 h-4 text-secondary rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant cursor-pointer">
              <div>
                <p className="font-bold text-primary">Weekly Company Digest</p>
                <p className="text-outline text-[11px]">Receive weekly newsletter regarding team updates and announcements.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyDigest}
                onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                className="w-4 h-4 text-secondary rounded"
              />
            </label>
          </div>
        </div>

        {/* Display & Appearance */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-outline-variant space-y-4">
          <h3 className="text-base font-bold text-primary border-b border-surface-container pb-2">
            Portal Appearance
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setThemeMode('light')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                themeMode === 'light'
                  ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                  : 'border-surface-variant bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-secondary text-[22px] mb-1">light_mode</span>
              <p className="font-bold text-primary">Executive Light Mode</p>
              <p className="text-[11px] text-on-surface-variant">Default clean Slate and Electric Blue aesthetic</p>
            </div>

            <div
              onClick={() => setThemeMode('system')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                themeMode === 'system'
                  ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                  : 'border-surface-variant bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-secondary text-[22px] mb-1">desktop_windows</span>
              <p className="font-bold text-primary">System Match</p>
              <p className="text-[11px] text-on-surface-variant">Synchronize with your operating system theme</p>
            </div>
          </div>
        </div>

        {/* Security Shortcut */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex justify-between items-center">
          <div>
            <h4 className="text-sm font-bold text-primary">Password & Security</h4>
            <p className="text-xs text-on-surface-variant">Manage your credentials and view active login sessions</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container text-primary transition-colors"
          >
            Go to Profile →
          </button>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-secondary text-white font-semibold text-xs hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
