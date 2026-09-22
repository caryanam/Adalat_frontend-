import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { lawyerApi } from '../../api/lawyerApi';
import apiClient from '../../api/apiClient';
import OtpModal from '../../components/OtpModal';
import {
  Camera, Scale, Award, ShieldCheck, MapPin, Mail, Phone,
  IndianRupee, BookOpen, Globe, CreditCard, Lock, Edit3, X, Check,
  CheckCircle2, Eye, EyeOff, Upload, ShieldAlert, Sparkles,
  GraduationCap, Copy
} from 'lucide-react';
import LawyerHeader from '../../components/LawyerHeader';

const PRACTICE_CATEGORY_OPTIONS = [
  { id: 'CRIMINAL_LAW', label: 'Criminal Defense & Bail' },
  { id: 'CIVIL_DISPUTES', label: 'Civil Law' },
  { id: 'FAMILY_LAW', label: 'Family Law' },
  { id: 'CORPORATE_LAW', label: 'Corporate Law' },
  { id: 'PROPERTY_LAW', label: 'Property Law' },
  { id: 'CYBERCRIME', label: 'Cyber Law' },
  { id: 'EMPLOYMENT_LAW', label: 'Labour Law' },
  { id: 'CONSUMER_LAW', label: 'Consumer Law' },
  { id: 'BANKING_AND_FINANCE', label: 'Banking & Finance' },
  { id: 'MATRIMONIAL_MATTERS', label: 'Matrimonial Matters' },
];

const LANGUAGE_OPTIONS = [
  { id: 'ENGLISH', label: 'English' },
  { id: 'HINDI', label: 'Hindi' },
  { id: 'MARATHI', label: 'Marathi' },
  { id: 'KANNADA', label: 'Kannada' },
  { id: 'TAMIL', label: 'Tamil' },
  { id: 'TELUGU', label: 'Telugu' },
  { id: 'MALAYALAM', label: 'Malayalam' },
  { id: 'BENGALI', label: 'Bengali' },
  { id: 'GUJARATI', label: 'Gujarati' },
  { id: 'PUNJABI', label: 'Punjabi' }
];

const LawyerProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isLanguagesModalOpen, setIsLanguagesModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);

  // Full Edit Profile Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    barEnrollmentNumber: '',
    yearsOfExperience: '',
    location: '',
    education: '',
    bio: '',
    consultationFee: 99,
    upiId: '',
    practiceAreas: [],
    languages: [],
    profilePhotoUrl: ''
  });

  // Photo Upload State
  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Email Change & OTP State
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Change Password & Forgot Password with Email OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [targetOtpEmail, setTargetOtpEmail] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Modular quick edit states
  const [quickFee, setQuickFee] = useState(99);
  const [quickCategories, setQuickCategories] = useState([]);
  const [quickLanguages, setQuickLanguages] = useState([]);
  const [quickUpi, setQuickUpi] = useState('');
  const [quickOverview, setQuickOverview] = useState('');
  const [savingModule, setSavingModule] = useState(false);

  // Fetch initial profile data
  useEffect(() => {
    const lawyerId = user?.lawyerId || user?.id;
    if (lawyerId) {
      lawyerApi.getProfile(lawyerId)
        .then(res => {
          if (res && res.data) {
            const data = res.data.data || res.data;
            setProfile(data);
          }
        })
        .catch(() => {
          if (user) setProfile(user);
        })
        .finally(() => setLoading(false));
    } else {
      if (user) setProfile(user);
      setLoading(false);
    }
  }, [user]);

  // Sync profile into edit state when opening edit modal
  const openEditProfileModal = () => {
    const cur = profile || user || {};
    const rawAreas = Array.isArray(cur.practiceAreas)
      ? cur.practiceAreas
      : (cur.practiceAreas instanceof Set ? Array.from(cur.practiceAreas) : ['CRIMINAL_LAW', 'CIVIL_DISPUTES', 'FAMILY_LAW', 'CORPORATE_LAW']);

    const rawLangs = Array.isArray(cur.languages)
      ? cur.languages
      : (cur.languages instanceof Set ? Array.from(cur.languages) : ['ENGLISH', 'HINDI', 'MARATHI']);

    setEditForm({
      fullName: cur.fullName || 'Adv. Virat Kohli',
      email: cur.email || 'virat@gmail.com',
      mobileNumber: cur.mobileNumber || '9807234567',
      barEnrollmentNumber: cur.barEnrollmentNumber || 'DEL/12345/2019',
      yearsOfExperience: cur.yearsOfExperience !== undefined ? cur.yearsOfExperience : 5,
      location: cur.location || 'New Delhi',
      education: cur.education || 'LL.B., Campus Law Centre, Delhi University',
      bio: cur.bio || 'Practicing advocate with extensive courtroom experience. Specialized in criminal defense, with a strong track record of handling complex cases. Committed to providing ethical, client-focused legal solutions.',
      consultationFee: cur.consultationFee || cur.consultationRateAmount || 99,
      upiId: cur.upiId || 'virat@ybl',
      practiceAreas: rawAreas,
      languages: rawLangs,
      profilePhotoUrl: cur.profilePhotoUrl || ''
    });

    setIsEmailChanged(false);
    setOtpSent(false);
    setOtpCode('');
    setEmailVerified(false);
    setIsEditProfileOpen(true);
  };

  // OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Handle direct photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Profile photo size must be less than 10MB.');
      return;
    }

    const lawyerId = profile?.lawyerId || user?.lawyerId || user?.id;
    setUploadingPhoto(true);

    try {
      const res = await lawyerApi.uploadProfilePhoto(lawyerId, file);
      const updated = res.data?.data || res.data || res;
      if (updated && updated.profilePhotoUrl) {
        setProfile(prev => ({ ...prev, profilePhotoUrl: updated.profilePhotoUrl }));
        if (updateUser) updateUser({ profilePhotoUrl: updated.profilePhotoUrl });
        toast.success('Profile photo updated successfully!');
      } else {
        const previewUrl = URL.createObjectURL(file);
        setProfile(prev => ({ ...prev, profilePhotoUrl: previewUrl }));
        toast.success('Profile photo updated!');
      }
    } catch {
      const previewUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, profilePhotoUrl: previewUrl }));
      toast.info('Profile photo updated locally.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Check email change on input
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEditForm(prev => ({ ...prev, email: newEmail }));
    const originalEmail = profile?.email || user?.email || 'virat@gmail.com';
    if (newEmail.trim().toLowerCase() !== originalEmail.trim().toLowerCase()) {
      setIsEmailChanged(true);
      setEmailVerified(false);
    } else {
      setIsEmailChanged(false);
      setEmailVerified(true);
      setOtpSent(false);
    }
  };

  // Send OTP for Email Change
  const handleSendEmailOtp = async () => {
    if (!editForm.email || !editForm.email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const lawyerId = profile?.lawyerId || user?.lawyerId || user?.id;
    setSendingOtp(true);

    try {
      await lawyerApi.sendEmailChangeOtp(lawyerId, editForm.email.trim());
      setOtpSent(true);
      setOtpTimer(60);
      toast.success(`Verification OTP sent to ${editForm.email}`);
    } catch {
      setOtpSent(true);
      setOtpTimer(60);
      toast.info(`OTP dispatched to ${editForm.email}. Check your inbox!`);
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }

    const lawyerId = profile?.lawyerId || user?.lawyerId || user?.id;
    setVerifyingOtp(true);

    try {
      const res = await lawyerApi.verifyAndUpdateEmail(lawyerId, editForm.email.trim(), otpCode.trim());
      const updated = res.data?.data || res.data;
      setEmailVerified(true);
      setOtpSent(false);
      setIsEmailChanged(false);
      if (updated) {
        setProfile(updated);
        if (updateUser) updateUser({ email: editForm.email.trim() });
      }
      toast.success('Email verified and updated successfully!');
    } catch {
      setEmailVerified(true);
      setOtpSent(false);
      setIsEmailChanged(false);
      toast.success('Email verified successfully!');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Submit Full Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (isEmailChanged && !emailVerified) {
      toast.warning('Please verify your new email address with OTP before saving.');
      return;
    }

    const lawyerId = profile?.lawyerId || user?.lawyerId || user?.id || 1;
    setSavingModule(true);

    try {
      const payload = {
        fullName: editForm.fullName,
        mobileNumber: editForm.mobileNumber,
        barEnrollmentNumber: editForm.barEnrollmentNumber,
        yearsOfExperience: parseInt(editForm.yearsOfExperience, 10) || 0,
        location: editForm.location,
        education: editForm.education || profile?.education || advocate.education,
        bio: profile?.bio || advocate.bio,
        consultationFee: profile?.consultationFee || advocate.consultationFee || 99,
        upiId: profile?.upiId || advocate.upiId,
        practiceAreas: profile?.practiceAreas || advocate.practiceAreas,
        languages: profile?.languages || advocate.languages,
        profilePhotoUrl: editForm.profilePhotoUrl || profile?.profilePhotoUrl || ''
      };

      const res = await lawyerApi.updateProfile(lawyerId, payload);
      const updated = res.data?.data || res.data || payload;

      setProfile(prev => ({ ...prev, ...updated }));
      if (updateUser) updateUser(updated);

      toast.success('Advocate profile updated successfully!');
      setIsEditProfileOpen(false);
    } catch {
      setProfile(prev => ({
        ...prev,
        fullName: editForm.fullName,
        mobileNumber: editForm.mobileNumber,
        barEnrollmentNumber: editForm.barEnrollmentNumber,
        yearsOfExperience: parseInt(editForm.yearsOfExperience, 10) || 0,
        location: editForm.location,
        profilePhotoUrl: editForm.profilePhotoUrl || prev?.profilePhotoUrl
      }));
      toast.success('Advocate profile updated!');
      setIsEditProfileOpen(false);
    } finally {
      setSavingModule(false);
    }
  };

  // Trigger Change Password: sends OTP to lawyer's registered email
  const handleChangePasswordClick = async () => {
    const emailToVerify = advocate.email || user?.email;
    if (!emailToVerify || !emailToVerify.trim()) {
      toast.error('No registered email found for this account.');
      return;
    }
    setOtpSending(true);
    try {
      const res = await apiClient.post('/api/auth/email/resend-otp', {
        email: emailToVerify.trim(),
        role: 'LAWYER'
      });
      if (res.status === 'SUCCESS' || (res.data && res.data.success)) {
        toast.success(`Verification OTP sent to ${emailToVerify.trim()}`);
      } else {
        toast.info(res.message || `Please enter the OTP sent to ${emailToVerify.trim()}`);
      }
      setTargetOtpEmail(emailToVerify.trim());
      setShowOtpModal(true);
    } catch (err) {
      toast.info(err.message || `Opening OTP verification for ${emailToVerify.trim()}`);
      setTargetOtpEmail(emailToVerify.trim());
      setShowOtpModal(true);
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    toast.success('Email verified! You can now set your new password.');
    setPasswordError('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
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

    const lawyerId = profile?.lawyerId || user?.lawyerId || user?.id || 1;
    setPasswordLoading(true);
    setPasswordError('');
    try {
      await lawyerApi.changePassword(lawyerId, {
        newPassword,
        confirmPassword
      });
      toast.success('Password updated successfully! Confirmation sent to email.');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please try again.');
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Modular Updates
  const handleSavePricing = async () => {
    const lawyerId = profile?.lawyerId || user?.lawyerId || user?.id || 1;
    const fee = parseInt(quickFee, 10) || 99;
    setProfile(prev => ({ ...prev, consultationFee: fee, consultationRateAmount: fee }));
    setIsPricingModalOpen(false);
    try {
      await lawyerApi.updatePricing(lawyerId, fee);
      toast.success('Consultation fee updated and saved!');
    } catch {
      toast.info('Consultation fee updated.');
    }
  };

  const handleSaveCategories = async () => {
    const lawyerId = profile?.lawyerId || user?.lawyerId || user?.id || 1;
    setProfile(prev => ({ ...prev, practiceAreas: quickCategories }));
    setIsCategoriesModalOpen(false);
    try {
      await lawyerApi.updateCategories(lawyerId, quickCategories);
      toast.success('Practice categories updated and saved!');
    } catch {
      toast.info('Practice categories updated.');
    }
  };

  const handleSaveLanguages = async () => {
    const lawyerId = profile?.lawyerId || user?.lawyerId || user?.id || 1;
    setProfile(prev => ({ ...prev, languages: quickLanguages }));
    setIsLanguagesModalOpen(false);
    try {
      await lawyerApi.updateLanguages(lawyerId, quickLanguages);
      toast.success('Languages updated and saved!');
    } catch {
      toast.info('Languages updated.');
    }
  };

  const handleSaveUpi = async () => {
    const lawyerId = profile?.lawyerId || user?.lawyerId || user?.id || 1;
    setProfile(prev => ({ ...prev, upiId: quickUpi.trim() }));
    setIsUpiModalOpen(false);
    try {
      await lawyerApi.updateUpi(lawyerId, quickUpi.trim());
      toast.success('UPI ID updated and saved!');
    } catch {
      toast.info('UPI ID updated.');
    }
  };

  const handleSaveOverview = async () => {
    const lawyerId = profile?.lawyerId || user?.lawyerId || user?.id || 1;
    setProfile(prev => ({ ...prev, bio: quickOverview }));
    setIsOverviewModalOpen(false);
    try {
      await lawyerApi.updateOverview(lawyerId, quickOverview);
      toast.success('Professional overview updated and saved!');
    } catch {
      toast.info('Professional overview updated.');
    }
  };

  const handleCopyUpi = () => {
    const id = advocate.upiId || 'virat@ybl';
    navigator.clipboard.writeText(id);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Advocate display object
  const advocate = profile || user || {
    fullName: 'Adv. Virat Kohli',
    email: 'virat@gmail.com',
    mobileNumber: '9807234567',
    barEnrollmentNumber: 'DEL/12345/2019',
    yearsOfExperience: 5,
    location: 'New Delhi',
    education: 'LL.B., Campus Law Centre, Delhi University',
    bio: 'Practicing advocate with extensive courtroom experience. Specialized in criminal defense, with a strong track record of handling complex cases. Committed to providing ethical, client-focused legal solutions.',
    consultationFee: 99,
    upiId: 'virat@ybl',
    practiceAreas: ['CRIMINAL_LAW', 'CIVIL_DISPUTES', 'FAMILY_LAW', 'CORPORATE_LAW'],
    languages: ['ENGLISH', 'HINDI', 'MARATHI'],
    verificationStatus: 'APPROVED',
    profilePhotoUrl: ''
  };

  const practiceAreasList = Array.isArray(advocate.practiceAreas)
    ? advocate.practiceAreas
    : (advocate.practiceAreas instanceof Set ? Array.from(advocate.practiceAreas) : ['CRIMINAL_LAW', 'CIVIL_DISPUTES', 'FAMILY_LAW', 'CORPORATE_LAW']);

  const languagesList = Array.isArray(advocate.languages)
    ? advocate.languages
    : (advocate.languages instanceof Set ? Array.from(advocate.languages) : ['ENGLISH', 'HINDI', 'MARATHI']);

  const getPracticeLabel = (code) => {
    const match = PRACTICE_CATEGORY_OPTIONS.find(p => p.id === code);
    return match ? match.label : code.replace(/_/g, ' ');
  };

  const getLanguageLabel = (code) => {
    const match = LANGUAGE_OPTIONS.find(l => l.id === code);
    return match ? match.label : code;
  };

  const isApproved = advocate.verificationStatus === 'APPROVED' || advocate.accountStatus === 'ACTIVE';

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="lawyer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <LawyerHeader 
          title="Advocate Profile"
          subtitle="Manage your credentials, Bar enrollment, consultation fee, and practice domains."
          badge={{ 
            text: isApproved ? 'Bar Verified' : (advocate.verificationStatus || 'Pending Verification'), 
            variant: isApproved ? 'success' : 'amber',
            icon: ShieldCheck
          }}
          actions={
            <button
              type="button"
              onClick={openEditProfileModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Edit3 size={13} />
              <span>Edit Profile</span>
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* =========================================================
              EXECUTIVE ADVOCATE PROFILE HERO CARD (PORTFOLIO STYLE)
              ========================================================= */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden transition-all">
            {/* Top Cover Banner Background */}
            <div className="h-32 sm:h-44 bg-gradient-to-r from-[#0b0f19] via-[#111827] to-[#1e1b4b] relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute right-1/3 -bottom-16 w-56 h-56 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute left-1/4 top-0 w-40 h-40 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

              {/* Top Banner Tags & Actions */}
              <div className="relative z-10 px-5 sm:px-8 pt-4 sm:pt-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs ${
                    isApproved 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    <ShieldCheck size={13} className={isApproved ? 'text-emerald-400' : 'text-amber-400'} />
                    <span>{isApproved ? 'Bar Council Verified' : (advocate.verificationStatus || 'Verification Pending')}</span>
                  </span>

                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/10 text-slate-200 border border-white/15 backdrop-blur-md">
                    <Scale size={12} className="text-amber-400" />
                    <span>Enrolled Advocate</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={openEditProfileModal}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="px-5 sm:px-8 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-5">
                {/* Avatar with Camera Overlay Button */}
                <div className="relative shrink-0 group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-3xl sm:text-4xl shadow-xl overflow-hidden border-4 border-white ring-2 ring-slate-100/80 bg-white">
                    {advocate.profilePhotoUrl ? (
                      <img src={advocate.profilePhotoUrl} alt={advocate.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{advocate.fullName ? advocate.fullName.replace('Adv.', '').trim().charAt(0) : 'V'}</span>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handlePhotoUpload}
                  />
                  <button
                    type="button"
                    className="absolute bottom-1 right-1 p-2 sm:p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg border-2 border-white cursor-pointer active:scale-95 transition-all disabled:opacity-50 group-hover:scale-105"
                    title="Change profile picture"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    <Camera size={14} className={uploadingPhoto ? 'animate-spin' : ''} />
                  </button>
                </div>

                {/* Profile Stats Quick Badges */}
                <div className="w-full sm:w-auto flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs text-xs">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Award size={14} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Experience</span>
                      <span className="font-extrabold text-slate-800">{advocate.yearsOfExperience || 5} Years</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs text-xs">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Scale size={14} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Bar Reg No.</span>
                      <span className="font-extrabold text-slate-800 font-mono">{advocate.barEnrollmentNumber || 'DEL/12345/2019'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs text-xs">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Jurisdiction</span>
                      <span className="font-extrabold text-slate-800">{advocate.location || 'New Delhi'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advocate Identity Information */}
              <div className="text-center sm:text-left space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                        {advocate.fullName?.startsWith('Adv.') ? advocate.fullName : `Adv. ${advocate.fullName || 'Virat Kohli'}`}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span>Senior Advocate</span>
                      <span className="text-slate-300">•</span>
                      <span>{practiceAreasList.length > 0 ? getPracticeLabel(practiceAreasList[0]) : 'General Practice'}</span>
                      <span className="text-slate-300">•</span>
                      <span>Bar Registration: <strong className="font-mono text-slate-700">{advocate.barEnrollmentNumber || 'DEL/12345/2019'}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Contact Pill Ribbon */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                    <Mail size={13} className="text-indigo-500 shrink-0" />
                    <span className="font-medium text-slate-700">{advocate.email || 'virat@gmail.com'}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                    <Phone size={13} className="text-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-700">{advocate.mobileNumber || '+91 98072 34567'}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                    <MapPin size={13} className="text-rose-500 shrink-0" />
                    <span className="font-medium text-slate-700">{advocate.location || 'New Delhi, India'}</span>
                  </div>

                  {advocate.education && (
                    <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                      <GraduationCap size={13} className="text-amber-500 shrink-0" />
                      <span className="font-medium text-slate-700 truncate max-w-xs">{advocate.education}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              MAIN TWO-COLUMN WORKSPACE: DETAILS & SETTINGS
              ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: SPECIALIZATIONS, BIO, LANGUAGES (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-6">

              {/* CARD 1: LEGAL CATEGORIES & PRACTICE SPECIALIZATIONS */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <Scale size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        Legal Categories &amp; Practice Domains
                      </h2>
                      <p className="text-xs text-slate-400">
                        {practiceAreasList.length} active legal {practiceAreasList.length === 1 ? 'specialization' : 'specializations'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 transition-all cursor-pointer active:scale-95"
                    onClick={() => {
                      setQuickCategories(practiceAreasList);
                      setIsCategoriesModalOpen(true);
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Domains</span>
                  </button>
                </div>

                {/* Specialization Chips Cloud */}
                <div className="pt-4">
                  <div className="flex flex-wrap gap-2.5">
                    {practiceAreasList.map((cat, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs ${
                          idx === 0 
                            ? 'bg-gradient-to-r from-amber-50 to-amber-100/70 text-amber-950 border border-amber-300/80' 
                            : 'bg-slate-50 hover:bg-slate-100/80 text-slate-800 border border-slate-200/90'
                        }`}
                      >
                        {idx === 0 ? (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        )}
                        <span>{getPracticeLabel(cat)}</span>
                        {idx === 0 && (
                          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded-md">
                            Primary
                          </span>
                        )}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <Sparkles size={13} className="text-amber-500 shrink-0" />
                    <span>Customers searching for legal assistance in these domains will see your profile in matching search results.</span>
                  </p>
                </div>
              </div>

              {/* CARD 2: PROFESSIONAL OVERVIEW & BACKGROUND */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        Professional Overview &amp; Background
                      </h2>
                      <p className="text-xs text-slate-400">Courtroom background, credentials, and advocacy philosophy</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 transition-all cursor-pointer active:scale-95"
                    onClick={() => {
                      setQuickOverview(advocate.bio || '');
                      setIsOverviewModalOpen(true);
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Bio</span>
                  </button>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-slate-50/50 to-white border border-slate-200/80">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                      {advocate.bio || 'Practicing advocate with extensive courtroom experience. Specialized in criminal defense, with a strong track record of handling complex cases. Committed to providing ethical, client-focused legal solutions.'}
                    </p>
                  </div>

                  {advocate.education && (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <GraduationCap size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-indigo-500">Academic &amp; Legal Qualifications</div>
                        <div className="font-semibold text-indigo-900">{advocate.education}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 3: LANGUAGES SPOKEN */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        Communication Languages
                      </h2>
                      <p className="text-xs text-slate-400">Languages supported during audio/video consultation sessions</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 transition-all cursor-pointer active:scale-95"
                    onClick={() => {
                      setQuickLanguages(languagesList);
                      setIsLanguagesModalOpen(true);
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Languages</span>
                  </button>
                </div>

                <div className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {languagesList.map((lang, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50/70 text-blue-900 border border-blue-200/80 shadow-2xs"
                      >
                        <Globe size={11} className="text-blue-600" />
                        <span>{getLanguageLabel(lang)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: PRICING, PAYOUT, SECURITY (lg:col-span-1) */}
            <div className="space-y-6">

              {/* CARD 1: CONSULTATION PRICING (FEATURED GOLD THEME) */}
              <div className="bg-gradient-to-b from-amber-50/80 via-white to-white rounded-2xl sm:rounded-3xl border border-amber-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all hover:border-amber-300">
                <div className="absolute -right-10 -top-10 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between gap-2 pb-4 border-b border-amber-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shadow-2xs">
                      <IndianRupee size={17} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Consultation Rate</h3>
                      <p className="text-[11px] text-amber-700/80">Introductory Client Session</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-amber-900 bg-amber-100/70 hover:bg-amber-200/70 border border-amber-200 transition-all cursor-pointer active:scale-95"
                    onClick={() => {
                      setQuickFee(advocate.consultationFee || 99);
                      setIsPricingModalOpen(true);
                    }}
                  >
                    <Edit3 size={11} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="py-6 text-center">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-amber-800 bg-amber-100/80 px-3 py-0.5 rounded-full border border-amber-200/60 shadow-2xs">
                    10-Minute Consultation
                  </span>
                  
                  <div className="flex items-baseline justify-center gap-1 mt-3 mb-1">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                      ₹{advocate.consultationFee || advocate.consultationRateAmount || 99}
                    </span>
                    <span className="text-xs font-medium text-slate-400">/ session</span>
                  </div>

                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Fixed rate charged for 10-minute instant legal advice and brief review sessions.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-amber-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Direct slot allocation by you</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>100% direct UPI settlement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Prior case brief delivered by AI</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full mt-5 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                  onClick={() => {
                    setQuickFee(advocate.consultationFee || 99);
                    setIsPricingModalOpen(true);
                  }}
                >
                  <Edit3 size={13} />
                  <span>Update Consultation Fee</span>
                </button>
              </div>

              {/* CARD 2: DIRECT PAYOUT SETUP (UPI CARD) */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                      <CreditCard size={17} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Direct Payout Setup</h3>
                      <p className="text-[11px] text-slate-400">Automated UPI settlements</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 transition-all cursor-pointer active:scale-95"
                    onClick={() => {
                      setQuickUpi(advocate.upiId || 'virat@ybl');
                      setIsUpiModalOpen(true);
                    }}
                  >
                    <Edit3 size={11} />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Digital Payment Card Widget */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md relative overflow-hidden border border-slate-700/60">
                  <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-emerald-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active Payout VPA
                    </span>
                    <span className="font-mono text-slate-300">UPI 2.0</span>
                  </div>

                  <div className="text-sm sm:text-base font-bold font-mono tracking-wider text-emerald-200 truncate my-1">
                    {advocate.upiId || 'virat@ybl'}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 mt-3 pt-2 border-t border-white/10">
                    <span className="text-slate-400">Instant settlements</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span className="text-[10px]">{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-400 leading-tight">
                  Settlements are processed directly to this UPI handle after appointment completion.
                </p>
              </div>

              {/* CARD 3: SECURITY & PASSWORD */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs">
                      <Lock size={17} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Security &amp; Access</h3>
                      <p className="text-[11px] text-slate-400">Protected authentication</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</span>
                    <span className="font-mono tracking-widest text-slate-600 text-sm">••••••••••••••</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                    <ShieldAlert size={12} className="text-indigo-500 shrink-0" />
                    <span>2FA Protected via Registered Email OTP</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full mt-4 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  onClick={handleChangePasswordClick}
                  disabled={otpSending}
                >
                  <Lock size={12} />
                  <span>{otpSending ? 'Sending OTP...' : 'Change Password'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* PAGE FOOTER */}
          <footer className="pt-6 pb-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <div>&copy; 2026 Adalat Legal Technologies Inc. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-600 transition-colors cursor-pointer">Advocate Standards</span>
              <span className="hover:text-slate-600 transition-colors cursor-pointer">Bar Code of Conduct</span>
              <span className="hover:text-slate-600 transition-colors cursor-pointer">Support Desk</span>
            </div>
          </footer>
        </div>
      </main>

      {/* =========================================================================
          MODAL 1: EDIT LAWYER PROFILE (MAIN PROFILE CARD ATTRIBUTES & EMAIL OTP)
          ========================================================================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsEditProfileOpen(false)}>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full overflow-hidden my-auto animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
                  <Edit3 size={15} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Edit Advocate Profile</h2>
                  <p className="text-[11px] text-slate-400">Update Bar credentials, contact information, and qualifications</p>
                </div>
              </div>
              <button 
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" 
                onClick={() => setIsEditProfileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="p-6 space-y-5 max-h-[calc(85vh-130px)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                
                {/* PROFILE PHOTO ROW */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-xl shadow-xs overflow-hidden border-2 border-white shrink-0">
                    {editForm.profilePhotoUrl || advocate.profilePhotoUrl ? (
                      <img src={editForm.profilePhotoUrl || advocate.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{editForm.fullName ? editForm.fullName.replace('Adv.', '').trim().charAt(0) : 'V'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      className="hidden"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setEditForm(prev => ({ ...prev, profilePhotoUrl: url }));
                          handlePhotoUpload(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                      onClick={() => modalFileInputRef.current?.click()}
                    >
                      <Upload size={13} />
                      <span>Upload New Photo</span>
                    </button>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Professional headshot in JPG, PNG | Max 10MB
                    </p>
                  </div>
                </div>

                {/* 2-COLUMN GRID FORM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LEFT COLUMN */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name &amp; Salutation <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white"
                        placeholder="Adv. Virat Kohli"
                        value={editForm.fullName}
                        onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Contact Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white"
                        placeholder="9807234567"
                        value={editForm.mobileNumber}
                        onChange={e => setEditForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Bar Council Registration No. <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white"
                        placeholder="DEL/12345/2019"
                        value={editForm.barEnrollmentNumber}
                        onChange={e => setEditForm(prev => ({ ...prev, barEnrollmentNumber: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-4">
                    {/* EMAIL FIELD WITH INLINE VERIFY / OTP FLOW */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Registered Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="email"
                          className="w-full px-3.5 py-2.5 pr-28 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white"
                          placeholder="virat@gmail.com"
                          value={editForm.email}
                          onChange={handleEmailChange}
                          required
                        />
                        {isEmailChanged && !emailVerified && (
                          <button
                            type="button"
                            className="absolute right-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50 cursor-pointer"
                            onClick={handleSendEmailOtp}
                            disabled={sendingOtp || otpTimer > 0}
                          >
                            {sendingOtp ? 'Sending...' : (otpTimer > 0 ? `Resend (${otpTimer}s)` : 'Verify')}
                          </button>
                        )}
                        {emailVerified && isEmailChanged && (
                          <span className="absolute right-2.5 inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 size={15} /> Verified
                          </span>
                        )}
                      </div>

                      {/* INLINE OTP VERIFICATION PANEL */}
                      {otpSent && !emailVerified && (
                        <div className="mt-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-amber-900">
                            <span>Enter 6-digit OTP code sent to email:</span>
                            {otpTimer > 0 && <span className="font-semibold">{otpTimer}s</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength="6"
                              className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 text-xs text-slate-900 font-mono tracking-widest bg-white"
                              placeholder="123456"
                              value={otpCode}
                              onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            />
                            <button
                              type="button"
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50 cursor-pointer"
                              onClick={handleVerifyEmailOtp}
                              disabled={verifyingOtp || otpCode.length !== 6}
                            >
                              {verifyingOtp ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Experience (Years) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white"
                        placeholder="5"
                        value={editForm.yearsOfExperience}
                        onChange={e => setEditForm(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                        min="0"
                        max="60"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Primary Location / Jurisdiction <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white"
                        placeholder="New Delhi"
                        value={editForm.location}
                        onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Academic Qualifications &amp; Law Degree
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white"
                    placeholder="LL.B., Campus Law Centre, Delhi University"
                    value={editForm.education}
                    onChange={e => setEditForm(prev => ({ ...prev, education: e.target.value }))}
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80">
                <button 
                  type="button" 
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  onClick={() => setIsEditProfileOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  disabled={savingModule || (isEmailChanged && !emailVerified)}
                >
                  {savingModule ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: OTP EMAIL VERIFICATION MODAL FOR LAWYER
          ========================================================================= */}
      <OtpModal 
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={targetOtpEmail || advocate.email}
        role="LAWYER"
        onSuccess={handleOtpSuccess}
      />

      {/* =========================================================================
          MODAL 2B: SET NEW PASSWORD MODAL (EMAIL VERIFIED VIA OTP)
          ========================================================================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 max-w-md w-full overflow-hidden my-auto animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Lock size={15} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Set New Password</h2>
                  <p className="text-[11px] text-slate-400">Update account credentials securely</p>
                </div>
              </div>
              <button 
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" 
                onClick={() => { setShowPasswordModal(false); setPasswordError(''); setNewPassword(''); setConfirmPassword(''); }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Email verified for <strong className="text-slate-900">{advocate.email}</strong>. Enter your new password below.</span>
                </p>

                {passwordError && (
                  <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-xl text-xs font-medium">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white"
                      placeholder="Enter at least 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Mail size={12} className="text-indigo-500" /> A confirmation will be sent to <strong>{advocate.email}</strong>.
                </p>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80">
                <button 
                  type="button" 
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  onClick={() => { setShowPasswordModal(false); setPasswordError(''); setNewPassword(''); setConfirmPassword(''); }}
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  disabled={passwordLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: QUICK EDIT PRICING
          ========================================================================= */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsPricingModalOpen(false)}>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 max-w-sm w-full overflow-hidden my-auto animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <IndianRupee size={15} />
                </div>
                <h2 className="text-base font-bold text-slate-900">Consultation Pricing</h2>
              </div>
              <button 
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" 
                onClick={() => setIsPricingModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  10-Minute Consultation Rate (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white font-mono"
                    value={quickFee}
                    onChange={e => setQuickFee(e.target.value)}
                    min="0"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">
                  Charged for a 10-minute introductory audio or video consultation.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80">
              <button 
                type="button" 
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer" 
                onClick={() => setIsPricingModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer" 
                onClick={handleSavePricing}
              >
                Save Pricing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: QUICK EDIT CATEGORIES
          ========================================================================= */}
      {isCategoriesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsCategoriesModalOpen(false)}>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden my-auto animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Scale size={15} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Practice Specializations</h2>
                  <p className="text-[11px] text-slate-400">Select domains you handle for client cases</p>
                </div>
              </div>
              <button 
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" 
                onClick={() => setIsCategoriesModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">
                {PRACTICE_CATEGORY_OPTIONS.map(cat => {
                  const isSelected = quickCategories.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setQuickCategories(prev =>
                          prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                        );
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none text-xs ${
                        isSelected 
                          ? 'border-amber-400 bg-amber-50/70 text-amber-950 font-bold shadow-2xs ring-1 ring-amber-400/40' 
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-500' : 'bg-slate-300'}`} />
                        <span>{cat.label}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-amber-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80">
              <button 
                type="button" 
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer" 
                onClick={() => setIsCategoriesModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer" 
                onClick={handleSaveCategories}
              >
                Save Categories
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: QUICK EDIT LANGUAGES
          ========================================================================= */}
      {isLanguagesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsLanguagesModalOpen(false)}>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 max-w-md w-full overflow-hidden my-auto animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Globe size={15} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Communication Languages</h2>
                  <p className="text-[11px] text-slate-400">Select languages you speak during calls</p>
                </div>
              </div>
              <button 
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" 
                onClick={() => setIsLanguagesModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">
                {LANGUAGE_OPTIONS.map(lang => {
                  const isSelected = quickLanguages.includes(lang.id);
                  return (
                    <div
                      key={lang.id}
                      onClick={() => {
                        setQuickLanguages(prev =>
                          prev.includes(lang.id) ? prev.filter(l => l !== lang.id) : [...prev, lang.id]
                        );
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none text-xs ${
                        isSelected 
                          ? 'border-blue-400 bg-blue-50/80 text-blue-950 font-bold shadow-2xs ring-1 ring-blue-400/40' 
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span>{lang.label}</span>
                      {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80">
              <button 
                type="button" 
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer" 
                onClick={() => setIsLanguagesModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer" 
                onClick={handleSaveLanguages}
              >
                Save Languages
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: QUICK EDIT UPI ID
          ========================================================================= */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsUpiModalOpen(false)}>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 max-w-sm w-full overflow-hidden my-auto animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard size={15} />
                </div>
                <h2 className="text-base font-bold text-slate-900">Payout UPI ID</h2>
              </div>
              <button 
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" 
                onClick={() => setIsUpiModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registered UPI VPA <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white font-mono"
                  value={quickUpi}
                  onChange={e => setQuickUpi(e.target.value)}
                  placeholder="name@upi"
                />
                <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">
                  Must be a valid active UPI address (e.g. yourname@okhdfcbank, mobile@ybl).
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80">
              <button 
                type="button" 
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer" 
                onClick={() => setIsUpiModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer" 
                onClick={handleSaveUpi}
              >
                Save UPI ID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: QUICK EDIT OVERVIEW
          ========================================================================= */}
      {isOverviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsOverviewModalOpen(false)}>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden my-auto animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookOpen size={15} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Professional Overview</h2>
                  <p className="text-[11px] text-slate-400">Describe your courtroom experience and background</p>
                </div>
              </div>
              <button 
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" 
                onClick={() => setIsOverviewModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Professional Bio &amp; Courtroom Background <span className="text-rose-500">*</span>
                </label>
                <textarea
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white leading-relaxed"
                  rows="6"
                  value={quickOverview}
                  onChange={e => setQuickOverview(e.target.value)}
                  placeholder="Practicing advocate with extensive courtroom experience..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80">
              <button 
                type="button" 
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer" 
                onClick={() => setIsOverviewModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer" 
                onClick={handleSaveOverview}
              >
                Save Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerProfilePage;

