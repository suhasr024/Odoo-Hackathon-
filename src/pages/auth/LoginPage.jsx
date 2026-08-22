import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { PasswordInput } from '../../components/common/PasswordInput';

export const LoginPage = () => {
  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('alex.morgan@vantage.io');
  const [password, setPassword] = useState('DemoPassword123!');
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
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-secondary selection:text-white">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-level-2">
          <span className="material-symbols-outlined text-[32px] text-secondary-container">
            corporate_fare
          </span>
        </div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">Vantage</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">Enterprise Employee Suite</p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-level-2 border border-outline-variant p-6 sm:p-8">
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
  );
};
