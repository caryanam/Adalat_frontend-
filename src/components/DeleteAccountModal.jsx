import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountApi } from '../api/accountApi';
import { toast } from 'react-toastify';
import {
  AlertTriangle,
  Trash2,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileX2
} from 'lucide-react';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, token, role, loginCustomer, loginLawyer, logout } = useAuth();

  // Step 1: 'VERIFY' (credentials input), Step 2: 'CONFIRM' (final permanent warning)
  const [step, setStep] = useState('VERIFY');
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill user email if currently logged in
  useEffect(() => {
    if (isOpen) {
      setStep('VERIFY');
      setError('');
      setPassword('');
      setShowPassword(false);
      if (user?.email) {
        setEmailOrMobile(user.email);
      } else if (user?.mobileNumber) {
        setEmailOrMobile(user.mobileNumber);
      } else {
        setEmailOrMobile('');
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError('');
    setPassword('');
    setStep('VERIFY');
    onClose();
  };

  // Step 1: Verify credentials before allowing final confirmation
  const handleVerifyCredentials = async (e) => {
    e.preventDefault();
    setError('');

    const inputEmail = emailOrMobile.trim();
    const inputPass = password;

    if (!inputEmail) {
      setError('Please enter your registered email address or mobile number.');
      return;
    }
    if (!inputPass) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      // If user is already logged in, verify matching identifier
      if (token && user) {
        const currentEmail = (user.email || '').toLowerCase();
        const currentMobile = (user.mobileNumber || '');
        const target = inputEmail.toLowerCase();

        if (target !== currentEmail && target !== currentMobile) {
          setError('Entered email/mobile does not match the currently logged-in account.');
          setLoading(false);
          return;
        }
      } else {
        // If not currently logged in, authenticate in background to acquire token
        let authenticated = false;
        try {
          await loginCustomer(inputEmail, inputPass);
          authenticated = true;
        } catch (cErr) {
          try {
            await loginLawyer(inputEmail, inputPass);
            authenticated = true;
          } catch (lErr) {
            authenticated = false;
          }
        }

        if (!authenticated) {
          setError('Invalid email or password. Could not verify account credentials.');
          setLoading(false);
          return;
        }
      }

      // Credentials verified! Move to Step 2: Final Confirmation
      setStep('CONFIRM');
    } catch (err) {
      setError(err?.message || 'Verification failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Execute permanent deletion
  const handleExecuteDeletion = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await accountApi.deleteAccount({
        email: emailOrMobile.trim(),
        password: password
      });

      if (response && response.success === false) {
        setError(response.message || 'Failed to delete account. Invalid email or password.');
        setStep('VERIFY');
        setLoading(false);
        return;
      }

      // Deletion succeeded!
      toast.success('Your account and associated data have been permanently deleted.');
      logout();
      handleClose();
      navigate('/');
    } catch (err) {
      const errMsg = err?.message || 'Account deletion failed. Please verify your credentials and try again.';
      setError(errMsg);
      toast.error(errMsg);
      setStep('VERIFY');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn font-['Outfit',sans-serif]">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-700/80 border border-rose-500/50 flex items-center justify-center shadow-inner text-rose-100">
              <Trash2 size={20} className="text-rose-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Delete My Account</h3>
              <p className="text-xs text-rose-200/90 font-medium">Permanent Account Termination</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 text-rose-200 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Permanent Warning Box */}
          <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-950 flex items-start gap-3 text-xs leading-relaxed shadow-2xs">
            <ShieldAlert size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-rose-900 block mb-0.5 text-sm">
                Warning: Permanent Action
              </strong>
              <span>
                Deleting your account is permanent. All your account data and associated information will be permanently deleted.
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2 animate-shake">
              <AlertTriangle size={15} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS VERIFICATION */}
          {step === 'VERIFY' && (
            <form onSubmit={handleVerifyCredentials} className="space-y-4">
              <p className="text-xs text-slate-600">
                To proceed with deletion, please verify your registered account credentials below:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Email Address / Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    value={emailOrMobile}
                    onChange={(e) => { setEmailOrMobile(e.target.value); setError(''); }}
                    placeholder="name@example.com or 9876543210"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-['Outfit',sans-serif] disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your current password"
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-['Outfit',sans-serif] disabled:opacity-60"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons for Step 1 */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !emailOrMobile.trim() || !password}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: FINAL CONFIRMATION */}
          {step === 'CONFIRM' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileX2 size={16} className="text-rose-600" />
                  <span>The following records will be permanently erased:</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc marker:text-rose-500">
                  <li>Profile identity, contact numbers & account credentials</li>
                  <li>All consultation requests, appointments & scheduled timings</li>
                  <li>Complete chat message transcripts & media attachments</li>
                  <li>Legal intake answers, AI facts & summary documents</li>
                  <li>All uploaded verification certificates & files from cloud storage</li>
                  <li>Ratings, reviews, payment records & active session tokens</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-100/70 border border-rose-300 text-rose-900 text-center text-sm font-bold">
                Are you sure you want to permanently delete your account?
              </div>

              {/* Action Buttons for Step 2 */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setStep('VERIFY'); setError(''); }}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteDeletion}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                    <span>{loading ? 'Deleting Account...' : 'Delete My Account'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
