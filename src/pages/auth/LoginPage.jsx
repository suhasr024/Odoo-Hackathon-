import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { PasswordInput } from '../../components/common/PasswordInput';

export const LoginPage = () => {
  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const session = await login(email, password);
      success(`Welcome back, ${session.user.name}!`);
      if (session.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (role) => {
    if (role === 'employee') {
      setEmail('alex.morgan@vantage.io');
      setPassword('DemoPassword123!');
    } else {
      setEmail('sarah.admin@vantage.io');
      setPassword('AdminPassword123!');
    }
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex bg-surface-container-lowest selection:bg-secondary selection:text-white">
      {/* Left Hero Panel (Desktop Only, hidden below lg) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-primary overflow-hidden">
        {/* Background Corporate Image with Dark Gradient Overlay */}
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
          alt="Vantage Corporate Office"
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
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Unified Workforce Portal
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Every workday, perfectly aligned.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Seamless attendance tracking, intelligent leave management, and instant payroll disbursements in a single unified workspace.
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

          {/* Main Login Card */}
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-level-2 border border-outline-variant p-6 sm:p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-primary">Sign in to your account</h2>
              <p className="text-xs text-on-surface-variant mt-1">Enter your corporate credentials below</p>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-error-container/40 border border-error-container text-error text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@vantage.io"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Password
                </label>
                <PasswordInput
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-variant bg-white text-primary outline-none focus:border-secondary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-[0.99] shadow-sm disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-6 pt-4 border-t border-surface-container">
              <p className="text-[10px] uppercase font-bold text-outline text-center mb-2.5">
                Quick Fill Demo Accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillCredentials('employee')}
                  className="px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold border border-surface-variant transition-colors"
                >
                  👤 Employee Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('admin')}
                  className="px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold border border-surface-variant transition-colors"
                >
                  🛡️ Admin Demo
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 pt-4 border-t border-surface-container text-center text-xs text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/signup" className="text-secondary font-bold hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
