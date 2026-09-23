import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Scale, Lock, LogIn, Home, AlertCircle } from 'lucide-react';

const SessionExpiredModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionDetails, setSessionDetails] = useState({
    role: 'CUSTOMER',
    path: '',
    message: ''
  });

  const { logout, role: currentAuthRole } = useAuth();
  const navigate = useNavigate();

  const handleSessionExpired = useCallback((e) => {
    // If already open, do not re-trigger or flicker
    if (isOpen) return;

    const detail = e.detail || {};
    const fallbackRole = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('adalat_role')) || currentAuthRole || 'CUSTOMER';
    const role = (detail.role || fallbackRole).toUpperCase();

    setSessionDetails({
      role,
      path: detail.path || (typeof window !== 'undefined' ? window.location.pathname : ''),
      message: detail.message || 'Your session has expired.'
    });
    setIsOpen(true);
  }, [isOpen, currentAuthRole]);

  useEffect(() => {
    window.addEventListener('adalat_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('adalat_session_expired', handleSessionExpired);
    };
  }, [handleSessionExpired]);

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const handleHomeRedirect = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  // 1. ADMIN THEME & CONTENT
  if (sessionDetails.role === 'ADMIN') {
    return (
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-['Outfit',sans-serif] animate-in fade-in duration-200">
        <div className="bg-slate-950 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-indigo-500/30 text-white relative overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center space-y-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/50">
              <ShieldAlert size={32} />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                🛡️ System Administrator Console
              </span>
              <h3 className="text-xl font-bold text-white pt-1">
                Admin Session Expired
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                Your administrative security session has timed out or the authentication token is no longer valid. To protect platform integrity, please sign in again.
              </p>
            </div>

            {/* Security Notice Pill */}
            <div className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>Administrative Privilege Revoked • Re-auth Required</span>
            </div>

            {/* Actions */}
            <div className="w-full space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-98"
              >
                <LogIn size={16} />
                <span>Log In to Admin Console</span>
              </button>

              <button
                type="button"
                onClick={handleHomeRedirect}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-all cursor-pointer"
              >
                <Home size={14} />
                <span>Exit to Homepage</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // 2. LAWYER / ADVOCATE THEME & CONTENT
  if (sessionDetails.role === 'LAWYER') {
    return (
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-['Outfit',sans-serif] animate-in fade-in duration-200">
        <div className="bg-[#0f172a] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-500/30 text-white relative overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center space-y-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/50">
              <Scale size={32} />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ⚖️ Advocate Workspace Portal
              </span>
              <h3 className="text-xl font-bold text-white pt-1">
                Advocate Session Expired
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                Your advocate consultation session has expired. Please sign in again to access your case appointments, client inquiries, consultation chats, and fee earnings.
              </p>
            </div>

            {/* Legal Privilege Pill */}
            <div className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Advocate-Client Privilege Protected • Re-login Required</span>
            </div>

            {/* Actions */}
            <div className="w-full space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer active:scale-98"
              >
                <LogIn size={16} />
                <span>Log In as Advocate</span>
              </button>

              <button
                type="button"
                onClick={handleHomeRedirect}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-all cursor-pointer"
              >
                <Home size={14} />
                <span>Exit to Homepage</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // 3. CUSTOMER THEME & CONTENT (Default)
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-['Outfit',sans-serif] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Accent Gradient */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 absolute inset-x-0 top-0" />

        {/* Icon Header */}
        <div className="flex flex-col items-center text-center space-y-4 pt-1">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100">
            <Lock size={30} />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
              👤 Customer Portal
            </span>
            <h3 className="text-xl font-bold text-slate-900 pt-1">
              Your Session Has Expired
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              For your security and privacy, your consultation session has timed out. Please sign in again to continue accessing your AI legal assistant, appointments, and consultation chats.
            </p>
          </div>

          {/* Security Notice Pill */}
          <div className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>256-Bit Encrypted Session Closed</span>
          </div>

          {/* Actions */}
          <div className="w-full space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer active:scale-98"
            >
              <LogIn size={16} />
              <span>Log In Again</span>
            </button>

            <button
              type="button"
              onClick={handleHomeRedirect}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Home size={14} />
              <span>Go to Homepage</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
