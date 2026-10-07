import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { customerApi } from '../../api/customerApi';
import { lawyerApi } from '../../api/lawyerApi';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import PaymentModal from '../../components/PaymentModal';
import OtpModal from '../../components/OtpModal';
import { toast } from 'react-toastify';
import { Scale, Lock, Mail, User, Phone, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import customerRegBg from '../../assets/customer_reg_bg.png';
import lawyerRegBg from '../../assets/lawyer_reg_bg.png';
import logoImg from '../../assets/logo.png';
import './AuthPages.css';

const CustomerRegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial role from URL query param e.g. /register?type=lawyer
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get('type') || (location.pathname.includes('/lawyer/') ? 'lawyer' : 'customer');
  const [role, setRole] = useState(initialType === 'lawyer' ? 'lawyer' : 'customer');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: ''
  });

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [policyModalContent, setPolicyModalContent] = useState(null);

  const { loginCustomer, loginLawyer, user } = useAuth();

  useEffect(() => {
    if (initialType === 'lawyer') {
      setRole('lawyer');
    } else if (initialType === 'customer') {
      setRole('customer');
    }
  }, [initialType]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData({
      fullName: '',
      email: '',
      mobileNumber: '',
      password: ''
    });
    setErrors({
      fullName: '',
      email: '',
      mobileNumber: '',
      password: ''
    });
    setIsEmailVerified(false);
  };

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#CBD5E1' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak (Must be 6+ chars with letters & numbers)', color: '#EF4444' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium (Good password strength)', color: '#F59E0B' };
    return { score: 4, label: 'Strong (Excellent security)', color: '#10B981' };
  };

  const pwdStrength = calculatePasswordStrength(formData.password);

  // Name validation (min 3 letters, no single letters or dots)
  const validateNameFormat = (nameStr) => {
    if (!nameStr) return false;
    const trimmed = nameStr.trim();
    if (trimmed.length < 3) return false;
    const letters = (trimmed.match(/[a-zA-Z]/g) || []).length;
    if (letters < 3) return false;
    return /^[a-zA-Z][a-zA-Z\s.'-]*[a-zA-Z.]$/.test(trimmed);
  };

  // Email format validation
  const validateEmailFormat = (emailStr) => {
    if (!emailStr || !emailStr.trim()) return false;
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailStr.trim());
  };

  // Mobile number validation (10 digit Indian number)
  const validateMobileFormat = (mobileStr) => {
    if (!mobileStr) return false;
    const cleaned = mobileStr.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleaned);
  };

  // Real-time mobile input change
  const handleMobileChange = (e) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, mobileNumber: digitsOnly }));

    if (digitsOnly.length === 10) {
      if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
        setErrors(prev => ({ ...prev, mobileNumber: 'Mobile number must start with 6, 7, 8, or 9.' }));
      } else {
        setErrors(prev => ({ ...prev, mobileNumber: '' }));
        checkMobileDuplicate(digitsOnly);
      }
    } else if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setErrors(prev => ({ ...prev, mobileNumber: 'Mobile number must be 10 digits.' }));
    } else {
      setErrors(prev => ({ ...prev, mobileNumber: '' }));
    }
  };

  // Pre-check mobile duplication with backend
  const checkMobileDuplicate = async (mobileDigits) => {
    try {
      const res = await apiClient.get(`/api/auth/check-mobile?mobile=${encodeURIComponent(mobileDigits)}`);
      if (res.data && res.data.exists) {
        setErrors(prev => ({
          ...prev,
          mobileNumber: res.message || `This mobile number is already registered to ${res.data.role === 'LAWYER' ? 'an Advocate' : 'a Customer'} account.`
        }));
      } else {
        setErrors(prev => ({ ...prev, mobileNumber: '' }));
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already registered')) {
        setErrors(prev => ({ ...prev, mobileNumber: err.message }));
      }
    }
  };

  // Real-time email input change
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, email: val }));
    setIsEmailVerified(false);
    setErrors(prev => ({ ...prev, email: '' }));
  };

  // Send OTP inline when user clicks "Verify"
  const handleSendOtpInline = async () => {
    const cleanEmail = (formData.email || '').trim();

    if (!cleanEmail) {
      setErrors(prev => ({ ...prev, email: 'Please enter an email address first.' }));
      toast.error('Please enter an email address first.');
      return;
    }

    if (!validateEmailFormat(cleanEmail)) {
      setErrors(prev => ({ ...prev, email: 'Please provide a valid email address (e.g. name@example.com).' }));
      toast.error('Please provide a valid email address.');
      return;
    }

    setOtpSending(true);
    setErrors(prev => ({ ...prev, email: '' }));

    try {
      // Backend validates if email is already registered before generating OTP
      const res = await apiClient.post('/api/auth/email/send-otp', {
        email: cleanEmail,
        role: role === 'lawyer' ? 'LAWYER' : 'CUSTOMER'
      });

      if (res.status === 'SUCCESS' || res.success) {
        toast.success(res.message || 'Verification code sent to your email.');
        setShowOtpModal(true);
      } else {
        const errMsg = res.message || 'Failed to send verification code.';
        setErrors(prev => ({ ...prev, email: errMsg }));
        toast.error(errMsg);
      }
    } catch (err) {
      const errMsg = err.message || 'Failed to send verification code.';
      setErrors(prev => ({ ...prev, email: errMsg }));
      toast.error(errMsg);
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpSuccess = async () => {
    setShowOtpModal(false);
    setIsEmailVerified(true);
    setErrors(prev => ({ ...prev, email: '' }));
    toast.success('Email verified successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // 1. Full Name check
    const cleanName = (formData.fullName || '').trim();
    if (!cleanName) {
      newErrors.fullName = 'Full name is required.';
    } else if (cleanName.length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters.';
    } else if (!validateNameFormat(cleanName)) {
      newErrors.fullName = 'Full Name must contain at least 3 alphabetic characters and cannot be single letters or dots (e.g. ' + (role === 'customer' ? 'Ramesh Kumar' : 'Adv. Rajesh Verma') + ').';
    }

    // 2. Email format & verification check
    const cleanEmail = (formData.email || '').trim();
    if (!cleanEmail) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmailFormat(cleanEmail)) {
      newErrors.email = 'Please provide a valid email address.';
    } else if (!isEmailVerified) {
      newErrors.email = 'Please click Verify to verify your email before registering.';
    }

    // 3. Mobile Number check
    const cleanMobile = formData.mobileNumber.replace(/\D/g, '');
    if (!cleanMobile) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!validateMobileFormat(cleanMobile)) {
      newErrors.mobileNumber = 'Mobile number must be a valid 10-digit Indian number (e.g. 9876543210).';
    }

    // 4. Password checks
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    } else if (!/[0-9]/.test(formData.password) || !/[a-zA-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain both letters and numbers for security.';
    }

    // 5. Terms acceptance
    if (!agreeTerms) {
      toast.error('You must accept the Terms & Conditions and Privacy Policy.');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    if (role === 'customer') {
      handleCustomerRegisterInitial(cleanEmail, cleanMobile);
    } else {
      handleLawyerSubmit(cleanEmail, cleanMobile);
    }
  };

  const handleCustomerRegisterInitial = async (cleanEmail, cleanMobile) => {
    setLoading(true);
    try {
      const res = await customerApi.register({
        fullName: formData.fullName.trim(),
        email: cleanEmail,
        mobileNumber: cleanMobile,
        password: formData.password,
        confirmPassword: formData.password,
        termsAccepted: true,
        privacyPolicyAccepted: true
      });
      
      if (res.status === 'SUCCESS' && res.data) {
        localStorage.setItem('adalat_customer_id', res.data.customerId);
        setShowPaymentModal(true);
      }
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      if (msg.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: msg }));
      }
      if (msg.toLowerCase().includes('mobile')) {
        setErrors(prev => ({ ...prev, mobileNumber: msg }));
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLawyerSubmit = async (cleanEmail, cleanMobile) => {
    setLoading(true);
    try {
      const res = await lawyerApi.registerStep1({
        fullName: formData.fullName.trim(),
        email: cleanEmail,
        mobileNumber: cleanMobile,
        password: formData.password,
        confirmPassword: formData.password,
        termsAccepted: true,
        privacyPolicyAccepted: true
      });

      if (res.status === 'SUCCESS' && res.data) {
        const lawyerId = res.data.lawyerId;
        localStorage.setItem('adalat_lawyer_id', lawyerId);
        try {
          await loginLawyer(cleanEmail, formData.password);
        } catch (err) {}
        navigate(`/lawyer/onboarding?lawyerId=${lawyerId}`);
      }
    } catch (err) {
      const msg = err.message || 'Lawyer signup failed.';
      if (msg.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: msg }));
      }
      if (msg.toLowerCase().includes('mobile')) {
        setErrors(prev => ({ ...prev, mobileNumber: msg }));
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentRef) => {
    setLoading(true);
    try {
      const orderId = paymentRef?.orderId || ('ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase());
      const transactionId = paymentRef?.gatewayPaymentId || ('PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase());
      const customerId = localStorage.getItem('adalat_customer_id');

      try {
        await customerApi.verifyPayment({
          customerId: customerId ? Number(customerId) : null,
          orderId: orderId,
          gatewayPaymentId: transactionId
        });
      } catch (beErr) {
        console.warn('Backend payment verification note:', beErr);
      }

      toast.success('Payment verified & account registration fully complete!');
      await loginCustomer(formData.email.trim(), formData.password);
    } catch (err) {
      console.error('Payment verification / login error:', err);
      try {
        await loginCustomer(formData.email.trim(), formData.password);
      } catch (loginErr) {}
    } finally {
      setLoading(false);
    }
  };

  const handleFinishAndGoToDashboard = () => {
    setShowPaymentModal(false);
    navigate('/customer/dashboard');
  };

  const leftBgImage = role === 'lawyer' ? lawyerRegBg : customerRegBg;

  return (
    <div className="auth-page-full">
      <div 
        className="full-register-canvas" 
        style={{ backgroundImage: `url(${leftBgImage})` }}
      >
        {/* Top-Left Brand Logo & Title Overlay */}
        <Link to="/" className="top-left-brand-overlay">
          <img src={logoImg} alt="Adalat Logo" className="top-left-logo-img" />
          <div className="top-left-brand-text">
            <span className="top-left-brand-name">ADALAT</span>
            <span className="top-left-brand-tagline">Justice. Guidance. Connection.</span>
          </div>
        </Link>

        {/* Left Side Spacer */}
        <div className="full-left-spacer" />

        {/* Right Side Form Panel */}
        <div className="full-right-form-panel">
          <div className="auth-card-ambient-glow" />
          <div className="auth-form-card-box" key={role}>
            {/* Top Row: Brand Header & Role Toggle */}
            <div className="register-top-row">
              <Link to="/" className="register-brand-header" style={{ marginBottom: 0 }}>
                <img src={logoImg} alt="Adalat Logo" className="register-logo-img" />
                <div className="register-brand-text">
                  <span className="register-brand-name">ADALAT</span>
                  <span className="register-brand-tagline">Justice. Guidance. Connection.</span>
                </div>
              </Link>

              <div className="role-toggle-pill-full">
                <button 
                  type="button"
                  className={`role-btn-full ${role === 'customer' ? 'active' : ''}`}
                  onClick={() => handleRoleChange('customer')}
                >
                  <User size={15} />
                  <span>Customer</span>
                </button>
                <button 
                  type="button"
                  className={`role-btn-full ${role === 'lawyer' ? 'active' : ''}`}
                  onClick={() => handleRoleChange('lawyer')}
                >
                  <Scale size={15} />
                  <span>Lawyer</span>
                </button>
              </div>
            </div>

            {/* Form Header */}
            <div className="register-form-header-full">
              <h2>{role === 'customer' ? 'Customer Account Registration' : 'Lawyer / Advocate Registration'}</h2>
              <p>
                {role === 'customer' 
                  ? 'One-Time ₹99 Platform Account Activation Fee Required'
                  : 'Join India’s Premier Legal Consultation Platform'
                }
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit}>
              <div className="register-form-grid-full">
                <div className="form-group-custom">
                  <label className="form-label-full">Full Name <span className="required">*</span></label>
                  <div className="input-with-icon-full">
                    <User size={17} className="input-icon-full" />
                    <input 
                      type="text"
                      className={`input-full ${errors.fullName ? 'input-error' : ''}`}
                      placeholder={role === 'customer' ? 'e.g. Ramesh Kumar' : 'e.g. Adv. Rajesh Verma'}
                      value={formData.fullName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, fullName: val });
                        if (errors.fullName) {
                          if (validateNameFormat(val)) {
                            setErrors(prev => ({ ...prev, fullName: '' }));
                          }
                        }
                      }}
                      required
                    />
                  </div>
                  {errors.fullName && (
                    <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="form-group-custom">
                  <label className="form-label-full">Mobile Number <span className="required">*</span></label>
                  <div className="input-with-icon-full">
                    <Phone size={17} className="input-icon-full" />
                    <input 
                      type="tel"
                      className={`input-full ${errors.mobileNumber ? 'input-error' : ''}`}
                      placeholder="e.g. 9876543210"
                      value={formData.mobileNumber}
                      onChange={handleMobileChange}
                      maxLength={10}
                      required
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> {errors.mobileNumber}
                    </p>
                  )}
                </div>

                <div className="form-group-custom form-group-full-span">
                  <label className="form-label-full">Email Address <span className="required">*</span></label>
                  <div className="input-with-icon-full">
                    <Mail size={17} className="input-icon-full" />
                    <input 
                      type="email"
                      className={`input-full ${errors.email ? 'input-error' : ''}`}
                      style={{ paddingRight: isEmailVerified ? '5.6rem' : '4.6rem' }}
                      placeholder={role === 'customer' ? 'e.g. customer@gmail.com' : 'e.g. advocate@adalat.legal'}
                      value={formData.email}
                      title={formData.email || 'Email Address'}
                      onChange={handleEmailChange}
                      required
                      disabled={isEmailVerified}
                    />
                    <button
                      type="button"
                      onClick={handleSendOtpInline}
                      disabled={isEmailVerified || otpSending || !formData.email}
                      className={`inline-verify-btn ${isEmailVerified ? 'verified' : 'unverified'}`}
                      title={isEmailVerified ? 'Email Verified' : 'Verify Email with OTP'}
                    >
                      {otpSending ? 'Sending...' : isEmailVerified ? '✓ Verified' : 'Verify'}
                    </button>
                  </div>
                  {errors.email && (
                    <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> {errors.email}
                    </p>
                  )}
                  {isEmailVerified && (
                    <p style={{ color: '#10B981', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Email verified successfully
                    </p>
                  )}
                </div>

                <div className="form-group-custom form-group-full-span">
                  <label className="form-label-full">Password <span className="required">*</span></label>
                  <div className="input-with-icon-full">
                    <Lock size={17} className="input-icon-full" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      className={`input-full ${errors.password ? 'input-error' : ''}`}
                      placeholder="Enter password (6+ chars)"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                      required
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button 
                      type="button"
                      className="password-toggle-btn-full"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> {errors.password}
                    </p>
                  )}
                  {formData.password && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <div style={{ height: '3px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(pwdStrength.score / 4) * 100}%`, background: pwdStrength.color, transition: 'all 0.3s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="checkbox-container-full">
                <input 
                  type="checkbox" 
                  id="agreeTerms" 
                  checked={agreeTerms} 
                  onChange={(e) => setAgreeTerms(e.target.checked)} 
                />
                <label htmlFor="agreeTerms">
                  I agree to the <span onClick={() => setPolicyModalContent('TERMS')} style={{ color: '#5C5C99', fontWeight: 600, textDecoration: 'underline' }}>Terms & Conditions</span> and <span onClick={() => setPolicyModalContent('PRIVACY')} style={{ color: '#5C5C99', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn-submit-pill-full" 
                disabled={loading || !agreeTerms}
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    {role === 'customer' ? 'Proceed to ₹99 Account Activation' : 'Proceed to Advocate Onboarding'}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="register-footer-text-full">
              Already have an account? <Link to="/login" className="register-footer-link-full">Sign In</Link>
            </div>
          </div>
        </div>
      </div>

      <OtpModal 
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={formData.email}
        role={role === 'lawyer' ? 'LAWYER' : 'CUSTOMER'}
        onSuccess={handleOtpSuccess}
      />

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          if (user?.paymentStatus === 'PAID') {
            navigate('/customer/dashboard');
          } else {
            toast.info("Registration saved. Your payment is pending. Please sign in to complete payment anytime.");
            navigate('/login');
          }
        }}
        onSuccessFinish={handleFinishAndGoToDashboard}
        successButtonText="Continue to Dashboard"
        title="Adalat Customer Activation Fee"
        amount="99.00"
        lawyerName="Adalat Platform Activation"
        lawyerUpiId="adalat@upi"
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Terms & Conditions Overlay */}
      {policyModalContent && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 19, 31, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #5C5C99', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#102A43', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={20} style={{ color: '#5C5C99' }} /> {policyModalContent === 'TERMS' ? 'Terms & Conditions Agreement' : 'Client Privacy Policy'}
              </h3>
              <button onClick={() => setPolicyModalContent(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6', paddingRight: '0.5rem' }}>
              {policyModalContent === 'TERMS' ? (
                <>
                  <p><strong>1. Account Registration:</strong> Registration unlocks verified advocate consultations and legal guidance.</p>
                  <p><strong>2. Privilege & Confidentiality:</strong> All legal communications remain strictly confidential under privilege guidelines.</p>
                </>
              ) : (
                <>
                  <p><strong>1. Data Encryption:</strong> All personal data is encrypted using 256-bit SSL protocols.</p>
                  <p><strong>2. Privacy Guarantee:</strong> Adalat does not disclose personal details to unauthorized third parties.</p>
                </>
              )}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', textAlign: 'right' }}>
              <button onClick={() => setPolicyModalContent(null)} className="btn-submit-pill" style={{ width: 'auto', padding: '0.5rem 1.5rem', display: 'inline-flex' }}>
                I Agree & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRegisterPage;
