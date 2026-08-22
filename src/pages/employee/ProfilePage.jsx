import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePayroll } from '../../hooks/usePayroll';
import { useToast } from '../../hooks/useToast';
import { documentService } from '../../services/documentService';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { PasswordInput } from '../../components/common/PasswordInput';

export const ProfilePage = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const { salary } = usePayroll();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const avatarInputRef = useRef(null);

  // Active Tab: PROFILE / DOCUMENTS / SALARY
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'documents', 'salary'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Avatar Upload State
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);

  const fetchDocs = async () => {
    if (!user) return;
    try {
      const docs = await documentService.getDocuments(user.id);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || '',
        address: user.address || '',
        bio: user.bio || ''
      });
      setAvatarPreview(user.avatar || null);
      fetchDocs();
    }
  }, [user]);

  // Avatar Upload Handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type (PNG/JPG)
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toastError('Invalid photo format. Please select a PNG or JPG image.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toastError('Profile photo exceeds the 5 MB size limit.');
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setAvatarPreview(dataUrl); // Immediate optimistic preview
      try {
        await updateProfile({ avatar: dataUrl });
        success('Profile photo updated successfully.');
      } catch (err) {
        toastError(err.message || 'Failed to update profile photo.');
        setAvatarPreview(user.avatar); // Revert on failure
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.onerror = () => {
      toastError('Failed to read image file.');
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

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

  // Document Upload Handlers (Click + Drag/Drop)
  const handleFileUpload = async (file) => {
    if (!file || !user) return;
    try {
      setUploadingDoc(true);
      const uploaded = await documentService.uploadDocument(user.id, file);
      setDocuments(prev => [uploaded, ...prev]);
      success(`Document "${file.name}" uploaded successfully.`);
    } catch (err) {
      toastError(err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDeleteDocConfirm = async () => {
    if (!deleteConfirmDoc || !user) return;
    try {
      await documentService.deleteDocument(user.id, deleteConfirmDoc.id);
      setDocuments(prev => prev.filter(d => d.id !== deleteConfirmDoc.id));
      success('Document removed.');
      setDeleteConfirmDoc(null);
    } catch (err) {
      toastError('Failed to delete document.');
    }
  };

  if (loading || !user) {
    return <LoadingSkeleton type="profile" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Employee Profile & Records</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          View official employment information, documents, credentials, and compensation
        </p>
      </div>

      {/* Profile Top Navigation Tabs */}
      <div className="flex border-b border-surface-container gap-2">
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-secondary text-secondary bg-secondary/5'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_circle</span>
          <span>PROFILE</span>
        </button>

        <button
          onClick={() => handleTabChange('documents')}
          className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'documents'
              ? 'border-secondary text-secondary bg-secondary/5'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">folder</span>
          <span>DOCUMENTS</span>
        </button>

        <button
          onClick={() => handleTabChange('salary')}
          className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'salary'
              ? 'border-secondary text-secondary bg-secondary/5'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>SALARY</span>
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile Summary Card with Avatar Upload (Col Span 4) */}
          <div className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-outline-variant flex flex-col items-center text-center">
            {/* Avatar with Camera Icon Overlay */}
            <div className="relative group mb-4">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-surface bg-surface-container overflow-hidden shadow-sm">
                <img
                  src={avatarPreview || user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleAvatarChange}
              />

              {/* Edit/Camera icon button */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-secondary text-white shadow-md hover:bg-secondary-container hover:text-on-secondary-container flex items-center justify-center transition-all cursor-pointer border-2 border-surface active:scale-95"
                title="Change profile picture"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isUploadingAvatar ? 'hourglass_top' : 'photo_camera'}
                </span>
              </button>
            </div>

            <h2 className="text-lg font-bold text-primary">{user.name}</h2>
            <p className="text-xs font-semibold text-secondary mb-0.5">{user.designation}</p>
            <p className="text-xs text-on-surface-variant">{user.department}</p>

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
                  Work Email
                </span>
                <span className="text-xs text-primary font-medium truncate block">{user.email}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                  Joining Date
                </span>
                <span className="text-xs text-primary font-medium">{user.joinDate || 'March 15, 2022'}</span>
              </div>
            </div>
          </div>

          {/* Personal Details & Security (Col Span 8) */}
          <div className="md:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-outline-variant">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-container">
                <h3 className="text-base font-bold text-primary">Personal Information</h3>
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
                  <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Personal Bio
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

            {/* Password Security Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-secondary">lock</span>
                  <h4 className="text-sm font-bold text-primary">Account Security & Password</h4>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Update your authentication credentials regularly.
                </p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container text-primary transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Upload Zone (Drag & Drop + Click) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('employee-doc-upload').click()}
            className="border-2 border-dashed border-secondary/40 hover:border-secondary bg-surface-container-low/50 hover:bg-surface-container-low p-8 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
          >
            <input
              id="employee-doc-upload"
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
              }}
            />
            <div className="w-12 h-12 rounded-full bg-secondary-fixed text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
            </div>
            <p className="text-sm font-bold text-primary">
              {uploadingDoc ? 'Uploading document...' : 'Click or drag files here to upload'}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Supports PNG, JPG, PDF — maximum file size 10MB
            </p>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant p-6">
            <h3 className="text-base font-bold text-primary mb-4">Official Employee Documents</h3>
            
            {documents.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">No documents uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-semibold uppercase tracking-wider">
                      <th className="p-3">Document Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Uploaded Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-surface-container-low/50">
                        <td className="p-3 font-bold text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px]">description</span>
                          <span>{doc.name}</span>
                        </td>
                        <td className="p-3 text-on-surface-variant">{doc.type}</td>
                        <td className="p-3 text-outline">{doc.size || '500 KB'}</td>
                        <td className="p-3 text-on-surface-variant">{doc.uploadedDate}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => window.open('#', '_blank')}
                              className="p-1 rounded text-on-surface-variant hover:text-secondary"
                              title="View Document"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmDoc(doc)}
                              className="p-1 rounded text-error hover:bg-error-container/40"
                              title="Delete Document"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SALARY (Read-Only Summary) */}
      {activeTab === 'salary' && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-level-1 border border-outline-variant space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Current Monthly Disbursed Compensation
              </span>
              <div className="text-4xl font-black text-primary mt-1">
                ₹{salary ? salary.netSalary.toLocaleString() : '54,300'}
              </div>
              <p className="text-xs text-secondary font-medium mt-1">
                Pay Period: {salary?.payPeriod || 'August 2026'}
              </p>
            </div>
            <button
              onClick={() => navigate('/payroll')}
              className="px-5 py-2.5 rounded-xl bg-secondary text-white font-semibold text-xs md:text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-colors"
            >
              View Full Payroll Details →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-surface-container text-xs">
            <div className="p-3 bg-surface-container-low rounded-xl">
              <span className="text-outline uppercase font-semibold block">Basic Pay</span>
              <span className="text-sm font-bold text-primary mt-0.5 block">₹{salary?.basicPay.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <span className="text-outline uppercase font-semibold block">HRA</span>
              <span className="text-sm font-bold text-primary mt-0.5 block">₹{salary?.hra.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <span className="text-outline uppercase font-semibold block">Allowances</span>
              <span className="text-sm font-bold text-primary mt-0.5 block">₹{salary?.otherAllowances.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <span className="text-outline uppercase font-semibold block">Deductions</span>
              <span className="text-sm font-bold text-error mt-0.5 block">-₹{((salary?.taxDeduction || 0) + (salary?.otherDeductions || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Profile Password"
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
            <PasswordInput
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
            <PasswordInput
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
            <PasswordInput
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

      {/* Delete Document Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmDoc)}
        onClose={() => setDeleteConfirmDoc(null)}
        title="Confirm Document Deletion"
        maxWidth="max-w-sm"
      >
        {deleteConfirmDoc && (
          <div className="space-y-4 text-xs">
            <p className="text-on-surface-variant">
              Are you sure you want to delete <strong>{deleteConfirmDoc.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDocConfirm}
                className="px-4 py-1.5 rounded-lg bg-error text-white font-semibold hover:bg-error/90"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
