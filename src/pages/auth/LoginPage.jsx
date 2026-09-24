import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';
import loginBg from '../../assets/login_bg.png';
import logoImg from '../../assets/logo.png';
import './AuthPages.css';

const LoginPage = () => {
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(
    location.pathname === '/forgot-password' || new URLSearchParams(location.search).get('forgot') === 'true'
  );

  const { loginCustomer, loginLawyer, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Try Customer Login
    try {
      const customerData = await loginCustomer(identifier, password);
      if (customerData) {
        toast.success('Welcome back! Signed in to Customer Portal.');
        navigate('/customer/legal-assistant');
        return;
      }
    } catch (err) {
      if (err.status && err.status !== 401 && err.status !== 404) {
        setError(err.message || 'Customer login failed.');
        toast.error(err.message || 'Customer login failed.');
        setLoading(false);
        return;
      }
    }

    // 2. Try Lawyer Login
    try {
      const lawyerData = await loginLawyer(identifier, password);
      if (lawyerData) {
        if (lawyerData.registrationStatus !== 'SUBMITTED') {
          toast.info('Welcome back! Resuming your advocate onboarding wizard...');
          navigate(`/lawyer/onboarding?lawyerId=${lawyerData.lawyerId || ''}`);
        } else if (lawyerData.verificationStatus === 'PENDING') {
          toast.info('Welcome back! Application pending admin verification.');
          navigate(`/lawyer/onboarding?lawyerId=${lawyerData.lawyerId || ''}`);
        } else if (lawyerData.verificationStatus === 'APPROVED') {
          toast.success('Welcome back! Signed in to Advocate Portal.');
          navigate('/lawyer/dashboard');
        } else {
          navigate(`/lawyer/onboarding?lawyerId=${lawyerData.lawyerId || ''}`);
        }
        return;
      }
    } catch (err) {
      if (err.status && err.status !== 401 && err.status !== 404) {
        setError(err.message || 'Lawyer login failed.');
        toast.error(err.message || 'Lawyer login failed.');
        setLoading(false);
        return;
      }
    }

    // 3. Try Admin Login
    try {
      const adminData = await loginAdmin(identifier, password);
      if (adminData) {
        toast.success('Signed in to Adalat Admin Console.');
        navigate('/admin/dashboard');
        return;
      }
    } catch (err) {
      // For Admin, it's the last attempt. If it fails, let it fall through to generic error,
      // UNLESS it's an explicit error from our new check.
      if (err.message && err.message !== 'Invalid Admin credentials.' && err.message !== 'User does not have admin privileges.') {
        setError(err.message);
        toast.error(err.message);
        setLoading(false);
        return;
      }
    }

    // 4. If credentials failed across all roles
    const msg = 'Invalid email address, mobile number, or password. Please verify your credentials.';
    setError(msg);
    toast.error(msg);
    setLoading(false);
  };

  return (
    <div className="auth-page-full">
      <div 
        className="full-register-canvas" 
        style={{ backgroundImage: `url(${loginBg})` }}
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
          {/* Form Header */}
          <div className="register-form-header-full">
            <Link to="/" className="register-brand-header">
              <img src={logoImg} alt="Adalat Logo" className="register-logo-img" />
              <div className="register-brand-text">
                <span className="register-brand-name">ADALAT</span>
                <span className="register-brand-tagline">Justice. Guidance. Connection.</span>
              </div>
            </Link>
            <h2>Sign In to Adalat</h2>
            <p>Enter your registered Email or Mobile Number and Password</p>
          </div>

          {error && (
            <div className="auth-error-alert" style={{ marginBottom: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            <div className="register-form-grid-full" style={{ gridTemplateColumns: '1fr', gap: '1.15rem' }}>
              <div className="form-group-custom">
                <label className="form-label-full">Email Address or Mobile Number <span className="required">*</span></label>
                <div className="input-with-icon-full">
                  <Mail size={17} className="input-icon-full" />
                  <input 
                    type="text"
                    className="input-full"
                    placeholder="e.g. user@gmail.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label-full" style={{ marginBottom: 0 }}>
                    Password <span className="required">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1C1C4A',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-with-icon-full">
                  <Lock size={17} className="input-icon-full" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="input-full"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit-pill-full" 
              disabled={loading}
              style={{ marginTop: '1rem' }}
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={17} />
            </button>
          </form>

          <div className="register-footer-text-full" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1.5rem' }}>
            <p style={{ margin: 0 }}>New Customer? <Link to="/register?type=customer" className="register-footer-link-full">Register Account (₹99)</Link></p>
            <p style={{ margin: 0 }}>Practicing Advocate? <Link to="/register?type=lawyer" className="register-footer-link-full">Free Lawyer Signup</Link></p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={identifier.includes('@') ? identifier.trim() : ''}
        onPasswordResetSuccess={(resetEmail) => {
          setIdentifier(resetEmail);
          setPassword('');
          setError('');
        }}
      />
    </div>
  );
};

export default LoginPage;
