import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('alex.morgan@vantage.io');
  const [password, setPassword] = useState('DemoPassword123!');
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const session = await login(email, password);
      if (session.role === 'Admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    }
  };

  const handleDemoFill = (type) => {
    if (type === 'employee') {
      setEmail('alex.morgan@vantage.io');
      setPassword('DemoPassword123!');
    } else {
      setEmail('sarah.admin@vantage.io');
      setPassword('AdminPassword123!');
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white mb-4 shadow-level-1">
          <span className="material-symbols-outlined text-[30px] text-secondary-container">
            corporate_fare
          </span>
        </div>
        <h2 className="text-2xl font-bold text-primary tracking-tight">
          Vantage Employee Suite
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Sign in to access your workplace dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface-container-lowest py-8 px-6 shadow-level-1 rounded-2xl sm:px-10 border border-surface-variant">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-error-container/40 border border-error-container text-error text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-variant focus:border-secondary focus:ring-1 focus:ring-secondary text-sm bg-white outline-none"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-variant focus:border-secondary focus:ring-1 focus:ring-secondary text-sm bg-white outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-secondary text-white font-semibold text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-surface-container">
            <p className="text-xs text-center text-outline mb-3 font-medium">
              Demo Evaluation Accounts
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoFill('employee')}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-variant transition-colors text-center"
              >
                👤 Employee Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-variant transition-colors text-center"
              >
                🛡️ Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
