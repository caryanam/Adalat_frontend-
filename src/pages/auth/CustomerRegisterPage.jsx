import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { customerApi } from '../../api/customerApi';
import { lawyerApi } from '../../api/lawyerApi';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import PaymentModal from '../../components/PaymentModal';
import OtpModal from '../../components/OtpModal';
import { toast } from 'react-toastify';
import { Scale, Lock, Mail, User, Phone, ShieldCheck, ArrowRight, Eye, EyeOff, Award } from 'lucide-react';
import customerRegBg from '../../assets/customer_reg_bg.png';
import lawyerRegBg from '../../assets/lawyer_reg_bg.png';
import logoImg from '../../assets/logo.png';
import './AuthPages.css';

const CustomerRegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial role from URL query param e.g. /register?type=lawyer
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get('type');
  const [role, setRole] = useState(initialType === 'lawyer' ? 'lawyer' : 'customer');

  const [formData, setFormData] = useState({
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

  const { loginCustomer, loginLawyer } = useAuth();

  useEffect(() => {
    if (initialType === 'lawyer') {
      setRole('lawyer');
    } else if (initialType === 'customer') {
      setRole('customer');
    }
  }, [initialType]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    // Reset form fields
    setFormData({
      fullName: '',
      email: '',
      mobileNumber: '',
      password: ''
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (!/[0-9]/.test(formData.password) || !/[a-zA-Z]/.test(formData.password)) {
      toast.error('Password must contain both letters and numbers for security.');
      return;
    }
    if (!agreeTerms) {
      toast.error('You must accept the Terms & Conditions and Privacy Policy.');
      return;
    }
    if (!isEmailVerified) {
      toast.error('Please verify your email address before proceeding.');
      return;
    }

    if (role === 'customer') {
      handleCustomerRegisterInitial();
    } else {
      // Lawyer registration
      handleLawyerSubmit();
    }
  };

  const handleCustomerRegisterInitial = async () => {
    setLoading(true);
    try {
      // Register without payment
      const res = await customerApi.register({
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        confirmPassword: formData.password,
        termsAccepted: true,
        privacyPolicyAccepted: true
      });
      
      if (res.status === 'SUCCESS' && res.data) {
        localStorage.setItem('adalat_customer_id', res.data.customerId); // Temporary store
        setShowPaymentModal(true);
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLawyerSubmit = async () => {
    setLoading(true);
    try {
      const res = await lawyerApi.registerStep1({
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        confirmPassword: formData.password,
        termsAccepted: true,
        privacyPolicyAccepted: true
      });

      if (res.status === 'SUCCESS' && res.data) {
        const lawyerId = res.data.lawyerId;
        localStorage.setItem('adalat_lawyer_id', lawyerId);
        try {
          await loginLawyer(formData.email, formData.password);
        } catch (err) {}
        navigate(`/lawyer/onboarding?lawyerId=${lawyerId}`);
      }
    } catch (err) {
      toast.error(err.message || 'Lawyer signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtpInline = async () => {
    if (!formData.email) {
      toast.error("Please enter an email address first.");
      return;
    }
    setOtpSending(true);
    try {
        const res = await apiClient.post('/api/auth/email/resend-otp', {
            email: formData.email,
            role: role === 'lawyer' ? 'LAWYER' : 'CUSTOMER'
        });
        if (res.success || res.status === 'SUCCESS') {
            toast.success("Verification code sent to your email.");
            setShowOtpModal(true);
        }
    } catch (err) {
        toast.error(err.message || "Failed to send verification code.");
    } finally {
        setOtpSending(false);
    }
  };

  const handleOtpSuccess = async () => {
    setShowOtpModal(false);
    setIsEmailVerified(true);
  };

  const handlePaymentSuccess = async (paymentRef) => {
    setLoading(true);

    try {
      const transactionId = paymentRef?.gatewayPaymentId || ('PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase());
      const customerId = localStorage.getItem('adalat_customer_id');

      // Verify payment in backend
      const res = await customerApi.verifyPayment({
        customerId: customerId,
        gatewayPaymentId: transactionId
      });

      if (res.status === 'SUCCESS' || res.success) {
        toast.success('Payment verified & account registration fully complete!');
        // Fire Customer Login API endpoint
        await loginCustomer(formData.email, formData.password);
        navigate('/customer/legal-assistant');
      }
    } catch (err) {
      toast.error(err.message || 'Payment verification failed.');
    } finally {
      setLoading(false);
    }
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
                    className="input-full"
                    placeholder={role === 'customer' ? 'e.g. Ramesh Kumar' : 'e.g. Adv. Rajesh Verma'}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label className="form-label-full">Email Address <span className="required">*</span></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className="input-with-icon-full" style={{ flex: 1, marginBottom: 0 }}>
                    <Mail size={17} className="input-icon-full" />
                    <input 
                      type="email"
                      className="input-full"
                      placeholder={role === 'customer' ? 'e.g. customer@gmail.com' : 'e.g. advocate@adalat.legal'}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setIsEmailVerified(false);
                      }}
                      required
                      disabled={isEmailVerified}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtpInline}
                    disabled={isEmailVerified || otpSending || !formData.email}
                    style={{
                      padding: '0 16px',
                      background: isEmailVerified ? '#10B981' : '#1e3a8a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: (isEmailVerified || otpSending || !formData.email) ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {otpSending ? 'Sending...' : isEmailVerified ? 'Verified' : 'Verify'}
                  </button>
                </div>
              </div>

              <div className="form-group-custom">
                <label className="form-label-full">Mobile Number <span className="required">*</span></label>
                <div className="input-with-icon-full">
                  <Phone size={17} className="input-icon-full" />
                  <input 
                    type="tel"
                    className="input-full"
                    placeholder="e.g. 9876543210"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label className="form-label-full">Password <span className="required">*</span></label>
                <div className="input-with-icon-full">
                  <Lock size={17} className="input-icon-full" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="input-full"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                {formData.password && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <div style={{ height: '3px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(pwdStrength.score / 4) * 100}%`, background: pwdStrength.color, transition: 'all 0.3s' }}></div>
                    </div>
                  </div>
                )}
              </div>
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

      <OtpModal 
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={formData.email}
        role={role === 'lawyer' ? 'LAWYER' : 'CUSTOMER'}
        onSuccess={handleOtpSuccess}
      />

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
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
