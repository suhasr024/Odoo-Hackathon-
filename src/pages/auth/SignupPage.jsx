import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { PasswordInput } from '../../components/common/PasswordInput';
import { DEPARTMENTS, DESIGNATIONS } from '../../config/organizationOptions';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    department: '',
    designation: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Employee'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(null); // 'emailVerificationPending' | 'adminApprovalPending'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!formData.department) {
      setError('Please select a department.');
      return;
    }

    if (!formData.designation.trim()) {
      setError('Please select or enter your designation.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await authService.signup(formData);
      setSuccessState(result.type);
    } catch (err) {
      setError(err.message || 'Failed to submit account registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendVerification(formData.email);
      success('Verification email resent successfully.');
    } catch (err) {
      toastError('Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-surface-container-lowest selection:bg-secondary selection:text-white">
      {/* Left Hero Panel (Desktop Only, hidden below lg) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-primary overflow-hidden">
        {/* Background Corporate Image with Dark Gradient Overlay */}
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
          alt="Vantage Team Collaboration"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/50 pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white shadow-level-2 border border-outline-variant/30">
            <span className="material-symbols-outlined text-[26px] text-secondary-container">
              corporate_fare
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">Vantage</h1>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">Enterprise Employee Suite</p>
          </div>
        </div>

        {/* Center Tagline & Value Prop */}
        <div className="relative z-10 max-w-md space-y-3 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-secondary-container text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            Join Vantage Network
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Every workday, perfectly aligned.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Create your account to unlock streamlined daily check-ins, automated leave approvals, payslip access, and seamless organizational collaboration.
          </p>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 text-xs text-slate-400">
          © 2026 Vantage Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 bg-background lg:bg-surface-container-lowest overflow-y-auto">
        <div className="w-full max-w-md my-auto py-6">
          {/* Mobile-only Brand Header */}
          <div className="mb-8 text-center lg:hidden">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-level-2">
              <span className="material-symbols-outlined text-[32px] text-secondary-container">
                corporate_fare
              </span>
            </div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">Vantage</h1>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">Enterprise Employee Suite</p>
          </div>

          {/* Main Card Container */}
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-level-2 border border-outline-variant p-6 sm:p-8">
            {!successState ? (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold text-primary">Create Your Account</h2>
                  <p className="text-xs text-on-surface-variant mt-1">Register for HRMS portal access</p>
                </div>

                {error && (
                  <div className="p-3 mb-4 rounded-xl bg-error-container/40 border border-error-container text-error text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Full Name */}
                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="e.g. EMP-2026-1044 (Optional)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>

                  {/* Department & Designation (2-column layout) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Department <span className="text-error">*</span>
                      </label>
                      <select
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                      >
                        <option value="" disabled>Select department</option>
                        {DEPARTMENTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Designation <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        list="signup-designation-options"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="Select or type role"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                      />
                      <datalist id="signup-designation-options">
                        {DESIGNATIONS.map(d => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Work Email <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@vantage.io"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Account Role <span className="text-error">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                    >
                      <option value="Employee">Employee (Standard Portal)</option>
                      <option value="Admin">HR / Administrator (Requires Approval)</option>
                    </select>
                  </div>

                  {/* Passwords with PasswordInput Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Password <span className="text-error">*</span>
                      </label>
                      <PasswordInput
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Min 8 chars"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Confirm Password <span className="text-error">*</span>
                      </label>
                      <PasswordInput
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Repeat password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-[0.99] shadow-sm disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? 'Registering Account...' : 'Create Account'}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-surface-container text-center text-xs text-on-surface-variant">
                  Already have an account?{' '}
                  <Link to="/login" className="text-secondary font-bold hover:underline">
                    Log in
                  </Link>
                </div>
              </>
            ) : successState === 'emailVerificationPending' ? (
              /* Employee Success State */
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-tertiary-fixed text-primary flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
                </div>
                <h2 className="text-xl font-bold text-primary">Account Created!</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Welcome, <strong>{formData.name}</strong> ({formData.designation}, {formData.department})! Your account has been initialized. Please check your email (<strong>{formData.email}</strong>) to verify your address, or sign in directly to your Vantage Employee Suite.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleResend}
                    className="text-xs font-semibold text-secondary hover:underline"
                  >
                    Resend Verification Email
                  </button>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-container transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              /* Admin Approval Pending State */
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">shield_person</span>
                </div>
                <h2 className="text-xl font-bold text-primary">Request Submitted</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your administrative account request for <strong>{formData.name}</strong> ({formData.designation}, {formData.department}) has been submitted for approval. You will receive access once an administrator approves your request in the Admin Control Center.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-container transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
