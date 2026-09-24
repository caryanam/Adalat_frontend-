import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';
import { lawyerApi } from '../api/lawyerApi';
import { customerApi } from '../api/customerApi';
import { toast } from 'react-toastify';
import { 
  X, 
  Mail, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowLeft
} from 'lucide-react';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '', onPasswordResetSuccess }) => {
  const [step, setStep] = useState('EMAIL'); // 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS'
  const [email, setEmail] = useState(initialEmail);
  const [detectedRole, setDetectedRole] = useState('LAWYER'); // auto-detected role
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(120);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isOpen) {
      setStep('EMAIL');
      setEmail(initialEmail || '');
      setDetectedRole('LAWYER');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setTimeLeft(300);
      setResendCooldown(120);
    }
  }, [isOpen, initialEmail]);

  // Expiry timer
  useEffect(() => {
    if (step !== 'OTP' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (step !== 'OTP' || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ─── STEP 1: SEND OTP (Auto-detecting account role) ──────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Try sending OTP as LAWYER
      let activeRole = 'LAWYER';
      let res;
      try {
        res = await apiClient.post('/api/auth/email/resend-otp', {
          email: cleanEmail,
          role: 'LAWYER',
        });
      } catch (lawyerErr) {
        // 2. If lawyer fails, try CUSTOMER
        activeRole = 'CUSTOMER';
        res = await apiClient.post('/api/auth/email/resend-otp', {
          email: cleanEmail,
          role: 'CUSTOMER',
        });
      }

      if (res.status === 'SUCCESS' || res.success || res.data) {
        setDetectedRole(activeRole);
        toast.success(res.message || `Verification code sent to ${cleanEmail}`);
        setStep('OTP');
        setTimeLeft(res.data?.otpExpiresAfterSeconds || 300);
        setResendCooldown(res.data?.resendAvailableAfterSeconds || 120);
      } else {
        const msg = res.message || 'Failed to dispatch verification email.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.message || 'Unable to send OTP. Please check your email address.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 2: RESEND OTP ──────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setErrorMsg('');

    try {
      const res = await apiClient.post('/api/auth/email/resend-otp', {
        email: email.trim().toLowerCase(),
        role: detectedRole,
      });

      if (res.status === 'SUCCESS' || res.success || res.data) {
        toast.success(res.message || 'New OTP sent to your email.');
        setOtp(['', '', '', '', '', '']);
        setTimeLeft(res.data?.otpExpiresAfterSeconds || 300);
        setResendCooldown(res.data?.resendAvailableAfterSeconds || 120);
      } else {
        toast.error(res.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  // ─── STEP 2: OTP INPUT HANDLERS ──────────────────────────────────────────────
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (/^[0-9]$/.test(val) || val === '') {
      const nextOtp = [...otp];
      nextOtp[index] = val;
      setOtp(nextOtp);

      if (val !== '' && index < 5) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs[5].current?.focus();
    }
  };

  // ─── STEP 2: VERIFY OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      let res;
      try {
        res = await apiClient.post('/api/auth/email/verify-otp', {
          email: email.trim().toLowerCase(),
          role: detectedRole,
          otp: enteredOtp,
        });
      } catch (err) {
        // Fallback retry with other role if first role attempt failed
        const altRole = detectedRole === 'LAWYER' ? 'CUSTOMER' : 'LAWYER';
        res = await apiClient.post('/api/auth/email/verify-otp', {
          email: email.trim().toLowerCase(),
          role: altRole,
          otp: enteredOtp,
        });
        setDetectedRole(altRole);
      }

      if (res.status === 'SUCCESS' || res.success || res.data?.emailVerified) {
        toast.success(res.message || 'Email verified successfully!');
        setStep('NEW_PASSWORD');
      } else {
        const msg = res.message || 'Invalid or expired OTP code.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.message || 'Failed to verify OTP code.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 3: RESET PASSWORD ──────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      let res;
      try {
        // 1. Primary: Unified Auth Endpoint (auto-detects Customer, Advocate, Admin)
        res = await apiClient.post('/api/auth/forgot-password/reset', {
          email: cleanEmail,
          newPassword,
          confirmPassword,
        });
      } catch (authErr) {
        // 2. Fallback to role-specific endpoints if legacy endpoint is needed
        if (detectedRole === 'CUSTOMER') {
          try {
            res = await customerApi.resetPasswordWithOtp(cleanEmail, newPassword, confirmPassword);
          } catch {
            res = await lawyerApi.resetPasswordWithOtp(cleanEmail, newPassword, confirmPassword);
          }
        } else {
          try {
            res = await lawyerApi.resetPasswordWithOtp(cleanEmail, newPassword, confirmPassword);
          } catch {
            res = await customerApi.resetPasswordWithOtp(cleanEmail, newPassword, confirmPassword);
          }
        }
      }

      if (res?.status === 'SUCCESS' || res?.success || res?.message) {
        toast.success(res?.message || 'Password updated successfully!');
        setStep('SUCCESS');
      } else {
        const msg = res?.message || 'Failed to reset password.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.message || 'Failed to reset password. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (onPasswordResetSuccess) {
      onPasswordResetSuccess(email.trim().toLowerCase());
    }
    onClose();
  };

  return (
    <div className="fp-modal-overlay" onClick={onClose}>
      <div className="fp-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="fp-modal-header">
          <button className="fp-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>

          <div className="fp-badge-icon">
            {step === 'EMAIL' && <KeyRound size={22} />}
            {step === 'OTP' && <ShieldCheck size={22} />}
            {step === 'NEW_PASSWORD' && <Lock size={22} />}
            {step === 'SUCCESS' && <CheckCircle2 size={22} />}
          </div>

          <h3 className="fp-modal-title">
            {step === 'EMAIL' && 'Reset Password'}
            {step === 'OTP' && 'Verify Email OTP'}
            {step === 'NEW_PASSWORD' && 'Create New Password'}
            {step === 'SUCCESS' && 'Password Changed!'}
          </h3>

          <p className="fp-modal-subtitle">
            {step === 'EMAIL' && 'Enter your registered email address to receive a secure 6-digit verification code.'}
            {step === 'OTP' && `We've sent a 6-digit verification code to ${email}`}
            {step === 'NEW_PASSWORD' && 'Set a strong new password for your Adalat account.'}
            {step === 'SUCCESS' && 'Your password has been successfully updated.'}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        {step !== 'SUCCESS' && (
          <div className="fp-stepper">
            <div className={`fp-step-item ${step === 'EMAIL' ? 'active' : 'completed'}`}>
              <div className="fp-step-num">1</div>
              <span>Email</span>
            </div>
            <div className={`fp-step-line ${step !== 'EMAIL' ? 'completed' : ''}`} />
            <div className={`fp-step-item ${step === 'OTP' ? 'active' : step === 'NEW_PASSWORD' ? 'completed' : ''}`}>
              <div className="fp-step-num">2</div>
              <span>Verify</span>
            </div>
            <div className={`fp-step-line ${step === 'NEW_PASSWORD' ? 'completed' : ''}`} />
            <div className={`fp-step-item ${step === 'NEW_PASSWORD' ? 'active' : ''}`}>
              <div className="fp-step-num">3</div>
              <span>Reset</span>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="fp-modal-body">
          {errorMsg && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ────────── STEP 1: EMAIL ────────── */}
          {step === 'EMAIL' && (
            <form onSubmit={handleSendOtp}>
              <div className="fp-form-group">
                <label className="fp-form-label">Registered Email Address</label>
                <div className="fp-input-wrapper">
                  <Mail size={18} className="fp-input-icon" />
                  <input
                    type="email"
                    className="fp-input"
                    placeholder="e.g. user@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="fp-submit-btn"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="fp-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ────────── STEP 2: ENTER OTP ────────── */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp}>
              <div className="fp-otp-boxes" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="fp-otp-digit"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <div className="fp-timer-row">
                <div>
                  {timeLeft > 0 ? (
                    <span>Expires in <strong className="fp-timer-expiry">{formatTime(timeLeft)}</strong></span>
                  ) : (
                    <span className="fp-timer-expiry">OTP Expired</span>
                  )}
                </div>

                <div>
                  {resendCooldown > 0 ? (
                    <span>Resend in {formatTime(resendCooldown)}</span>
                  ) : (
                    <button
                      type="button"
                      className="fp-resend-btn"
                      onClick={handleResendOtp}
                      disabled={resendLoading}
                    >
                      <RefreshCw size={13} className={resendLoading ? 'fp-spin' : ''} />
                      <span>{resendLoading ? 'Sending...' : 'Resend Code'}</span>
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="fp-submit-btn"
                disabled={loading || otp.join('').length !== 6 || timeLeft <= 0}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="fp-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code & Continue</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <button
                type="button"
                className="fp-secondary-btn"
                onClick={() => setStep('EMAIL')}
              >
                <ArrowLeft size={16} />
                <span>Change Email Address</span>
              </button>
            </form>
          )}

          {/* ────────── STEP 3: NEW PASSWORD ────────── */}
          {step === 'NEW_PASSWORD' && (
            <form onSubmit={handleResetPassword}>
              <div className="fp-form-group">
                <label className="fp-form-label">New Password (min. 6 characters)</label>
                <div className="fp-input-wrapper">
                  <Lock size={18} className="fp-input-icon" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="fp-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.5rem' }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="fp-eye-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    title={showNewPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="fp-form-group">
                <label className="fp-form-label">Confirm New Password</label>
                <div className="fp-input-wrapper">
                  <Lock size={18} className="fp-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="fp-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    className="fp-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="fp-submit-btn"
                disabled={loading || !newPassword || !confirmPassword || newPassword.length < 6}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="fp-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ────────── STEP 4: SUCCESS ────────── */}
          {step === 'SUCCESS' && (
            <div className="fp-success-container">
              <div className="fp-success-icon-badge">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="fp-success-title">Password Reset Complete!</h4>
              <p className="fp-success-desc">
                Your password has been changed successfully. A security confirmation notification has also been dispatched to your email address.
              </p>
              <button
                type="button"
                className="fp-submit-btn"
                onClick={handleFinish}
              >
                <span>Back to Sign In</span>
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
