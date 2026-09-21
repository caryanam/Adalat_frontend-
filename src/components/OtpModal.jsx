import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';
import { RefreshCw, ArrowRight, X } from 'lucide-react';

const OtpModal = ({ isOpen, onClose, email, role, onSuccess }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [resendCooldown, setResendCooldown] = useState(120);

    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        if (isOpen && email) {
            setOtp(['', '', '', '', '', '']);
            fetchOtpStatus();
        }
    }, [isOpen, email]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const fetchOtpStatus = async () => {
        try {
            const res = await apiClient.get(`/api/auth/email/otp-status?email=${encodeURIComponent(email)}&role=${role}`);
            if (res.success) {
                setTimeLeft(res.data.otpExpiresAfterSeconds);
                setResendCooldown(res.data.resendAvailableAfterSeconds);
            } else {
                setTimeLeft(300);
                setResendCooldown(120);
            }
        } catch (err) {
            console.error("Failed to fetch OTP status", err);
            setTimeLeft(300);
            setResendCooldown(120);
        }
    };

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value !== '' && index < 5) {
                inputRefs[index + 1].current.focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const formatTime = (seconds) => {
        if (seconds <= 0) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleVerify = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6) {
            toast.error("Please enter a 6-digit OTP.");
            return;
        }
        
        setLoading(true);
        try {
            const res = await apiClient.post('/api/auth/email/verify-otp', {
                email,
                role,
                otp: enteredOtp
            });

            if (res.status === 'SUCCESS' || (res.data && res.data.success)) {
                toast.success(res.message || "Email verified successfully!");
                onSuccess();
            } else {
                toast.error(res.message || "Invalid OTP. Please try again.");
                if (res.message?.includes('Maximum OTP attempts') || res.message?.includes('expired')) {
                    setOtp(['', '', '', '', '', '']);
                }
            }
        } catch (err) {
            toast.error(err.message || "Failed to verify OTP.");
            if (err.message?.includes('Maximum OTP attempts') || err.message?.includes('expired')) {
                 setOtp(['', '', '', '', '', '']);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setResendLoading(true);
        try {
            const res = await apiClient.post('/api/auth/email/resend-otp', {
                email,
                role
            });

            if (res.status === 'SUCCESS' || (res.data && res.data.success)) {
                toast.success(res.message || "New OTP sent!");
                setOtp(['', '', '', '', '', '']);
                if (res.data) {
                    setTimeLeft(res.data.otpExpiresAfterSeconds || 300);
                    setResendCooldown(res.data.resendAvailableAfterSeconds || 120);
                }
            } else {
                toast.error(res.message || "Failed to resend OTP.");
                if (res.data?.retryAfterSeconds) {
                    setResendCooldown(res.data.retryAfterSeconds);
                }
            }
        } catch (err) {
            toast.error(err.message || "Failed to resend OTP.");
            if (err.data?.retryAfterSeconds) {
                 setResendCooldown(err.data.retryAfterSeconds);
            }
        } finally {
            setResendLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 19, 31, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', textAlign: 'center', position: 'relative' }}>
                {onClose && (
                    <button 
                        onClick={onClose} 
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                )}
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', color: '#102A43' }}>Verify Your Email</h3>
                <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>We've sent a 6-digit code to <strong style={{ color: '#1e3a8a' }}>{email}</strong></p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            style={{
                                width: '40px',
                                height: '50px',
                                fontSize: '20px',
                                textAlign: 'center',
                                border: '2px solid #cbd5e1',
                                borderRadius: '8px',
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        />
                    ))}
                </div>

                <div style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                    {timeLeft > 0 ? (
                        <p>OTP expires in <strong style={{ color: '#ef4444' }}>{formatTime(timeLeft)}</strong></p>
                    ) : (
                        <p style={{ color: '#ef4444', fontWeight: 'bold' }}>OTP has expired.</p>
                    )}
                </div>

                <button 
                    onClick={handleVerify}
                    disabled={loading || otp.join('').length !== 6 || timeLeft <= 0}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#1e3a8a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: (loading || otp.join('').length !== 6 || timeLeft <= 0) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '1rem'
                    }}
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                    {!loading && <ArrowRight size={18} />}
                </button>

                <div>
                    {resendCooldown > 0 ? (
                        <p style={{ color: '#64748b', fontSize: '14px' }}>
                            Resend OTP in <strong>{formatTime(resendCooldown)}</strong>
                        </p>
                    ) : (
                        <button 
                            onClick={handleResend}
                            disabled={resendLoading}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <RefreshCw size={14} className={resendLoading ? 'spin' : ''} />
                            {resendLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OtpModal;
