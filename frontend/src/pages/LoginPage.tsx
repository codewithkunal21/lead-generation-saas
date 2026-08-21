import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, User, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Support pre-filled email/username passed from register page or state
  const initialEmail = (location.state as { email?: string })?.email || '';
  
  // mmx
  const [usernameOrEmail, setUsernameOrEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillDemoAdmin = () => {
    setUsernameOrEmail('admin@example.com');
    setPassword('admin_super_secure_password');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        username_or_email: usernameOrEmail.trim(),
        password,
      });
      showToast('Welcome back! Login successful.', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      // AuthContext.login() throws a plain Error with a descriptive message.
      // It handles AxiosError → plain Error conversion internally, so we
      // access .message here, NOT .response.data.detail.
      const msg =
        err instanceof Error
          ? err.message
          : 'Incorrect username/email or password.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/25 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to LeadPulse
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Commercial Lead Generation & Business Scraping Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100">
          {/* Quick Demo Credentials Assistant */}
          <div className="mb-6 p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between text-indigo-900 text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                Testing app? <strong className="font-semibold">Demo Admin:</strong> admin@example.com
              </span>
            </div>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="px-2.5 py-1 bg-white hover:bg-indigo-100/60 text-brand-600 font-semibold border border-indigo-200 rounded-lg shadow-sm transition-all text-xs shrink-0"
            >
              Fill Demo Admin
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p className="text-rose-700 text-xs mt-0.5">{error}</p>
                <p className="text-slate-500 text-xs mt-1.5">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-brand-600 font-semibold underline">
                    Click here to Create an Account
                  </Link>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin@example.com or username"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* <div> */}
        {/*  */}
      {/* </div> */}
    </div>
  ) ;
} ;
