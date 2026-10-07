import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Scale, ShieldCheck, Clock, Users, ArrowRight, CheckCircle, 
  Search, MessageSquare, CreditCard, Star, Award, ShieldAlert, Lock, 
  Briefcase, Building, Car, ShoppingBag, Zap, Globe, FileText, Phone, Mail, MapPin,
  CheckCircle2, Sparkles, Smartphone, Bot, QrCode, Video, Mic
} from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState('Property & Real Estate Law');
  const [issueDescription, setIssueDescription] = useState('');

  const handleStartConsultation = (e) => {
    e.preventDefault();
    navigate('/find-lawyers');
  };

  const categories = [
    { icon: <ShieldAlert size={24} />, name: 'Criminal Law', desc: 'Bail, FIR, Trials, Appeals and more' },
    { icon: <Users size={24} />, name: 'Family Law', desc: 'Divorce, Child Custody, Maintenance' },
    { icon: <Building size={24} />, name: 'Property Law', desc: 'Property Disputes, Documentation' },
    { icon: <Scale size={24} />, name: 'Civil Law', desc: 'Contracts, Recovery, Disputes' },
    { icon: <ShoppingBag size={24} />, name: 'Consumer Law', desc: 'Consumer Rights, Complaints' },
    { icon: <Lock size={24} />, name: 'Cyber Law', desc: 'Cyber Crimes, Online Frauds' },
    { icon: <Briefcase size={24} />, name: 'Employment Law', desc: 'Workplace Issues, Labour Disputes' },
    { icon: <Globe size={24} />, name: 'Corporate Law', desc: 'Company Matters, Legal Compliance' },
    { icon: <CreditCard size={24} />, name: 'Tax Law', desc: 'Tax Notices, Returns, Tax Disputes' },
    { icon: <FileText size={24} />, name: 'Documentation', desc: 'Agreements, Affidavits, Legal Notices' },
  ];

  return (
    <div className="homepage-container">
      {/* 1. HERO SECTION — Full BG Video with Lighter, Elegant Translucent Gradient Overlays */}
      <section className="relative min-h-[85vh] sm:min-h-[88vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 font-['Outfit',sans-serif]">
        {/* Background Video */}
        <video 
          className="absolute inset-0 w-full h-full object-cover object-right md:object-[75%_center] lg:object-[82%_center] z-0 pointer-events-none filter brightness-100 contrast-105" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Lighter, Balanced Contrast Overlays */}
        {/* Layer 1: Left-to-Right soft translucent navy/slate gradient */}
        <div className="absolute inset-0 z-1 bg-gradient-to-r from-slate-950/75 via-slate-950/50 md:via-slate-950/35 to-transparent pointer-events-none" />
        
        {/* Layer 2: Soft Bottom Fade */}
        <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-transparent to-slate-950/70 pointer-events-none" />
        
        {/* Layer 3: Soft ambient color glows */}
        <div className="absolute top-1/4 left-6 sm:left-12 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none z-1" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-1" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Left — Text Content without bounding box */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-start text-left">

            {/* Main Headline */}
            <h1 className="font-['Cinzel',serif] text-3xl sm:text-4xl md:text-5xl lg:text-[3.15rem] font-extrabold text-white leading-[1.18] tracking-tight mb-4 sm:mb-5 drop-shadow-[0_3px_14px_rgba(0,0,0,0.85)]">
              INSTANT LEGAL<br />
              CONSULTATION WITH<br />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent font-black drop-shadow-[0_2px_14px_rgba(251,191,36,0.35)]">
                VERIFIED ADVOCATES
              </span><br />
              ACROSS INDIA
            </h1>
            
            {/* Subtitle */}
            <p className="text-slate-100 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-6 sm:mb-8">
              Connect with experienced lawyers for online consultation, case guidance, and legal support from the comfort of your home.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8 w-full sm:w-auto">
              <Link 
                to="/register?type=customer" 
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-900/30 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
              >
                <span>Speak to a Lawyer</span> 
                <ArrowRight size={18} />
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base shadow-lg shadow-black/15 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
              >
                <Search size={17} className="text-indigo-600" />
                <span>Find Lawyer</span>
              </Link>
              <Link 
                to="/how-it-works" 
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm sm:text-base border border-white/30 hover:border-white/50 backdrop-blur-md shadow-lg hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
              >
                <span>How It Works</span>
              </Link>
            </div>
            
            {/* Trust Pills Row */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap overflow-x-auto pb-1 max-w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-white/15 text-slate-100 text-xs font-semibold backdrop-blur-md shadow-sm hover:border-white/30 transition-all shrink-0">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>Verified Advocates</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-white/15 text-slate-100 text-xs font-semibold backdrop-blur-md shadow-sm hover:border-white/30 transition-all shrink-0">
                <Lock size={15} className="text-blue-400" />
                <span>Secure & Private</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-white/15 text-slate-100 text-xs font-semibold backdrop-blur-md shadow-sm hover:border-white/30 transition-all shrink-0">
                <Zap size={15} className="text-amber-400" />
                <span>Quick Response</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-white/15 text-slate-100 text-xs font-semibold backdrop-blur-md shadow-sm hover:border-white/30 transition-all shrink-0">
                <CreditCard size={15} className="text-purple-300" />
                <span>Affordable Fees</span>
              </div>
            </div>
          </div>
          
          {/* Hero Right — Open visual space showcasing the scales of justice and gavel in video */}
          <div className="lg:col-span-5 xl:col-span-5 hidden lg:flex min-h-[320px] pointer-events-none" />
        </div>

      </section>

      {/* 2. HOW ADALAT WORKS SECTION */}
      <section className="how-it-works-section">
        <div className="section-title-wrapper">
          <h2>HOW ADALAT WORKS</h2>
          <div className="slate-divider"><span>◆</span></div>
        </div>
        
        <div className="steps-grid-mockup">
          <div className="step-card-mockup">
            <span className="step-number-tag">01</span>
            <div className="step-icon-purple"><MessageSquare size={24} /></div>
            <h3>Describe Your Issue</h3>
            <p>Share your legal concern in a few simple steps and get started.</p>
          </div>
          
          <div className="step-card-mockup">
            <span className="step-number-tag">02</span>
            <div className="step-icon-purple"><Search size={24} /></div>
            <h3>Get Matched Instantly</h3>
            <p>We match you with the best advocate for your specific issue.</p>
          </div>
          
          <div className="step-card-mockup">
            <span className="step-number-tag">03</span>
            <div className="step-icon-purple"><Users size={24} /></div>
            <h3>Consult Online</h3>
            <p>Connect via chat, call, or video and get expert legal advice.</p>
          </div>
          
          <div className="step-card-mockup">
            <span className="step-number-tag">04</span>
            <div className="step-icon-purple"><FileText size={24} /></div>
            <h3>Get Legal Solutions</h3>
            <p>Receive practical legal guidance and next steps for your case.</p>
          </div>
        </div>
      </section>

      {/* 3. FIND SPECIALIZED ADVOCATES SECTION — Light Theme */}
      <section className="w-full bg-slate-50 text-slate-900 py-10 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 border-y border-slate-200 font-['Outfit',sans-serif]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-wide mb-2.5">
              FIND SPECIALIZED <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent font-extrabold">ADVOCATES</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-2.5" />
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              Choose from expert advocates in every legal field
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6 sm:mb-8">
            {categories.map((cat, index) => (
              <div 
                key={index} 
                className="group relative flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl bg-white hover:bg-white border border-slate-200 hover:border-amber-400/80 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/legal-categories')}
              >
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 group-hover:scale-110 group-hover:bg-amber-100 transition-all flex items-center justify-center mb-2.5 shadow-xs">
                  {cat.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-1 line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              to="/legal-categories" 
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <span>View All Categories</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE ADALAT SECTION */}
      <section className="why-choose-section-purple">
        <div className="section-title-wrapper">
          <h2>WHY CHOOSE ADALAT</h2>
          <p className="section-subtitle">We make legal help simple, accessible and trusted</p>
        </div>
        
        <div className="features-grid-mockup">
          <div className="feature-card-mockup">
            <div className="circle-icon-purple"><ShieldCheck size={32} /></div>
            <h3>100% VERIFIED ADVOCATES</h3>
            <p>All advocates are verified professionals with valid enrollment and experience.</p>
          </div>
          
          <div className="feature-card-mockup">
            <div className="circle-icon-purple"><Clock size={32} /></div>
            <h3>INSTANT CONSULTATION</h3>
            <p>Get connected with lawyers instantly. No long waiting, no hassle.</p>
          </div>
          
          <div className="feature-card-mockup">
            <div className="circle-icon-purple"><CreditCard size={32} /></div>
            <h3>AFFORDABLE PRICING</h3>
            <p>Transparent pricing with no hidden charges. Quality legal help for all.</p>
          </div>

          <div className="feature-card-mockup">
            <div className="circle-icon-purple"><Lock size={32} /></div>
            <h3>SECURE & PRIVATE</h3>
            <p>Your information and conversations are 100% secure and confidential.</p>
          </div>
        </div>
      </section>



      {/* 6. READY TO GET LEGAL GUIDANCE BANNER */}
      <section className="w-full bg-slate-50/60 py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 font-['Outfit',sans-serif]">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl lg:rounded-[36px] overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-950 p-6 sm:p-8 lg:p-10 text-center">
            {/* Background Image */}
            <img 
              src="/images/cta-legal-guidance-bg.jpg" 
              alt="Legal Guidance Background" 
              className="absolute inset-0 w-full h-full object-cover object-right md:object-[82%_center] z-0 pointer-events-none filter brightness-95 contrast-105" 
            />
            
            {/* Balanced Vignette & Contrast Overlays */}
            <div className="absolute inset-0 z-1 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/35 pointer-events-none" />
            <div className="absolute inset-0 z-1 bg-radial from-transparent via-transparent to-slate-950/60 pointer-events-none" />
            
            {/* Ambient Lighting Accents */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none z-1" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-1" />

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <h2 className="font-['Cinzel',serif] text-2xl sm:text-3.5xl md:text-4xl lg:text-[40px] font-bold text-white tracking-wide mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                READY TO GET LEGAL GUIDANCE?
              </h2>
              <p className="text-slate-200 text-sm sm:text-base md:text-lg mb-6 max-w-2xl font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Join thousands of people who've resolved their legal issues with verified advocate consultations.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link 
                  to="/register?type=customer" 
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                >
                  <span>Talk to a Lawyer Now</span> 
                  <ArrowRight size={18} />
                </Link>
                <Link 
                  to="/lawyer/register" 
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base border border-slate-700/80 hover:border-slate-500 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                >
                  <span>For Advocates: Join Now</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
