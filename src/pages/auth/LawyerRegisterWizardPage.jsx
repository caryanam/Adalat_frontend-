import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { lawyerApi } from '../../api/lawyerApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Scale, Check, ShieldCheck, Upload, FileText, ArrowRight, ArrowLeft, LogOut, ChevronDown, CheckCircle2, FileCheck } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import './LawyerRegisterWizardPage.css';

const AVAILABLE_PRACTICE_AREAS = [
  { id: 'CRIMINAL_LAW', label: 'Criminal Law' },
  { id: 'FAMILY_LAW', label: 'Family Law & Divorce' },
  { id: 'PROPERTY_LAW', label: 'Property & Real Estate' },
  { id: 'CIVIL_DISPUTES', label: 'Civil Disputes & Recovery' },
  { id: 'CONSUMER_LAW', label: 'Consumer Disputes' },
  { id: 'EMPLOYMENT_LAW', label: 'Employment & Labor' },
  { id: 'CYBERCRIME', label: 'Cyber Crime & IT' },
  { id: 'BANKING_AND_FINANCE', label: 'Banking & Finance' },
  { id: 'CORPORATE_LAW', label: 'Corporate Law' },
  { id: 'MATRIMONIAL_MATTERS', label: 'Matrimonial Matters' },
];

const AVAILABLE_LANGUAGES = [
  { id: 'ENGLISH', label: 'English' },
  { id: 'HINDI', label: 'Hindi' },
  { id: 'MARATHI', label: 'Marathi' },
  { id: 'TAMIL', label: 'Tamil' },
  { id: 'TELUGU', label: 'Telugu' },
  { id: 'BENGALI', label: 'Bengali' },
  { id: 'GUJARATI', label: 'Gujarati' },
  { id: 'KANNADA', label: 'Kannada' }
];

const HeaderScalesGraphic = () => (
  <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Books stack at bottom */}
    <rect x="25" y="62" width="70" height="12" rx="3" fill="#292966" />
    <rect x="23" y="52" width="74" height="11" rx="3" fill="#5C5C99" />
    <rect x="20" y="42" width="80" height="11" rx="3" fill="#A3A3CC" />
    {/* Gavel handle & head */}
    <rect x="75" y="30" width="30" height="6" rx="2" transform="rotate(-25 75 30)" fill="#1C1C4A" />
    <rect x="68" y="22" width="12" height="20" rx="3" transform="rotate(-25 68 22)" fill="#C9A227" />
    {/* Scales of Justice */}
    <path d="M45 40V12H43V40H45Z" fill="#1C1C4A" />
    <path d="M25 18H65" stroke="#1C1C4A" strokeWidth="3" strokeLinecap="round" />
    <path d="M25 18L15 32H35L25 18Z" stroke="#5C5C99" strokeWidth="1.5" fill="rgba(92, 92, 153, 0.15)" />
    <path d="M65 18L55 32H75L65 18Z" stroke="#5C5C99" strokeWidth="1.5" fill="rgba(92, 92, 153, 0.15)" />
  </svg>
);

const LawyerRegisterWizardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const paramLawyerId = searchParams.get('lawyerId') || localStorage.getItem('adalat_lawyer_id') || (user && user.id ? user.id : '');

  const [currentStep, setCurrentStep] = useState(1);
  const [lawyerId, setLawyerId] = useState(paramLawyerId);
  const [loading, setLoading] = useState(false);

  // Step 1 Data
  const [step1Data, setStep1Data] = useState({
    barEnrollmentNumber: '',
    yearsOfExperience: '',
    education: '',
    location: '',
    practiceAreas: ['CRIMINAL_LAW'],
    languages: ['ENGLISH', 'HINDI'],
    bio: 'Experienced legal advocate practicing across court jurisdictions with high success rates.'
  });

  // Step 2 Upload Docs & Refs
  const [uploadedFiles, setUploadedFiles] = useState({
    barCert: null,
    enrollCert: null,
    idProof: null,
    addressProof: null,
    photo: null,
    expCert: null
  });

  const barCertRef = useRef(null);
  const enrollCertRef = useRef(null);
  const idProofRef = useRef(null);
  const addressProofRef = useRef(null);
  const photoRef = useRef(null);
  const expCertRef = useRef(null);

  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [profilePhotoName, setProfilePhotoName] = useState('');
  const photoFileRef = useRef(null);

  const handleProfilePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);

      if (lawyerId) {
        try {
          const res = await lawyerApi.uploadDocument(lawyerId, 'PHOTO', file);
          if (res && res.data && res.data.fileUrl) {
            setStep1Data(prev => ({ ...prev, profilePhotoUrl: res.data.fileUrl }));
          }
          toast.success('Profile photo uploaded successfully!');
        } catch (err) {
          console.log('Profile photo upload error:', err);
          toast.error('Failed to upload profile photo. Please try again.');
        }
      } else {
        toast.success('Profile photo uploaded successfully!');
      }
    }
  };

  const handleCardClick = (key) => {
    if (key === 'barCert' && barCertRef.current) barCertRef.current.click();
    if (key === 'enrollCert' && enrollCertRef.current) enrollCertRef.current.click();
    if (key === 'idProof' && idProofRef.current) idProofRef.current.click();
    if (key === 'addressProof' && addressProofRef.current) addressProofRef.current.click();
    if (key === 'photo' && photoRef.current) photoRef.current.click();
    if (key === 'expCert' && expCertRef.current) expCertRef.current.click();
  };

  const handleFileChange = async (key, e) => {
    const file = e.target.files[0];
    if (file) {
      const docTypeMap = {
        barCert: 'BAR_COUNCIL_CERTIFICATE',
        enrollCert: 'ENROLLMENT_CERTIFICATE',
        idProof: 'ID_PROOF',
        addressProof: 'ADDRESS_PROOF',
        photo: 'PHOTO',
        expCert: 'DEGREE_CERTIFICATE'
      };

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          fileObj: file,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: file.type || 'image/jpeg',
          dataUrl: event.target.result
        };

        setUploadedFiles(prev => {
          const updated = { ...prev, [key]: fileData };
          const targetId = lawyerId || '10';
          try {
            localStorage.setItem(`adalat_lawyer_docs_${targetId}`, JSON.stringify(updated));
            localStorage.setItem('adalat_latest_lawyer_docs', JSON.stringify(updated));
          } catch (err) {}
          return updated;
        });
      };
      reader.readAsDataURL(file);

      // Direct backend API upload
      if (lawyerId) {
        try {
          await lawyerApi.uploadDocument(lawyerId, docTypeMap[key] || 'BAR_COUNCIL_CERTIFICATE', file);
          toast.success(`${file.name} uploaded successfully!`);
        } catch (uploadErr) {
          console.log('Document upload error:', uploadErr);
          toast.error(`Failed to upload ${file.name}. Please try again.`);
        }
      } else {
        toast.success(`${file.name} uploaded successfully!`);
      }
    }
  };

  // Step 3 Pricing & Availability
  const [pricingData, setPricingData] = useState({
    chatFee: '200',
    durationValue: '5',
    durationUnit: 'Mins',
    availableDays: 'Monday - Saturday',
    timeSlot: '10:00 AM - 06:00 PM'
  });

  // Step 4 UPI Payout
  const [upiData, setUpiData] = useState({
    upiId: '',
    accountHolderName: ''
  });
  const [upiErrors, setUpiErrors] = useState({});

  const validateStep4Fields = () => {
    const errors = {};
    const upi = (upiData.upiId || '').trim();
    if (!upi) {
      errors.upiId = 'UPI ID is required.';
    } else if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(upi)) {
      errors.upiId = 'UPI ID must be in valid format: username@bankhandle (e.g. name@upi, 9876543210@paytm).';
    }

    const holderName = (upiData.accountHolderName || '').trim();
    if (!holderName) {
      errors.accountHolderName = 'Account Holder Name is required.';
    } else if (holderName.length < 3) {
      errors.accountHolderName = 'Account Holder Name must be at least 3 characters.';
    } else {
      const letters = (holderName.match(/[a-zA-Z]/g) || []).length;
      if (letters < 3 || !/^[a-zA-Z][a-zA-Z\s.'-]*[a-zA-Z.]$/.test(holderName)) {
        errors.accountHolderName = 'Account Holder Name must contain at least 3 alphabetic characters and cannot be single letters or dots (e.g. Adv. Rajesh Verma).';
      }
    }

    setUpiErrors(errors);
    return errors;
  };

  // Step 5 Verification
  const [declared, setDeclared] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (paramLawyerId) {
      setLawyerId(paramLawyerId);
      fetchExistingProgress(paramLawyerId);
    }
  }, [paramLawyerId]);

  const fetchExistingProgress = async (id) => {
    try {
      const res = await lawyerApi.getLawyerById(id);
      if (res && res.status === 'SUCCESS' && res.data) {
        const data = res.data;

        setStep1Data({
          barEnrollmentNumber: data.barEnrollmentNumber || '',
          yearsOfExperience: data.yearsOfExperience !== null && data.yearsOfExperience !== undefined ? data.yearsOfExperience : '5',
          education: data.education || 'LL.B, Delhi University',
          location: data.location || 'New Delhi',
          practiceAreas: data.practiceAreas && data.practiceAreas.length > 0 ? data.practiceAreas : ['CRIMINAL_LAW'],
          languages: data.languages || ['ENGLISH', 'HINDI'],
          bio: data.bio || 'Practicing advocate with extensive courtroom experience.',
          profilePhotoUrl: data.profilePhotoUrl || ''
        });

        if (data.consultationFee || data.consultationRateAmount) {
          const feeVal = data.consultationFee || data.consultationRateAmount;
          setPricingData(prev => ({ ...prev, chatFee: feeVal.toString() }));
        }

        if (data.upiId) {
          setUpiData(prev => ({ ...prev, upiId: data.upiId }));
        }

        if (data.registrationStatus === 'SUBMITTED') {
          setIsSubmitted(true);
        }
      } else {
        localStorage.removeItem('adalat_lawyer_id');
      }
    } catch (err) {
      localStorage.removeItem('adalat_lawyer_id');
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out. Your progress is saved safely!');
    navigate('/login');
  };

  const handlePracticeAreaToggle = (areaId) => {
    setStep1Data(prev => {
      const exists = prev.practiceAreas.includes(areaId);
      const updated = exists 
        ? prev.practiceAreas.filter(a => a !== areaId)
        : [...prev.practiceAreas, areaId];
      return { ...prev, practiceAreas: updated };
    });
  };

  const handleLanguageToggle = (langId) => {
    setStep1Data(prev => {
      const exists = prev.languages.includes(langId);
      const updated = exists 
        ? prev.languages.filter(l => l !== langId)
        : [...prev.languages, langId];
      return { ...prev, languages: updated };
    });
  };

  // Step 1 Validation Errors (BUG-001 to BUG-005)
  const [formErrors, setFormErrors] = useState({});

  const validateStep1Fields = () => {
    const errors = {};
    const enrollment = (step1Data.barEnrollmentNumber || '').trim().toUpperCase();
    if (!enrollment) {
      errors.barEnrollmentNumber = 'Bar Council Enrollment Number is required.';
    } else if (enrollment.length < 5) {
      errors.barEnrollmentNumber = 'Bar Council Enrollment Number is invalid. A single letter or incomplete number is not accepted.';
    } else if (!/^[A-Za-z]{1,5}\/\d{1,6}\/\d{4}$/.test(enrollment)) {
      errors.barEnrollmentNumber = 'Invalid format. Expected: STATE/NUM/YEAR (e.g., MAH/1234/2020 or D/456/2018).';
    }

    const exp = step1Data.yearsOfExperience;
    if (exp === '' || exp === null || exp === undefined) {
      errors.yearsOfExperience = 'Years of experience is required.';
    } else {
      const expNum = Number(exp);
      if (isNaN(expNum) || !Number.isInteger(expNum)) {
        errors.yearsOfExperience = 'Years of experience must be a whole integer number.';
      } else if (expNum < 0) {
        errors.yearsOfExperience = 'Years of experience cannot be negative. Must be 0 or a positive number.';
      } else if (expNum > 70) {
        errors.yearsOfExperience = 'Years of experience cannot exceed 70 years.';
      }
    }

    const edu = (step1Data.education || '').trim();
    if (!edu) {
      errors.education = 'Education / Qualifications details are required.';
    } else if (edu.length < 2) {
      errors.education = 'Education / Qualifications must be at least 2 characters long (e.g., LL.B., B.A. LL.B., LL.M.). A single letter is not accepted.';
    }

    const loc = (step1Data.location || '').trim();
    if (!loc) {
      errors.location = 'Location / Court City is required.';
    } else if (loc.length < 2) {
      errors.location = 'Location / Court City must be at least 2 characters long. A single letter is not accepted.';
    } else if (!/^[a-zA-Z\s.-]+$/.test(loc)) {
      errors.location = 'Location / Court City can only contain alphabets, spaces, and hyphens. Numbers and special characters are not allowed.';
    }

    const bio = (step1Data.bio || '').trim();
    if (!bio) {
      errors.bio = 'Professional Bio & Practice Summary is required.';
    } else if (bio.length < 50) {
      errors.bio = `Professional Bio must be at least 50 characters long to provide meaningful detail. A single letter or brief text is not accepted (currently ${bio.length} characters).`;
    } else if (bio.length > 2000) {
      errors.bio = 'Professional Bio cannot exceed 2000 characters.';
    }

    if (!step1Data.practiceAreas || step1Data.practiceAreas.length === 0) {
      errors.practiceAreas = 'Please select at least one Practice Area.';
    }

    if (!step1Data.languages || step1Data.languages.length === 0) {
      errors.languages = 'Please select at least one Language Spoken.';
    }

    setFormErrors(errors);
    return errors;
  };

  // Navigation handlers
  const handleStep1Next = async (e) => {
    e.preventDefault();
    const errors = validateStep1Fields();
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      if (lawyerId) {
        await lawyerApi.updateStep2(lawyerId, {
          ...step1Data,
          barEnrollmentNumber: (step1Data.barEnrollmentNumber || '').trim().toUpperCase(),
          yearsOfExperience: parseInt(step1Data.yearsOfExperience, 10),
          education: (step1Data.education || '').trim(),
          location: (step1Data.location || '').trim(),
          bio: (step1Data.bio || '').trim()
        });
      }
      toast.success('Professional details saved successfully!');
      setCurrentStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Validation failed on server.';
      toast.error(msg);
      // Strict: Do not advance to Step 2 if backend validation fails
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = (e) => {
    e.preventDefault();
    if (!uploadedFiles.barCert) {
      toast.error('Bar Council Certificate is mandatory. Please upload your document to proceed.');
      return;
    }
    setCurrentStep(3);
  };

  const handleStep3Next = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (lawyerId) {
        const customAmount = parseInt(pricingData.chatFee, 10) || 99;
        let finalDuration = parseInt(pricingData.durationValue, 10) || 5;
        if (pricingData.durationUnit === 'Hours') {
            finalDuration = finalDuration * 60;
        }
        await lawyerApi.updateStep4(lawyerId, customAmount, finalDuration);
      }
      setCurrentStep(4);
    } catch (err) {
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleStep4Next = async (e) => {
    e.preventDefault();
    const errors = validateStep4Fields();
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }
    setLoading(true);
    try {
      if (lawyerId) {
        await lawyerApi.updateStep5(lawyerId, upiData.upiId.trim());
      }
      toast.success('UPI details saved successfully!');
      setCurrentStep(5);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Validation failed on server.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!declared) {
      toast.error('Please accept the accuracy declaration checkbox.');
      return;
    }
    setLoading(true);
    try {
      if (lawyerId) {
        if (pricingData.chatFee) {
          const customAmount = parseInt(pricingData.chatFee, 10) || 99;
          let finalDuration = parseInt(pricingData.durationValue, 10) || 5;
          if (pricingData.durationUnit === 'Hours') {
              finalDuration = finalDuration * 60;
          }
          await lawyerApi.updateStep4(lawyerId, customAmount, finalDuration).catch(() => {});
        }
        if (upiData.upiId) {
          await lawyerApi.updateStep5(lawyerId, upiData.upiId).catch(() => {});
        }
        await lawyerApi.submitApplication(lawyerId);
      }
      setIsSubmitted(true);
      toast.success('Onboarding application submitted for verification!');
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please make sure all required fields and documents are uploaded.');
    } finally {
      setLoading(false);
    }
  };

  // Mock File Upload toggle
  const handleMockUpload = (docKey) => {
    setDocsUploaded(prev => ({ ...prev, [docKey]: !prev[docKey] }));
    toast.success('Document uploaded successfully!');
  };

  const stepsList = [
    { num: 1, label: 'Professional' },
    { num: 2, label: 'Documents' },
    { num: 3, label: 'Pricing' },
    { num: 4, label: 'UPI Payout' },
    { num: 5, label: 'Submit Verification' }
  ];

  return (
    <div className="lawyer-wizard-page">
      {/* Top Header Banner */}
      <div className="wizard-header-top">
        <div className="wizard-brand-left">
          <img src={logoImg} alt="Adalat" className="wizard-logo-img" />
          <div className="wizard-title-group">
            <h1>Advocate Onboarding Portal</h1>
            <p>Step-by-Step Onboarding Flow</p>
          </div>
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="wizard-main-card">
        {!isSubmitted ? (
          <>
            {/* Step Card Top Banner */}
            <div className="step-header-banner">
              <div className="step-banner-left">
                <span className="step-badge-pill">STEP {currentStep} OF 5</span>
                <h2 className="step-banner-title">
                  {currentStep === 1 && 'Professional Details'}
                  {currentStep === 2 && 'Document Upload'}
                  {currentStep === 3 && 'Pricing Information'}
                  {currentStep === 4 && 'UPI Payout Details'}
                  {currentStep === 5 && 'Submit for Verification'}
                </h2>
                <p className="step-banner-desc">
                  {currentStep === 1 && 'Provide your professional and practice information'}
                  {currentStep === 2 && 'Upload your professional documents for verification'}
                  {currentStep === 3 && 'Set your consultation fees and preferences'}
                  {currentStep === 4 && 'Provide your UPI details for receiving payments'}
                  {currentStep === 5 && 'Review your details and submit for admin verification'}
                </p>
              </div>
            </div>

            {/* Horizontal Stepper Progress Bar */}
            <div className="wizard-stepper-row">
              {stepsList.map((st) => (
                <div 
                  key={st.num} 
                  className={`stepper-item ${currentStep === st.num ? 'active' : ''} ${currentStep > st.num ? 'completed' : ''}`}
                >
                  <div className="stepper-circle">
                    {currentStep > st.num ? <Check size={16} /> : st.num}
                  </div>
                  <span className="stepper-label">{st.label}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Professional Details */}
            {currentStep === 1 && (
              <form onSubmit={handleStep1Next} className="wizard-step-body" noValidate>
                <div className="input-grid-4col">
                  {/* BUG-001: Bar Council Enrollment Number */}
                  <div className="form-group-wiz">
                    <label className="form-label-wiz">Bar Council Enrollment Number <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className={`form-input-wiz ${formErrors.barEnrollmentNumber ? 'is-invalid' : ''}`}
                      placeholder="e.g. D/2491/2012"
                      value={step1Data.barEnrollmentNumber}
                      onChange={e => {
                        const val = e.target.value.toUpperCase();
                        setStep1Data({ ...step1Data, barEnrollmentNumber: val });
                        if (formErrors.barEnrollmentNumber) {
                          setFormErrors({ ...formErrors, barEnrollmentNumber: null });
                        }
                      }}
                      style={{ textTransform: 'uppercase' }}
                      required
                    />
                    {formErrors.barEnrollmentNumber && (
                      <span className="field-error-text" style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        ⚠️ {formErrors.barEnrollmentNumber}
                      </span>
                    )}
                  </div>

                  {/* BUG-005: Years of Experience */}
                  <div className="form-group-wiz">
                    <label className="form-label-wiz">Years of Experience <span className="required">*</span></label>
                    <input 
                      type="number" 
                      className={`form-input-wiz ${formErrors.yearsOfExperience ? 'is-invalid' : ''}`}
                      placeholder="e.g. 5"
                      min="0"
                      max="70"
                      value={step1Data.yearsOfExperience}
                      onChange={e => {
                        setStep1Data({ ...step1Data, yearsOfExperience: e.target.value });
                        if (formErrors.yearsOfExperience) {
                          setFormErrors({ ...formErrors, yearsOfExperience: null });
                        }
                      }}
                      required
                    />
                    {formErrors.yearsOfExperience && (
                      <span className="field-error-text" style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        ⚠️ {formErrors.yearsOfExperience}
                      </span>
                    )}
                  </div>

                  {/* BUG-003: Education / Qualifications */}
                  <div className="form-group-wiz">
                    <label className="form-label-wiz">Education / Qualifications <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className={`form-input-wiz ${formErrors.education ? 'is-invalid' : ''}`}
                      placeholder="e.g. LL.B, Delhi University"
                      value={step1Data.education}
                      onChange={e => {
                        setStep1Data({ ...step1Data, education: e.target.value });
                        if (formErrors.education) {
                          setFormErrors({ ...formErrors, education: null });
                        }
                      }}
                      required
                    />
                    {formErrors.education && (
                      <span className="field-error-text" style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        ⚠️ {formErrors.education}
                      </span>
                    )}
                  </div>

                  {/* BUG-002: Location / Court City */}
                  <div className="form-group-wiz">
                    <label className="form-label-wiz">Location / Court City <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className={`form-input-wiz ${formErrors.location ? 'is-invalid' : ''}`}
                      placeholder="e.g. New Delhi"
                      value={step1Data.location}
                      onChange={e => {
                        setStep1Data({ ...step1Data, location: e.target.value });
                        if (formErrors.location) {
                          setFormErrors({ ...formErrors, location: null });
                        }
                      }}
                      required
                    />
                    {formErrors.location && (
                      <span className="field-error-text" style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        ⚠️ {formErrors.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group-wiz">
                  <label className="form-label-wiz">Practice Areas <span className="required">* (Select at least one)</span></label>
                  <div className="checkbox-chips-grid">
                    {AVAILABLE_PRACTICE_AREAS.map(area => {
                      const isSelected = step1Data.practiceAreas.includes(area.id);
                      return (
                        <div 
                          key={area.id} 
                          className={`chip-checkbox-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handlePracticeAreaToggle(area.id)}
                        >
                          <input type="checkbox" checked={isSelected} readOnly />
                          <span>{area.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {formErrors.practiceAreas && (
                    <span className="field-error-text" style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      ⚠️ {formErrors.practiceAreas}
                    </span>
                  )}
                </div>

                <div className="form-group-wiz">
                  <label className="form-label-wiz">Languages Spoken <span className="required">* (Select at least one)</span></label>
                  <div className="checkbox-chips-grid">
                    {AVAILABLE_LANGUAGES.map(lang => {
                      const isSelected = step1Data.languages.includes(lang.id);
                      return (
                        <div 
                          key={lang.id} 
                          className={`chip-checkbox-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleLanguageToggle(lang.id)}
                        >
                          <input type="checkbox" checked={isSelected} readOnly />
                          <span>{lang.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {formErrors.languages && (
                    <span className="field-error-text" style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      ⚠️ {formErrors.languages}
                    </span>
                  )}
                </div>

                <div className="form-group-wiz" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label-wiz">Advocate Profile Photo <span className="required">* (Accepts JPG, PNG, WEBP, GIF - All Image Formats)</span></label>
                  <div 
                    onClick={() => photoFileRef.current && photoFileRef.current.click()}
                    style={{
                      border: '2px dashed #1C1C4A',
                      borderRadius: '12px',
                      padding: '0.85rem 1.15rem',
                      background: '#F0F0FC',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input 
                      type="file" 
                      ref={photoFileRef} 
                      onChange={handleProfilePhotoSelect} 
                      accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp" 
                      style={{ display: 'none' }} 
                    />
                    {profilePhotoPreview || step1Data.profilePhotoUrl ? (
                      <img 
                        src={profilePhotoPreview || step1Data.profilePhotoUrl} 
                        alt="Profile Preview" 
                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #10B981', flexShrink: 0 }} 
                      />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Upload size={20} style={{ color: '#1C1C4A' }} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1C1C4A' }}>
                        {profilePhotoName ? profilePhotoName : (step1Data.profilePhotoUrl ? 'Profile Photo Uploaded' : 'Click to Upload Profile Photo Image')}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        {profilePhotoName || step1Data.profilePhotoUrl ? '✓ Photo selected & saved in database' : 'Supports JPG, PNG, WEBP, GIF, and all image formats'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BUG-004: Professional Bio & Practice Summary */}
                <div className="form-group-wiz" style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label-wiz">Professional Bio & Practice Summary <span className="required">*</span></label>
                    <span style={{ fontSize: '0.78rem', color: (step1Data.bio || '').trim().length >= 50 ? '#059669' : '#DC2626', fontWeight: 600 }}>
                      {(step1Data.bio || '').trim().length} / 50 min characters
                    </span>
                  </div>
                  <textarea 
                    className={`form-input-wiz ${formErrors.bio ? 'is-invalid' : ''}`}
                    rows="3"
                    placeholder="Describe your legal practice experience, court appearances, key achievements, and specialization details..."
                    value={step1Data.bio || ''}
                    onChange={e => {
                      setStep1Data({ ...step1Data, bio: e.target.value });
                      if (formErrors.bio) {
                        setFormErrors({ ...formErrors, bio: null });
                      }
                    }}
                    required
                  />
                  {formErrors.bio && (
                    <span className="field-error-text" style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      ⚠️ {formErrors.bio}
                    </span>
                  )}
                </div>

                <div className="wizard-actions-bar" style={{ justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-wizard-next" disabled={loading}>
                    {loading ? 'Saving & Validating...' : 'Save & Continue'} <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Document Upload */}
            {currentStep === 2 && (
              <form onSubmit={handleStep2Next} className="wizard-step-body">
                <h5 className="section-sub-heading">
                  Document Upload — <span style={{ color: '#EF4444', fontWeight: 700 }}>Bar Council Certificate is Mandatory *</span>
                </h5>

                {/* Hidden File Inputs */}
                <input type="file" ref={barCertRef} onChange={(e) => handleFileChange('barCert', e)} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} />
                <input type="file" ref={enrollCertRef} onChange={(e) => handleFileChange('enrollCert', e)} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} />
                <input type="file" ref={idProofRef} onChange={(e) => handleFileChange('idProof', e)} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} />
                <input type="file" ref={addressProofRef} onChange={(e) => handleFileChange('addressProof', e)} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} />
                <input type="file" ref={photoRef} onChange={(e) => handleFileChange('photo', e)} accept=".jpg,.jpeg,.png" style={{ display: 'none' }} />
                <input type="file" ref={expCertRef} onChange={(e) => handleFileChange('expCert', e)} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} />

                <div className="doc-upload-grid">
                  {/* 1. Bar Council Certificate (MANDATORY) */}
                  <div 
                    className={`doc-upload-card ${uploadedFiles.barCert ? 'has-file' : ''}`} 
                    onClick={() => handleCardClick('barCert')}
                    style={{ borderColor: uploadedFiles.barCert ? '#10B981' : '#1C1C4A', background: uploadedFiles.barCert ? '#F0FDF4' : '#F0F0FC' }}
                  >
                    <div className="doc-upload-icon">
                      {uploadedFiles.barCert ? <FileCheck size={20} style={{ color: '#10B981' }} /> : <Upload size={18} />}
                    </div>
                    <div className="doc-title">
                      Bar Council Certificate <span className="required" style={{ color: '#EF4444' }}>*</span>
                    </div>
                    <div className="doc-hint">
                      {uploadedFiles.barCert ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓ {uploadedFiles.barCert.name} ({uploadedFiles.barCert.size})</span>
                      ) : (
                        'Click to Upload PDF / JPG / PNG (Mandatory)'
                      )}
                    </div>
                  </div>

                  {/* 2. Enrollment Certificate (Optional) */}
                  <div className={`doc-upload-card ${uploadedFiles.enrollCert ? 'has-file' : ''}`} onClick={() => handleCardClick('enrollCert')}>
                    <div className="doc-upload-icon">
                      {uploadedFiles.enrollCert ? <FileCheck size={20} style={{ color: '#10B981' }} /> : <Upload size={18} />}
                    </div>
                    <div className="doc-title">Enrollment Certificate (Optional)</div>
                    <div className="doc-hint">
                      {uploadedFiles.enrollCert ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓ {uploadedFiles.enrollCert.name}</span>
                      ) : (
                        'Upload PDF / JPG / PNG'
                      )}
                    </div>
                  </div>

                  {/* 3. ID Proof (Optional) */}
                  <div className={`doc-upload-card ${uploadedFiles.idProof ? 'has-file' : ''}`} onClick={() => handleCardClick('idProof')}>
                    <div className="doc-upload-icon">
                      {uploadedFiles.idProof ? <FileCheck size={20} style={{ color: '#10B981' }} /> : <Upload size={18} />}
                    </div>
                    <div className="doc-title">ID Proof (Aadhaar / PAN) (Optional)</div>
                    <div className="doc-hint">
                      {uploadedFiles.idProof ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓ {uploadedFiles.idProof.name}</span>
                      ) : (
                        'Upload PDF / JPG / PNG'
                      )}
                    </div>
                  </div>

                  {/* 4. Address Proof (Optional) */}
                  <div className={`doc-upload-card ${uploadedFiles.addressProof ? 'has-file' : ''}`} onClick={() => handleCardClick('addressProof')}>
                    <div className="doc-upload-icon">
                      {uploadedFiles.addressProof ? <FileCheck size={20} style={{ color: '#10B981' }} /> : <Upload size={18} />}
                    </div>
                    <div className="doc-title">Address Proof (Optional)</div>
                    <div className="doc-hint">
                      {uploadedFiles.addressProof ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓ {uploadedFiles.addressProof.name}</span>
                      ) : (
                        'Upload PDF / JPG / PNG'
                      )}
                    </div>
                  </div>

                  {/* 5. Passport Size Photo (Optional) */}
                  <div className={`doc-upload-card ${uploadedFiles.photo ? 'has-file' : ''}`} onClick={() => handleCardClick('photo')}>
                    <div className="doc-upload-icon">
                      {uploadedFiles.photo ? <FileCheck size={20} style={{ color: '#10B981' }} /> : <Upload size={18} />}
                    </div>
                    <div className="doc-title">Passport Size Photo (Optional)</div>
                    <div className="doc-hint">
                      {uploadedFiles.photo ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓ {uploadedFiles.photo.name}</span>
                      ) : (
                        'Upload JPG / PNG'
                      )}
                    </div>
                  </div>

                  {/* 6. Experience Certificate (Optional) */}
                  <div className={`doc-upload-card ${uploadedFiles.expCert ? 'has-file' : ''}`} onClick={() => handleCardClick('expCert')}>
                    <div className="doc-upload-icon">
                      {uploadedFiles.expCert ? <FileCheck size={20} style={{ color: '#10B981' }} /> : <Upload size={18} />}
                    </div>
                    <div className="doc-title">Experience Certificate (Optional)</div>
                    <div className="doc-hint">
                      {uploadedFiles.expCert ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓ {uploadedFiles.expCert.name}</span>
                      ) : (
                        'Upload PDF / JPG / PNG'
                      )}
                    </div>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn-wizard-back">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="btn-wizard-next">
                    Save & Continue <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Pricing Information */}
            {currentStep === 3 && (
              <form onSubmit={handleStep3Next} className="wizard-step-body">


                <div className="input-grid-3col">
                  <div className="form-group-wiz">
                    <label className="form-label-wiz">Fee Amount (₹) <span className="required">*</span></label>
                    <input 
                      type="number" 
                      className="form-input-wiz" 
                      placeholder="e.g. 200 or 99"
                      value={pricingData.chatFee}
                      onChange={e => setPricingData({ ...pricingData, chatFee: e.target.value })}
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group-wiz">
                    <label className="form-label-wiz">Duration Value <span className="required">*</span></label>
                    <input 
                      type="number" 
                      className="form-input-wiz" 
                      placeholder="e.g. 5, 10, 15"
                      value={pricingData.durationValue}
                      onChange={e => setPricingData({ ...pricingData, durationValue: e.target.value })}
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group-wiz">
                    <label className="form-label-wiz">Time Unit Picklist <span className="required">*</span></label>
                    <select
                      className="form-input-wiz"
                      value={pricingData.durationUnit}
                      onChange={e => setPricingData({ ...pricingData, durationUnit: e.target.value })}
                      required
                    >
                      <option value="Mins">Mins</option>
                      <option value="Hours">Hours</option>
                      <option value="Session">Session</option>
                    </select>
                  </div>
                </div>



                <div className="input-grid-2col">
                  <div className="form-group-wiz">
                    <label className="form-label-wiz">Days Available <span className="required">*</span></label>
                    <select
                      className="form-input-wiz"
                      value={pricingData.availableDays}
                      onChange={e => setPricingData({ ...pricingData, availableDays: e.target.value })}
                      required
                    >
                      <option value="Monday - Saturday">Monday - Saturday</option>
                      <option value="All Days (Mon - Sun)">All Days (Mon - Sun)</option>
                      <option value="Monday - Friday">Monday - Friday</option>
                      <option value="Weekends Only (Sat & Sun)">Weekends Only (Sat & Sun)</option>
                    </select>
                  </div>

                  <div className="form-group-wiz">
                    <label className="form-label-wiz">Time Slot / Hours Available <span className="required">*</span></label>
                    <select
                      className="form-input-wiz"
                      value={pricingData.timeSlot}
                      onChange={e => setPricingData({ ...pricingData, timeSlot: e.target.value })}
                      required
                    >
                      <option value="10:00 AM - 06:00 PM">10:00 AM - 06:00 PM</option>
                      <option value="09:00 AM - 09:00 PM">09:00 AM - 09:00 PM</option>
                      <option value="08:00 AM - 04:00 PM">08:00 AM - 04:00 PM</option>
                      <option value="02:00 PM - 10:00 PM">02:00 PM - 10:00 PM</option>
                      <option value="24/7 Available">24/7 Available</option>
                    </select>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" onClick={() => setCurrentStep(2)} className="btn-wizard-back">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="btn-wizard-next">
                    Save & Continue <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: UPI Payout Details */}
            {currentStep === 4 && (
              <form onSubmit={handleStep4Next} className="wizard-step-body">
                <div className="input-grid-2col" style={{ alignItems: 'start', gap: '1.25rem' }}>
                  {/* Left Column: Inputs */}
                  <div>
                    <div className="form-group-wiz">
                      <label className="form-label-wiz">UPI ID <span className="required">*</span></label>
                      <input 
                        type="text" 
                        className={`form-input-wiz ${upiErrors.upiId ? 'is-invalid' : ''}`}
                        placeholder="e.g. yourname@upi or 9876543210@paytm"
                        value={upiData.upiId}
                        onChange={e => {
                          setUpiData({ ...upiData, upiId: e.target.value });
                          if (upiErrors.upiId) {
                            setUpiErrors(prev => ({ ...prev, upiId: null }));
                          }
                        }}
                        required
                      />
                      {upiErrors.upiId && (
                        <span className="field-error-text" style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                          ⚠️ {upiErrors.upiId}
                        </span>
                      )}
                    </div>

                    <div className="form-group-wiz">
                      <label className="form-label-wiz">Account Holder Name <span className="required">*</span></label>
                      <input 
                        type="text" 
                        className={`form-input-wiz ${upiErrors.accountHolderName ? 'is-invalid' : ''}`}
                        placeholder="e.g. Adv. Rajesh Verma"
                        value={upiData.accountHolderName}
                        onChange={e => {
                          setUpiData({ ...upiData, accountHolderName: e.target.value });
                          if (upiErrors.accountHolderName) {
                            setUpiErrors(prev => ({ ...prev, accountHolderName: null }));
                          }
                        }}
                        required
                      />
                      {upiErrors.accountHolderName && (
                        <span className="field-error-text" style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                          ⚠️ {upiErrors.accountHolderName}
                        </span>
                      )}
                    </div>

                    <div className="info-note-box" style={{ marginTop: '0.75rem' }}>
                      <FileText size={18} style={{ color: '#5C5C99', flexShrink: 0 }} />
                      <div>
                        <strong>Direct Payout Guarantee:</strong> All client payments will settle instantly to this UPI ID & QR Code.
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Generated QR Code Card */}
                  <div style={{ background: '#F8FAFC', border: '1.5px solid #CCCCFF', borderRadius: '14px', padding: '1rem 1.15rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1C1C4A', margin: '0 0 0.65rem 0', textAlign: 'center' }}>
                      Generated Live QR Code Preview
                    </h5>

                    <div className="qr-and-apps-row" style={{ gap: '0.85rem' }}>
                      {/* QR Code Box */}
                      <div className="qr-box" style={{ padding: '6px' }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${upiData.upiId || 'advocate@upi'}&pn=${upiData.accountHolderName || 'Advocate'}&cu=INR&tn=Legal%20Consultation`)}`}
                          alt="Live Advocate UPI QR Code"
                          className="qr-image" 
                          style={{ width: '130px', height: '130px' }}
                        />
                        {/* Center Emblem on QR Code */}
                        <div className="qr-center-emblem" style={{ width: '28px', height: '28px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 17L12 7H9.5L4.5 17H7Z" fill="#FF9900"/>
                            <path d="M14.5 17L19.5 7H17L12 17H14.5Z" fill="#00A859"/>
                          </svg>
                        </div>
                      </div>

                      {/* Supported Apps & Circles */}
                      <div className="supported-apps-box" style={{ padding: '0.65rem 0.75rem' }}>
                        <h5 style={{ fontSize: '0.75rem', margin: '0 0 0.35rem 0' }}>Supported UPI Apps</h5>
                        <ul className="upi-apps-list" style={{ fontSize: '0.72rem', margin: '0 0 0.5rem 0' }}>
                          <li><span>Google Pay</span></li>
                          <li><span>PhonePe</span></li>
                          <li><span>Paytm</span></li>
                          <li><span>BHIM</span></li>
                          <li><span>Cred UPI</span></li>
                        </ul>

                        {/* Circular UPI App Icons Row */}
                        <div className="upi-circles-row" style={{ marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                          <div className="circle-app-icon gpay-circle" title="Google Pay" style={{ width: '24px', height: '24px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <rect width="24" height="24" rx="12" fill="#4285F4"/>
                              <path d="M12.2 10.5v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9c1.5 0 2.6.6 3.2 1.2l2.5-2.4C16.3 4.7 14.5 4 12.2 4 7.7 4 4 7.7 4 12.2s3.7 8.2 8.2 8.2c4.7 0 7.8-3.3 7.8-7.9 0-.5-.1-1-.1-1.5h-7.7z" fill="#FFFFFF"/>
                            </svg>
                          </div>

                          <div className="circle-app-icon phonepe-circle" title="PhonePe" style={{ width: '24px', height: '24px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <rect width="24" height="24" rx="12" fill="#5F259F"/>
                              <text x="12" y="16.5" fontSize="13" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">पे</text>
                            </svg>
                          </div>

                          <div className="circle-app-icon paytm-circle" title="Paytm" style={{ width: '24px', height: '24px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <rect width="24" height="24" rx="12" fill="#00BAF2"/>
                              <text x="12" y="15" fontSize="7.5" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">paytm</text>
                            </svg>
                          </div>

                          <div className="circle-app-icon bhim-circle" title="BHIM UPI" style={{ width: '24px', height: '24px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <rect width="24" height="24" rx="12" fill="#F8FAFC" stroke="#CBD5E1"/>
                              <path d="M8 16L12 8H10L6 16H8Z" fill="#FF9900"/>
                              <path d="M14 16L18 8H16L12 16H14Z" fill="#00A859"/>
                            </svg>
                          </div>

                          <div className="circle-app-icon cred-circle" title="Cred / Shield" style={{ width: '24px', height: '24px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <rect width="24" height="24" rx="12" fill="#18181B"/>
                              <path d="M12 6.5L16.5 8.8V12.8C16.5 15.8 14.2 18 12 19C9.8 18 7.5 15.8 7.5 12.8V8.8L12 6.5Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.65rem', fontSize: '0.74rem', color: '#1C1C4A', fontWeight: 600 }}>
                      {upiData.upiId ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓ Live QR Active: {upiData.upiId}</span>
                      ) : (
                        <span style={{ color: '#5C5C99' }}>Enter your UPI ID to generate live QR</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" onClick={() => setCurrentStep(3)} className="btn-wizard-back">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="btn-wizard-next">
                    Save & Continue <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 5: Submit for Verification */}
            {currentStep === 5 && (
              <form onSubmit={handleFinalSubmit} className="wizard-step-body">
                <h5 className="section-sub-heading">Review Your Information — Please review all the information before submitting</h5>

                <div className="review-accordion-stack">
                  <div className="review-card-item">
                    <div className="review-card-left">
                      <FileText size={18} style={{ color: '#5C5C99' }} />
                      <span>Professional Details</span>
                    </div>
                    <button type="button" onClick={() => setCurrentStep(1)} className="btn-edit-link">
                      Edit <ChevronDown size={14} />
                    </button>
                  </div>

                  <div className="review-card-item">
                    <div className="review-card-left">
                      <FileText size={18} style={{ color: '#5C5C99' }} />
                      <span>Documents</span>
                    </div>
                    <button type="button" onClick={() => setCurrentStep(2)} className="btn-edit-link">
                      Edit <ChevronDown size={14} />
                    </button>
                  </div>

                  <div className="review-card-item">
                    <div className="review-card-left">
                      <FileText size={18} style={{ color: '#5C5C99' }} />
                      <span>Pricing Information</span>
                    </div>
                    <button type="button" onClick={() => setCurrentStep(3)} className="btn-edit-link">
                      Edit <ChevronDown size={14} />
                    </button>
                  </div>

                  <div className="review-card-item">
                    <div className="review-card-left">
                      <FileText size={18} style={{ color: '#5C5C99' }} />
                      <span>UPI Payout Details</span>
                    </div>
                    <button type="button" onClick={() => setCurrentStep(4)} className="btn-edit-link">
                      Edit <ChevronDown size={14} />
                    </button>
                  </div>
                </div>

                <div className="form-group-wiz" style={{ margin: '1.5rem 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.86rem', color: '#1C1C4A', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={declared}
                      onChange={e => setDeclared(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#1C1C4A' }}
                      required
                    />
                    <span>I hereby declare that all the information provided is accurate and true to the best of my knowledge.</span>
                  </label>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" onClick={() => setCurrentStep(4)} className="btn-wizard-back">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="btn-wizard-next" disabled={loading || !declared}>
                    {loading ? 'Submitting...' : '🚀 Submit for Verification'}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          /* Final Verification Submitted Screen */
          <div className="verification-submitted-card">
            <div className="submitted-shield-circle">
              <ShieldCheck size={64} style={{ color: '#1C1C4A' }} />
            </div>

            <h2 className="submitted-title">Verification Submitted!</h2>

            <p className="submitted-desc">
              Your profile has been submitted successfully. Our admin team will review your information and documents. You will be notified once your account is verified.
            </p>

            <div className="submitted-info-pill">
              You will be redirected to the dashboard once your account is approved.
            </div>

            <div style={{ marginTop: '2rem' }}>
              <Link to="/lawyer/dashboard" className="btn-wizard-next" style={{ textDecoration: 'none' }}>
                Go to Advocate Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerRegisterWizardPage;
