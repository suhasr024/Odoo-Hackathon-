import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminSettingsPage = () => {
  const { settings, loading, saveAll } = useSettings();
  const [activeTab, setActiveTab] = useState('organization');

  const [formState, setFormState] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormState(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formState) return;
    try {
      setIsSaving(true);
      await saveAll(formState);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !formState) {
    return <LoadingSkeleton count={3} />;
  }

  const tabs = [
    { id: 'organization', name: 'Organization', icon: 'domain' },
    { id: 'attendance', name: 'Attendance Rules', icon: 'schedule' },
    { id: 'leaves', name: 'Leave Defaults', icon: 'beach_access' },
    { id: 'notifications', name: 'Notifications', icon: 'notifications' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">System Settings</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Configure organization profiles, policy defaults, and operational rules
        </p>
      </div>

      {/* Settings Grid (Tab List + Content Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Navigation Tabs */}
        <div className="lg:col-span-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-secondary text-white font-bold shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-primary border border-outline-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Right Column: Settings Form */}
        <div className="lg:col-span-9 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-outline-variant">
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            {/* Tab 1: Organization */}
            {activeTab === 'organization' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-primary border-b border-surface-container pb-2">
                  Organization Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formState.organization.companyName}
                      onChange={(e) => setFormState({
                        ...formState,
                        organization: { ...formState.organization, companyName: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Portal Title
                    </label>
                    <input
                      type="text"
                      value={formState.organization.portalTitle}
                      onChange={(e) => setFormState({
                        ...formState,
                        organization: { ...formState.organization, portalTitle: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={formState.organization.supportEmail}
                      onChange={(e) => setFormState({
                        ...formState,
                        organization: { ...formState.organization, supportEmail: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={formState.organization.timezone}
                      onChange={(e) => setFormState({
                        ...formState,
                        organization: { ...formState.organization, timezone: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Attendance Rules */}
            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-primary border-b border-surface-container pb-2">
                  Attendance Rules & Thresholds
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Expected Check-In Time
                    </label>
                    <input
                      type="time"
                      value={formState.attendance.expectedCheckInTime}
                      onChange={(e) => setFormState({
                        ...formState,
                        attendance: { ...formState.attendance, expectedCheckInTime: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Late Grace Period (Minutes)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={formState.attendance.lateGracePeriodMinutes}
                      onChange={(e) => setFormState({
                        ...formState,
                        attendance: { ...formState.attendance, lateGracePeriodMinutes: Number(e.target.value) }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Standard Daily Work Hours
                    </label>
                    <input
                      type="number"
                      min={4}
                      max={12}
                      value={formState.attendance.standardDailyWorkHours}
                      onChange={(e) => setFormState({
                        ...formState,
                        attendance: { ...formState.attendance, standardDailyWorkHours: Number(e.target.value) }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Half-Day Threshold Hours
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={6}
                      value={formState.attendance.halfDayWorkHours}
                      onChange={(e) => setFormState({
                        ...formState,
                        attendance: { ...formState.attendance, halfDayWorkHours: Number(e.target.value) }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Leave Policy Defaults */}
            {activeTab === 'leaves' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-primary border-b border-surface-container pb-2">
                  Organization Default Leave Allowances
                </h3>
                <p className="text-outline text-[11px]">
                  Note: Updating organization default allowances applies to company defaults and new employee onboarding. Existing individual balances and history remain preserved.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Default Annual Leave (Days)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.leavePolicyDefaults.defaultAnnualAllowance}
                      onChange={(e) => setFormState({
                        ...formState,
                        leavePolicyDefaults: { ...formState.leavePolicyDefaults, defaultAnnualAllowance: Number(e.target.value) }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Default Sick Leave (Days)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.leavePolicyDefaults.defaultSickAllowance}
                      onChange={(e) => setFormState({
                        ...formState,
                        leavePolicyDefaults: { ...formState.leavePolicyDefaults, defaultSickAllowance: Number(e.target.value) }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Default Unpaid Leave (Days)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.leavePolicyDefaults.defaultUnpaidAllowance}
                      onChange={(e) => setFormState({
                        ...formState,
                        leavePolicyDefaults: { ...formState.leavePolicyDefaults, defaultUnpaidAllowance: Number(e.target.value) }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-primary border-b border-surface-container pb-2">
                  Notification & Alert Preferences
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant cursor-pointer">
                    <div>
                      <p className="font-bold text-primary">Email on Leave Application</p>
                      <p className="text-outline text-[11px]">Notify admin immediately when an employee submits a leave request.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.notifications.emailOnLeaveRequest}
                      onChange={(e) => setFormState({
                        ...formState,
                        notifications: { ...formState.notifications, emailOnLeaveRequest: e.target.checked }
                      })}
                      className="w-4 h-4 text-secondary rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant cursor-pointer">
                    <div>
                      <p className="font-bold text-primary">Daily Attendance Digest</p>
                      <p className="text-outline text-[11px]">Send daily summary email of late arrivals, absences, and active headcount.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.notifications.dailyAttendanceDigest}
                      onChange={(e) => setFormState({
                        ...formState,
                        notifications: { ...formState.notifications, dailyAttendanceDigest: e.target.checked }
                      })}
                      className="w-4 h-4 text-secondary rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant cursor-pointer">
                    <div>
                      <p className="font-bold text-primary">System Alerts</p>
                      <p className="text-outline text-[11px]">Show in-app toast alerts for administrative actions and policy updates.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.notifications.systemAlerts}
                      onChange={(e) => setFormState({
                        ...formState,
                        notifications: { ...formState.notifications, systemAlerts: e.target.checked }
                      })}
                      className="w-4 h-4 text-secondary rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t border-surface-container flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-secondary text-white font-semibold text-xs hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 shadow-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
