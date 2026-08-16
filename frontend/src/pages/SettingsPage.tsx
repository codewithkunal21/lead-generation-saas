import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Server, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [apiHealth, setApiHealth] = useState<'checking' | 'healthy' | 'unreachable'>('checking');

  const checkHealth = async () => {
    setApiHealth('checking');
    try {
      const res = await apiClient.get('/health', { baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000' });
      if (res.data?.status === 'healthy' || res.status === 200) {
        setApiHealth('healthy');
      } else {
        setApiHealth('unreachable');
      }
    } catch {
      setApiHealth('unreachable');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Account Settings Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Account Profile</h3>
            <p className="text-xs text-slate-500">Authenticated user details and privilege credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Username</p>
            <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
            <p className="text-sm font-semibold text-slate-900">{user?.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
            <p className="text-sm font-semibold text-slate-900">{user?.full_name || 'Not provided'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account Role</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              {user?.is_superuser ? 'Superuser Administrator' : 'Active Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Backend API Connection Status Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">FastAPI Backend Integration</h3>
              <p className="text-xs text-slate-500">API connection status and environment parameters</p>
            </div>
          </div>
          <button
            onClick={checkHealth}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${apiHealth === 'checking' ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-600">Base API URL:</span>
            <span className="font-mono text-xs font-bold text-brand-600">{apiBaseUrl}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-600">Backend Server Health:</span>
            {apiHealth === 'checking' ? (
              <span className="text-xs font-medium text-slate-400">Pinging server...</span>
            ) : apiHealth === 'healthy' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Operational (200 OK)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Connection Failed
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-600">Swagger API Docs:</span>
            <a
              href={`${apiBaseUrl}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              {apiBaseUrl}/docs ↗
            </a>
          </div>
        </div>
      </div>

      {/* Security Info Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Authentication & Security</h3>
            <p className="text-xs text-slate-500">JWT Token Storage Policy</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Authentication is maintained using JSON Web Tokens (JWT) passed in HTTP headers as <code className="bg-slate-100 text-brand-700 px-1.5 py-0.5 rounded font-mono text-[11px]">Authorization: Bearer &lt;token&gt;</code>. Tokens are safely managed in client state and cleared upon logout or authorization failure.
        </p>
      </div>
    </div>
  );
};
