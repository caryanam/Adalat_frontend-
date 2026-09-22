import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import CustomerHeader from '../../components/CustomerHeader';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api/customerApi';
import apiClient from '../../api/apiClient';
import OtpModal from '../../components/OtpModal';
import { toast } from 'react-toastify';
import { 
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
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  FileText,
  Printer,
  Sparkles,
  MapPin,
  Globe,
  Clock,
  Check,
  RefreshCw
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

const CustomerProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('DETAILS'); // 'DETAILS', 'SECURITY', 'BILLING'

  // Update Profile Modal States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
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

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    if (user) {
      setEditName(user.fullName || '');
      setEditEmail(user.email || '');
      setEditMobile(user.mobileNumber || '');
    }
  }, [user]);

  const userName = user?.fullName || 'Valued Client';
  const userEmail = user?.email || 'customer@adalat.com';
  const userMobile = user?.mobileNumber || '+91 98765 43210';
  const initial = (userName.charAt(0) || 'C').toUpperCase();

  const handleOpenEditModal = () => {
    setEditName(user?.fullName || '');
    setEditEmail(user?.email || '');
    setEditMobile(user?.mobileNumber || '');
    setError('');
    setIsNewEmailVerified(false);
    setVerifiedEmailValue('');
    setShowEditProfileModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditProfileModal(false);
    setError('');
    setIsNewEmailVerified(false);
    setVerifiedEmailValue('');
  };

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
      setShowEditProfileModal(false);
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

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="customer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        
        {/* REUSABLE CUSTOMER HEADER */}
        <CustomerHeader 
          title="Account & Profile" 
          subtitle="Manage your personal identity, contact security, and verified consultation billing receipts." 
          badge={{ text: "Active Client (₹99 Paid)", variant: "success", icon: ShieldCheck }} 
          actions={
            <button 
              type="button"
              onClick={handleOpenEditModal} 
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
          }
        />

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-5 sm:space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* HERO IDENTITY BANNER */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-8 shadow-md border border-slate-800 overflow-hidden">
            {/* Background Ambient Glow Accents */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
              
              {/* Left: Avatar & Identity Details */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="relative group self-start sm:self-auto">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-indigo-800 text-white font-extrabold text-2xl sm:text-4xl flex items-center justify-center shadow-xl border-2 border-white/20 shrink-0">
                    {initial}
                  </div>
                  
                  {/* Photo Change Badge */}
                  <button 
                    type="button" 
                    onClick={() => toast.info('Profile picture upload available in next version.')}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600 hover:bg-slate-50 transition-transform active:scale-95 cursor-pointer"
                    title="Update Profile Photo"
                  >
                    <Camera size={13} />
                  </button>

                  {/* Online Status Dot */}
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute top-0 -right-1" title="Account Online" />
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white truncate font-['Outfit',sans-serif]">
                      {userName}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      Verified Client
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                    <span className="flex items-center gap-1 truncate">
                      <Mail size={13} className="text-indigo-400 shrink-0" />
                      <span className="truncate">{userEmail}</span>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Phone size={13} className="text-indigo-400 shrink-0" />
                      <span>{userMobile}</span>
                    </span>
                  </div>

                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-300 bg-white/10 backdrop-blur-xs px-2.5 py-0.5 rounded-lg border border-white/10">
                      <ShieldCheck size={12} className="text-emerald-400" />
                      Account Active (₹99 Lifetime Access)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-300 bg-white/10 backdrop-blur-xs px-2.5 py-0.5 rounded-lg border border-white/10">
                      <Calendar size={12} className="text-indigo-300" />
                      Joined Sep 17, 2026
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Quick Action Controls */}
              <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
                <button 
                  type="button"
                  onClick={handleOpenEditModal} 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-md hover:shadow-indigo-500/30 transition-all cursor-pointer active:scale-95"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile Details</span>
                </button>
              </div>

            </div>
          </div>

          {/* 4 OVERVIEW KPI METRIC TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Account Tier</span>
                <div className="text-sm sm:text-base font-bold text-slate-900">Verified Client</div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold pt-0.5">
                  <CheckCircle2 size={11} /> <span>100% Verified</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Security Level</span>
                <div className="text-sm sm:text-base font-bold text-slate-900">Password & OTP</div>
                <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold pt-0.5">
                  <KeyRound size={11} /> <span>Two-Factor Protected</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Activation Fee</span>
                <div className="text-sm sm:text-base font-bold text-slate-900">₹99.00 Settled</div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold pt-0.5">
                  <Check size={11} /> <span>Lifetime Valid</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CreditCard size={20} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Jurisdiction</span>
                <div className="text-sm sm:text-base font-bold text-slate-900">All-India Courts</div>
                <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold pt-0.5">
                  <Globe size={11} /> <span>State & National</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
            </div>

          </div>

          {/* TAB NAVIGATION STRIP */}
          <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 bg-white px-2 rounded-2xl shadow-2xs overflow-x-auto whitespace-nowrap scrollbar-none">
            <button 
              type="button"
              onClick={() => setActiveTab('DETAILS')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'DETAILS'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <User size={16} />
              <span>Personal Details</span>
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('SECURITY')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'SECURITY'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Lock size={16} />
              <span>Security & Credentials</span>
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('BILLING')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'BILLING'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <CreditCard size={16} />
              <span>Invoices & Payment History</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full">1</span>
            </button>
          </div>

          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Identity & Contact Information</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Your official account profile details used across consultations and legal filings.</p>
                </div>

                <button 
                  type="button"
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                >
                  <Edit3 size={13} />
                  <span>Edit Info</span>
                </button>
              </div>

              {/* READ-ONLY INFORMATION TILES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User size={14} className="text-indigo-600" />
                    <span>{userName}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">Primary Account Holder</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Mail size={14} className="text-indigo-600" />
                    <span className="truncate">{userEmail}</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Verified Primary Email
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Phone</span>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Phone size={14} className="text-indigo-600" />
                    <span>{userMobile}</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Verified Contact
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Role</span>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-indigo-600" />
                    <span>Client / Consumer Portal</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">Standard Consultation Access</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registration Date</span>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-600" />
                    <span>September 17, 2026</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">Active Member</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Platform Security</span>
                  <div className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                    <Lock size={14} className="text-emerald-600" />
                    <span>256-Bit Encrypted</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">Privilege & Confidentiality Protected</span>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SECURITY & CREDENTIALS */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-6">
              
              {/* Change Password Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-2xs shrink-0">
                    <Lock size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Account Login Password</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Secure your login credentials. We send an OTP code to your registered email before allowing updates.</p>
                  </div>
                </div>

                <button 
                  onClick={handleChangePasswordClick} 
                  disabled={otpSending}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-50 active:scale-95"
                >
                  <KeyRound size={15} className="text-indigo-600" /> 
                  <span>{otpSending && otpPurpose === 'CHANGE_PASSWORD' ? 'Sending Security Code...' : 'Update Password'}</span>
                </button>
              </div>

              {/* Security Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Two-Factor Authentication</h4>
                      <p className="text-[11px] text-slate-500">Email OTP verification required on password and contact modifications.</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active & Enforced
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Current Login Session</h4>
                      <p className="text-[11px] text-slate-500">Connected via encrypted JWT bearer token session.</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Session Status:</span>
                    <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Authorized & Active
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: INVOICES & PAYMENT HISTORY */}
          {activeTab === 'BILLING' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Verified Invoices & Receipts</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Official GST-compliant receipts for account activation and lawyer consultations.</p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl self-start sm:self-auto">
                  Total Settled: ₹99.00
                </span>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Service Description</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600">
                        PAY-REG-99
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">Adalat Customer Account Activation</div>
                        <div className="text-[10px] text-slate-400">One-time registration and platform escrow enablement</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">
                        UPI Direct (Auto-Settled)
                      </td>
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 font-mono text-sm">₹99.00</div>
                        <div className="text-[10px] text-slate-400">Incl. 18% GST</div>
                      </td>
                      <td className="p-3.5 text-slate-500 font-medium">
                        9/17/2026
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check size={11} /> PAID
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button 
                          type="button"
                          onClick={() => handleViewReceipt({
                            id: 'PAY-REG-99',
                            service: 'Adalat Customer Account Activation',
                            amount: '99.00',
                            baseAmount: '83.90',
                            gstAmount: '15.10',
                            date: 'September 17, 2026',
                            status: 'PAID'
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                        >
                          <FileText size={12} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>Showing 1 of 1 verified transaction</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  Statutory Tax Invoice Available
                </span>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* UPDATE PROFILE POPUP MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 font-['Outfit',sans-serif]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            
            {/* Close Button Top Right */}
            <button 
              type="button"
              onClick={handleCloseEditModal} 
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Close modal"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs shrink-0">
                <Edit3 size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Update Profile Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact details and account identity.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium mb-4">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProfile();
              }}
              className="space-y-4"
            >
              
              {/* Full Legal Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    placeholder="Enter full legal name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* Email Address with Inline OTP verification if changed */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={16} />
                      </div>
                      <input 
                        type="email" 
                        value={editEmail}
                        onChange={(e) => {
                          setEditEmail(e.target.value);
                          if (isNewEmailVerified && e.target.value.trim().toLowerCase() !== verifiedEmailValue.toLowerCase()) {
                            setIsNewEmailVerified(false);
                          }
                        }}
                        required
                        placeholder="your.email@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs font-medium"
                      />
                    </div>

                    {editEmail.trim().toLowerCase() !== userEmail.toLowerCase() && (
                      isNewEmailVerified && verifiedEmailValue.toLowerCase() === editEmail.trim().toLowerCase() ? (
                        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 shrink-0 shadow-2xs">
                          <CheckCircle2 size={14} /> Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTriggerEmailOtp(editEmail.trim(), 'UPDATE_EMAIL')}
                          disabled={otpSending || !editEmail.trim()}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs shrink-0 transition-colors disabled:opacity-50 cursor-pointer active:scale-95"
                        >
                          {otpSending ? 'Sending...' : 'Verify OTP'}
                        </button>
                      )
                    )}
                  </div>

                  {editEmail.trim().toLowerCase() !== userEmail.toLowerCase() && (!isNewEmailVerified || verifiedEmailValue.toLowerCase() !== editEmail.trim().toLowerCase()) && (
                    <p className="text-xs text-amber-600 font-medium">
                      ⚠️ Changing your email address requires one-time OTP verification before saving.
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input 
                    type="tel" 
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleCloseEditModal} 
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-white" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

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
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 font-['Outfit',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            <button 
              onClick={() => { setShowPasswordModal(false); setPasswordError(''); setNewPassword(''); setConfirmPassword(''); }} 
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
            
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs border border-indigo-100">
                <KeyRound size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Set New Password</h3>
              <p className="text-xs text-slate-500 mt-1">
                Email verification passed for <strong className="text-indigo-600">{userEmail}</strong>. Create a strong replacement password.
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium mb-4">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowPasswordModal(false); setPasswordError(''); setNewPassword(''); setConfirmPassword(''); }} 
                  disabled={passwordLoading}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {passwordLoading ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 font-['Outfit',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            <button 
              onClick={() => setShowReceiptModal(false)} 
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <img src={logoImg} alt="Adalat" className="w-7 h-7 object-contain" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">ADALAT LEGAL SERVICES</h3>
                <p className="text-[10px] text-slate-400">Tax Invoice & Payment Receipt</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Receipt ID</span>
                  <span className="font-mono font-bold text-slate-900">{selectedReceipt.id}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  PAID (UPI)
                </span>
              </div>

              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-semibold text-slate-800">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-slate-800">{userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Date:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.service}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Base Amount:</span>
                  <span className="font-mono font-semibold">₹{selectedReceipt.baseAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST + SGST (18%):</span>
                  <span className="font-mono font-semibold text-amber-600">+ ₹{selectedReceipt.gstAmount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Total Settled:</span>
                  <span className="font-mono text-emerald-600 text-base">₹{selectedReceipt.amount}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
              <button 
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Receipt</span>
              </button>
              <button 
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerProfilePage;
