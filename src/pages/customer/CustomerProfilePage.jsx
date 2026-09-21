import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api/customerApi';
import apiClient from '../../api/apiClient';
import OtpModal from '../../components/OtpModal';
import { toast } from 'react-toastify';
import { 
  Bell, 
  ChevronDown, 
  User, 
  Edit3, 
  Camera, 
  Mail, 
  Phone, 
  Calendar,
  Lock,
  CreditCard,
  CheckCircle2,
  Save,
  X,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

const CustomerProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editMobile, setEditMobile] = useState(user?.mobileNumber || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Email Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState('UPDATE_EMAIL'); // 'UPDATE_EMAIL' or 'CHANGE_PASSWORD'
  const [targetOtpEmail, setTargetOtpEmail] = useState('');
  const [isNewEmailVerified, setIsNewEmailVerified] = useState(false);
  const [verifiedEmailValue, setVerifiedEmailValue] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  // Change Password Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setEditName(user.fullName || '');
      setEditEmail(user.email || '');
      setEditMobile(user.mobileNumber || '');
    }
  }, [user]);

  const userName = user?.fullName || 'User';
  const userEmail = user?.email || 'user@adalat.com';
  const userMobile = user?.mobileNumber || 'N/A';
  const initial = (userName.charAt(0) || 'U').toUpperCase();

  const handleTriggerEmailOtp = async (emailToVerify, purpose = 'UPDATE_EMAIL') => {
    if (!emailToVerify || !emailToVerify.trim()) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToVerify.trim())) {
      toast.error('Please enter a valid email address format.');
      return false;
    }
    setOtpSending(true);
    try {
      const res = await apiClient.post('/api/auth/email/resend-otp', {
        email: emailToVerify.trim(),
        role: 'CUSTOMER'
      });
      if (res.status === 'SUCCESS' || (res.data && res.data.success)) {
        toast.success(`Verification OTP sent to ${emailToVerify.trim()}`);
      } else {
        toast.info(res.message || `Please enter the OTP sent to ${emailToVerify.trim()}`);
      }
      setOtpPurpose(purpose);
      setTargetOtpEmail(emailToVerify.trim());
      setShowOtpModal(true);
      return true;
    } catch (err) {
      toast.info(err.message || `Opening OTP verification for ${emailToVerify.trim()}`);
      setOtpPurpose(purpose);
      setTargetOtpEmail(emailToVerify.trim());
      setShowOtpModal(true);
      return true;
    } finally {
      setOtpSending(false);
    }
  };

  const handleSaveProfile = async () => {
    const trimmedEmail = editEmail.trim();
    const currentEmail = (user?.email || '').trim();

    if (!editName.trim()) {
      setError('Full name is required.');
      toast.error('Full name is required.');
      return;
    }
    if (!trimmedEmail) {
      setError('Email address is required.');
      toast.error('Email address is required.');
      return;
    }
    if (!editMobile.trim()) {
      setError('Mobile number is required.');
      toast.error('Mobile number is required.');
      return;
    }

    const isEmailChanged = trimmedEmail.toLowerCase() !== currentEmail.toLowerCase();

    // If email is changed and hasn't been verified with OTP in this session
    if (isEmailChanged && (!isNewEmailVerified || verifiedEmailValue.toLowerCase() !== trimmedEmail.toLowerCase())) {
      setError('');
      await handleTriggerEmailOtp(trimmedEmail, 'UPDATE_EMAIL');
      return;
    }

    await executeSaveProfile(trimmedEmail);
  };

  const executeSaveProfile = async (targetEmail) => {
    try {
      setLoading(true);
      setError('');
      const response = await customerApi.updateProfile({
        fullName: editName.trim(),
        email: targetEmail || editEmail.trim(),
        mobileNumber: editMobile.trim()
      });
      
      const updatedData = response.data || response;
      updateUser({
        fullName: updatedData.fullName,
        email: updatedData.email,
        mobileNumber: updatedData.mobileNumber
      });
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setIsNewEmailVerified(false);
      setVerifiedEmailValue('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update profile.');
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Change Password: sends OTP to registered email
  const handleChangePasswordClick = async () => {
    if (!userEmail) {
      toast.error('No registered email found for this account.');
      return;
    }
    await handleTriggerEmailOtp(userEmail, 'CHANGE_PASSWORD');
  };

  const handleOtpSuccess = async () => {
    setShowOtpModal(false);
    
    if (otpPurpose === 'CHANGE_PASSWORD') {
      toast.success('Email verified! You can now set your new password.');
      setPasswordError('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(true);
    } else {
      setIsNewEmailVerified(true);
      setVerifiedEmailValue(editEmail.trim());
      toast.success('New email verified successfully!');
      await executeSaveProfile(editEmail.trim());
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    try {
      await customerApi.changePassword({
        newPassword,
        confirmPassword
      });
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPasswordError(err.message || 'Failed to change password. Please try again.');
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="portal-layout">
      <Sidebar portalType="customer" />

      <main className="portal-main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', padding: 0 }}>
        
        {/* HEADER */}
        <div className="portal-header-custom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e3a8a', margin: 0, fontFamily: 'Georgia, serif' }}>My Profile</h1>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage your account details and view your payment history.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Green Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', padding: '0.35rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
              <CheckCircle2 size={14} /> ACCOUNT ACTIVE (?99 PAID)
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative', color: '#1e3a8a' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: -2, right: -2, background: '#ef4444', borderRadius: '50%', width: 8, height: 8 }}></span>
            </div>
            
            {/* User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, background: '#1e3a8a', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
                {initial}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e3a8a', lineHeight: 1.2 }}>{userName}</span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.2 }}>{userEmail}</span>
              </div>
              <ChevronDown size={16} color="#1e3a8a" />
            </div>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem', background: '#f8fafc' }}>
          
          {/* PROFILE INFORMATION CARD */}
          <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: '#f5f3ff', color: '#6d28d9', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a' }}>Profile Information</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', marginTop: '0.2rem' }}>View and manage your account details.</p>
                </div>
              </div>
              
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #c4b5fd', color: '#6d28d9', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <Edit3 size={16} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setIsEditing(false); setError(''); setEditName(userName); setEditEmail(userEmail); setEditMobile(userMobile); setIsNewEmailVerified(false); setVerifiedEmailValue(''); }} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #e5e7eb', color: '#4b5563', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    <X size={16} /> Cancel
                  </button>
                  <button onClick={handleSaveProfile} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#6d28d9', border: '1px solid #6d28d9', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                    <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
              {/* Avatar Side */}
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '100px', height: '100px', background: '#102A43', color: '#c4b5fd', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                    {initial}
                  </div>
                  <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#ffffff', borderRadius: '50%', padding: '0.4rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#6d28d9', cursor: 'pointer', display: 'flex' }}>
                    <Camera size={16} />
                  </div>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e3a8a', fontFamily: 'Georgia, serif' }}>{userName}</h2>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>{userEmail}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ecfdf5', color: '#10b981', padding: '0.35rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    <CheckCircle2 size={14} /> ACCOUNT ACTIVE (?99 PAID)
                  </div>
                </div>
              </div>

              {/* Details Grid Side */}
              <div style={{ flex: 1, background: '#f8fafc', padding: '1.5rem 2rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '220px', color: '#4b5563' }}>
                    <User size={18} />
                    <span style={{ fontSize: '0.875rem' }}>Full Name</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none' }}
                      />
                    ) : (
                      <div style={{ color: '#1e3a8a', fontSize: '0.875rem' }}>{userName}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '220px', color: '#4b5563', paddingTop: isEditing ? '0.5rem' : '0' }}>
                    <Mail size={18} />
                    <span style={{ fontSize: '0.875rem' }}>Email Address</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input 
                            type="email" 
                            value={editEmail}
                            onChange={(e) => {
                              setEditEmail(e.target.value);
                              if (isNewEmailVerified && e.target.value.trim().toLowerCase() !== verifiedEmailValue.toLowerCase()) {
                                setIsNewEmailVerified(false);
                              }
                            }}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none' }}
                            placeholder="Enter new email address"
                          />
                          {editEmail.trim().toLowerCase() !== userEmail.toLowerCase() && (
                            isNewEmailVerified && verifiedEmailValue.toLowerCase() === editEmail.trim().toLowerCase() ? (
                              <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', padding: '0.45rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #a7f3d0', whiteSpace: 'nowrap' }}>
                                <CheckCircle2 size={14} /> Verified
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTriggerEmailOtp(editEmail.trim())}
                                disabled={otpSending || !editEmail.trim()}
                                style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #c4b5fd', padding: '0.45rem 0.85rem', borderRadius: '0.375rem', fontSize: '0.78rem', fontWeight: 600, cursor: (otpSending || !editEmail.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                              >
                                {otpSending ? 'Sending OTP...' : 'Verify OTP'}
                              </button>
                            )
                          )}
                        </div>
                        {editEmail.trim().toLowerCase() !== userEmail.toLowerCase() && (!isNewEmailVerified || verifiedEmailValue.toLowerCase() !== editEmail.trim().toLowerCase()) && (
                          <div style={{ color: '#d97706', fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>* New email address requires OTP verification before saving.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: '#1e3a8a', fontSize: '0.875rem' }}>{userEmail}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '220px', color: '#4b5563' }}>
                    <Phone size={18} />
                    <span style={{ fontSize: '0.875rem' }}>Mobile Number</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editMobile}
                        onChange={(e) => setEditMobile(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none' }}
                      />
                    ) : (
                      <div style={{ color: '#1e3a8a', fontSize: '0.875rem' }}>{userMobile}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '220px', color: '#4b5563' }}>
                    <Calendar size={18} />
                    <span style={{ fontSize: '0.875rem' }}>Member Since</span>
                  </div>
                  <div style={{ color: '#1e3a8a', fontSize: '0.875rem' }}>September 17, 2026</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY SETTINGS CARD */}
          <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: '#f5f3ff', color: '#6d28d9', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a' }}>Security Settings</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', marginTop: '0.2rem' }}>Manage your password and account security.</p>
              </div>
            </div>
            <button 
              onClick={handleChangePasswordClick} 
              disabled={otpSending}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #c4b5fd', color: '#6d28d9', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: otpSending ? 'not-allowed' : 'pointer' }}
            >
              <Lock size={16} /> {otpSending && otpPurpose === 'CHANGE_PASSWORD' ? 'Sending OTP...' : 'Change Password'}
            </button>
          </div>

          {/* PAYMENT HISTORY CARD */}
          <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f5f3ff', color: '#6d28d9', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <CreditCard size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a' }}>Payment History</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', marginTop: '0.2rem' }}>View your account activation fees and consultation payments.</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#4b5563', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', borderRadius: '0.5rem 0 0 0' }}>#</th>
                  <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Payment Ref</th>
                  <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Service Description</th>
                  <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Amount</th>
                  <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Date</th>
                  <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', borderRadius: '0 0.5rem 0 0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#1e3a8a', fontWeight: 600 }}>
                  <td style={{ padding: '1rem' }}>1</td>
                  <td style={{ padding: '1rem' }}>PAY-REG-99</td>
                  <td style={{ padding: '1rem' }}>Adalat Customer Account Activation</td>
                  <td style={{ padding: '1rem' }}>₹99.00</td>
                  <td style={{ padding: '1rem' }}>9/17/2026</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: '#ecfdf5', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>PAID</span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Showing 1 of 1 transactions
            </div>
          </div>

        </div>
      </main>

      {/* OTP Email Verification Modal */}
      <OtpModal 
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={targetOtpEmail || (otpPurpose === 'CHANGE_PASSWORD' ? userEmail : editEmail.trim())}
        role="CUSTOMER"
        onSuccess={handleOtpSuccess}
      />

      {/* CHANGE PASSWORD POPUP MODAL */}
      {showPasswordModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 19, 31, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button 
              onClick={() => { setShowPasswordModal(false); setPasswordError(''); setNewPassword(''); setConfirmPassword(''); }} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Close"
            >
              <X size={20} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', background: '#f5f3ff', color: '#6d28d9', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Lock size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#102A43', fontWeight: 700 }}>Set New Password</h3>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                Email verified for <strong style={{ color: '#1e3a8a' }}>{userEmail}</strong>. Please enter your new password below.
              </p>
            </div>

            {passwordError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter at least 6 characters"
                    style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.75rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Re-enter your new password"
                    style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.75rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowPasswordModal(false); setPasswordError(''); setNewPassword(''); setConfirmPassword(''); }} 
                  disabled={passwordLoading}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '0.5rem', border: 'none', background: '#6d28d9', color: '#ffffff', fontSize: '0.875rem', fontWeight: 600, cursor: passwordLoading ? 'not-allowed' : 'pointer' }}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfilePage;
