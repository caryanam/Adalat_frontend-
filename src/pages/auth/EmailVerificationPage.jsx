import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';
import { ShieldCheck, ArrowRight, RefreshCw, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const EmailVerificationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    
    // OTP Expiry: 5 mins = 300 secs
    const [timeLeft, setTimeLeft] = useState(300);
    // Resend Cooldown: 2 mins = 120 secs
    const [resendCooldown, setResendCooldown] = useState(120);

    const { loginCustomer, loginLawyer } = useAuth();

    const email = location.state?.email;
    const role = location.state?.role;
    const nextRoute = location.state?.nextRoute || '/login';
    const isLawyer = role === 'LAWYER';
    const nextState = location.state?.nextState || {};

    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        if (!email || !role) {
            toast.error("Invalid verification session.");
            navigate('/login');
            return;
        }
        fetchOtpStatus();
    }, [email, role, navigate]);

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
            }
        } catch (err) {
            console.error("Failed to fetch OTP status", err);
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

            if (res.success || res.status === 'SUCCESS') {
                toast.success(res.message || "Email verified successfully!");
                if (location.state?.password) {
                    try {
                        if (isLawyer) {
                            await loginLawyer(email, location.state.password);
                            // If nextRoute is /lawyer/onboarding, we append the lawyerId manually
                            if (nextRoute === '/lawyer/onboarding' && nextState?.lawyerId) {
                                navigate(`/lawyer/onboarding?lawyerId=${nextState.lawyerId}`);
                                return;
                            }
                        } else {
                            await loginCustomer(email, location.state.password);
                        }
                    } catch (err) {
                        console.error("Login after verification failed", err);
                    }
                }
                navigate(nextRoute, { state: nextState });
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

            if (res.success || res.status === 'SUCCESS') {
                toast.success(res.message || "New OTP sent!");
                setOtp(['', '', '', '', '', '']);
                setTimeLeft(res.data.otpExpiresAfterSeconds);
                setResendCooldown(res.data.resendAvailableAfterSeconds);
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

    return (
        <div className="register-page">
            <div className="register-container">
                
                {/* Visual Identity Section */}
                <div className="register-brand-section" style={{ backgroundColor: isLawyer ? '#2c3e50' : '#1e3a8a' }}>
                    <div className="brand-logo">
                        <ShieldCheck size={48} className="logo-icon" />
                        <h2>ADALAT</h2>
                    </div>
                    <div className="brand-tagline">
                        <h1>Verify Your Email</h1>
                        <p>We need to verify your email address before you can continue.</p>
                    </div>
                    
                    <div className="brand-features" style={{ marginTop: 'auto' }}>
                        <div className="feature-item">
                            <div className="feature-icon"><Mail size={24}/></div>
                            <div>
                                <h4>Check your inbox</h4>
                                <p>We've sent a secure 6-digit code to your email.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="register-form-section" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="form-header text-center">
                        <h2>Enter Verification Code</h2>
                        <p>We've sent a 6-digit verification code to:</p>
                        <p className="font-semibold text-blue-700 mt-2 mb-6" style={{ fontSize: '1.1rem'}}>{email}</p>
                    </div>

                    <div className="otp-container" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
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
                                    width: '50px',
                                    height: '60px',
                                    fontSize: '24px',
                                    textAlign: 'center',
                                    border: '2px solid #cbd5e1',
                                    borderRadius: '8px',
                                    backgroundColor: '#f8fafc',
                                    color: '#0f172a',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.backgroundColor = '#ffffff';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#cbd5e1';
                                    e.target.style.backgroundColor = '#f8fafc';
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '30px', color: '#64748b' }}>
                        {timeLeft > 0 ? (
                             <p>OTP expires in <strong style={{ color: '#ef4444' }}>{formatTime(timeLeft)}</strong></p>
                        ) : (
                             <p style={{ color: '#ef4444', fontWeight: 'bold' }}>OTP has expired.</p>
                        )}
                    </div>

                    <button 
                        className="btn-primary w-full"
                        onClick={handleVerify}
                        disabled={loading || otp.join('').length !== 6 || timeLeft <= 0}
                        style={{ height: '54px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', backgroundColor: isLawyer ? '#2c3e50' : '#1e3a8a' }}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                        {!loading && <ArrowRight size={20} />}
                    </button>

                    <div className="mt-8 text-center">
                        {resendCooldown > 0 ? (
                            <p style={{ color: '#64748b' }}>
                                Resend OTP in <strong>{formatTime(resendCooldown)}</strong>
                            </p>
                        ) : (
                            <button 
                                onClick={handleResend}
                                disabled={resendLoading}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#3b82f6', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <RefreshCw size={16} className={resendLoading ? 'spin' : ''} />
                                {resendLoading ? 'Sending...' : 'Resend OTP'}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
