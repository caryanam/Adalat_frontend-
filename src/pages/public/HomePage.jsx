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
      <section className="relative min-h-[88vh] sm:min-h-[90vh] lg:min-h-[94vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 font-['Outfit',sans-serif]">
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
        <div className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mt-1 sm:mt-2 lg:mt-3 translate-y-[23px]">
          
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
      <section className="w-full bg-slate-50 text-slate-900 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-200 font-['Outfit',sans-serif]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-wide mb-3">
              FIND SPECIALIZED <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent font-extrabold">ADVOCATES</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-3" />
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              Choose from expert advocates in every legal field
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5 mb-10 sm:mb-12">
            {categories.map((cat, index) => (
              <div 
                key={index} 
                className="group relative flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white hover:bg-white border border-slate-200 hover:border-amber-400/80 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/legal-categories')}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 group-hover:scale-110 group-hover:bg-amber-100 transition-all flex items-center justify-center mb-3.5 shadow-xs">
                  {cat.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-1.5 line-clamp-1">
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

      {/* 5. DOWNLOAD MOBILE APPLICATION SECTION — Full-Width Open Display */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 border-b border-slate-200/80 overflow-hidden font-['Outfit',sans-serif] relative">
        
        {/* Subtle Ambient Background Glow Orbs */}
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* LEFT SIDE: Realistic Modern Flagship Smartphone Showcase */}
            <div className="lg:col-span-5 flex justify-center relative py-4">
                
                {/* Floating Trust Badge 1 (Top Left) */}
                <div className="absolute -top-1 -left-2 sm:-left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/80 py-1.5 px-3 rounded-2xl shadow-lg flex items-center gap-2.5 transition-transform duration-300 hover:scale-105">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-slate-900 leading-tight">100% Bar Verified</div>
                    <div className="text-[9px] text-slate-500 font-medium">Certified Advocates</div>
                  </div>
                </div>

                {/* Floating Trust Badge 2 (Bottom Right) */}
                <div className="absolute -bottom-2 -right-2 sm:-right-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/80 py-1.5 px-3 rounded-2xl shadow-lg flex items-center gap-2.5 transition-transform duration-300 hover:scale-105">
                  <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-slate-900 leading-tight">4.9 ★ Rating</div>
                    <div className="text-[9px] text-slate-500 font-medium">15k+ Legal Consults</div>
                  </div>
                </div>

                {/* Modern Smartphone Outer Chassis */}
                <div className="relative z-10 w-[260px] sm:w-[280px] rounded-[44px] bg-slate-950 p-2.5 shadow-[0_25px_60px_-12px_rgba(15,23,42,0.4)] border-[4px] border-slate-800 transition-all duration-300 hover:shadow-[0_30px_70px_-10px_rgba(15,23,42,0.5)]">
                  
                  {/* Screen Frame with Inner Border & Deep Dark App Canvas */}
                  <div className="relative rounded-[34px] bg-[#080C16] overflow-hidden border border-slate-800/90 text-white select-none">
                    
                    {/* Screen Glass Glare Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-20" />

                    {/* Status Bar */}
                    <div className="pt-2.5 px-4 flex items-center justify-between text-[10px] text-slate-400 font-semibold relative z-10">
                      <span className="font-bold text-slate-200">9:41</span>
                      {/* Dynamic Island */}
                      <div className="w-18 h-3.5 bg-black rounded-full border border-slate-800 flex items-center justify-end px-1.5 gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-300">
                        <span>5G</span>
                        <div className="w-3.5 h-1.5 rounded-2xs border border-slate-400 flex items-center p-0.5">
                          <div className="w-full h-full bg-emerald-400 rounded-3xs" />
                        </div>
                      </div>
                    </div>

                    {/* App Screen Main Body */}
                    <div className="p-3 space-y-2.5 relative z-10">
                      
                      {/* App Header */}
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-['Cinzel',serif] font-bold text-xs shadow-xs">
                            ⚖️
                          </div>
                          <div>
                            <div className="text-[12px] font-bold text-white font-['Cinzel',serif] tracking-wider leading-none">ADALAT</div>
                            <div className="text-[8px] text-amber-400 font-semibold mt-0.5">Verified Legal Network</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                            540+ Online
                          </span>
                        </div>
                      </div>

                      {/* AI Assistant Live Banner */}
                      <div className="rounded-xl p-2.5 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-amber-950/40 border border-indigo-500/30 shadow-sm space-y-1">
                        <div className="flex items-center justify-between text-[9px]">
                          <div className="flex items-center gap-1 font-bold text-indigo-300">
                            <Sparkles size={11} className="text-amber-400" />
                            <span>Adalat AI Assistant</span>
                          </div>
                          <span className="text-[8px] px-1 rounded bg-indigo-500/20 text-indigo-300 font-medium">BNS & IPC</span>
                        </div>
                        <div className="text-[9px] text-slate-300 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 italic">
                          "Analyzing notice... 3 defense grounds identified."
                        </div>
                        <div className="flex items-center justify-between pt-0.5 text-[8px] text-slate-400">
                          <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                            <Mic size={9} /> Tap for multilingual voice
                          </span>
                          <span className="text-indigo-300 underline font-semibold cursor-pointer">Chat AI →</span>
                        </div>
                      </div>

                      {/* Featured Verified Advocate Card */}
                      <div className="rounded-xl bg-slate-900/90 border border-slate-800/90 p-2.5 space-y-2 shadow-xs">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-slate-800 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm border border-indigo-400/30">
                            👨‍⚖️
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[11px] font-bold text-white truncate">Adv. Rajesh Sharma</h4>
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                                🟢 Available
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-400 leading-tight">Supreme Court & Delhi HC</p>
                            <div className="flex items-center gap-1 text-[9px] text-amber-400 font-semibold mt-0.5">
                              <span>★ 4.9</span>
                              <span className="text-slate-500 font-normal">(128 consults)</span>
                            </div>
                          </div>
                        </div>

                        {/* Advocate Quick Action Buttons */}
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          <button className="py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-[9px] text-center shadow-sm flex items-center justify-center gap-1 transition-all">
                            <Sparkles size={9} />
                            <span>10m Free Chat</span>
                          </button>
                          <button className="py-1.5 px-2 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-200 font-semibold text-[9px] text-center border border-indigo-500/40 flex items-center justify-center gap-1 transition-all">
                            <Bot size={10} className="text-amber-400" />
                            <span>AI Assistant</span>
                          </button>
                        </div>
                      </div>

                      {/* Top Legal Categories Tags */}
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span>Practice Areas</span>
                          <span className="text-amber-400 font-semibold">View All</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[8px] text-center">
                          <div className="py-1 px-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 font-medium">
                            ⚖️ Criminal
                          </div>
                          <div className="py-1 px-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 font-medium">
                            🏢 Property
                          </div>
                          <div className="py-1 px-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 font-medium">
                            👨‍👩‍👧 Family
                          </div>
                        </div>
                      </div>

                      {/* Sleek App Dock Bar */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-around text-[8px] text-slate-400">
                        <div className="text-amber-400 font-bold flex flex-col items-center">
                          <span className="text-[10px]">🏛️</span>
                          <span className="text-[7px]">Home</span>
                        </div>
                        <div className="flex flex-col items-center text-slate-400 hover:text-white">
                          <span className="text-[10px]">🤖</span>
                          <span className="text-[7px]">AI Bot</span>
                        </div>
                        <div className="flex flex-col items-center text-slate-400 hover:text-white">
                          <span className="text-[10px]">💬</span>
                          <span className="text-[7px]">Chats</span>
                        </div>
                        <div className="flex flex-col items-center text-slate-400 hover:text-white">
                          <span className="text-[10px]">📁</span>
                          <span className="text-[7px]">Vault</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: High-Impact Typography, Feature Grid & Store CTAs */}
              <div className="lg:col-span-7 space-y-5 text-left">
                
                {/* Pill Tag */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/90 text-xs font-bold tracking-wider uppercase text-amber-800 shadow-xs">
                  <Sparkles size={13} className="text-amber-600 animate-pulse" />
                  <span>Official Mobile App • Android & iOS</span>
                </div>

                {/* Section Heading */}
                <h2 className="font-['Cinzel',serif] text-2xl sm:text-3.5xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                  Justice at Your Fingertips — <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600">
                    Download Adalat App
                  </span>
                </h2>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  Connect immediately with 500+ Bar Council certified advocates across India. Access free 10-minute preliminary chats, 24/7 AI statute insights, and manage case documents safely right from your phone.
                </p>

                {/* 4 Feature Value Cards (2x2 Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Feature 1 */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 transition-all duration-200 flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">10-Min Free Initial Chat</h4>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Discuss your legal issue before booking paid sessions.</p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-200 transition-all duration-200 flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Bot size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">24/7 AI Legal Assistant</h4>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Instant multilingual case insights & BNS/IPC analysis.</p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 hover:bg-amber-50/40 border border-slate-200/80 hover:border-amber-200 transition-all duration-200 flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Lock size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Digital Document Vault</h4>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">256-Bit encrypted storage for petitions, notices & FIRs.</p>
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-200 transition-all duration-200 flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Video size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Encrypted Video & Calls</h4>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Confidential HD consultations with legal privilege.</p>
                    </div>
                  </div>

                </div>

                {/* Download Store Buttons & QR Code Row */}
                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  
                  {/* Google Play Store Button (Android) */}
                  <a
                    href="#download-android"
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 border border-slate-800 group"
                  >
                    <svg className="w-6 h-6 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M3.609 1.814L13.793 12 3.61 22.186A2.247 2.247 0 0 1 3 20.618V3.382c0-.607.228-1.18.609-1.568zm11.232 11.234l2.52 2.52-12.06 6.947 9.54-9.467zm0-2.096L5.3 1.485l12.06 6.947-2.519 2.52zm1.463 1.463l3.52-2.028a1.5 1.5 0 0 0 0-2.614l-3.52-2.028-1.748 1.748 1.748 2.922z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-[9px] uppercase font-semibold text-slate-400 tracking-wider">GET IT ON</div>
                      <div className="text-xs sm:text-sm font-bold text-white tracking-wide">Google Play</div>
                    </div>
                  </a>

                  {/* Apple App Store Button (iOS) */}
                  <a
                    href="#download-ios"
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 border border-slate-800 group"
                  >
                    <svg className="w-6 h-6 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.74 1.04-1.8 1.01-2.87-.96.04-2.14.64-2.82 1.44-.59.69-1.12 1.76-1.01 2.82 1.07.08 2.21-.59 2.82-1.39z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-[9px] uppercase font-semibold text-slate-400 tracking-wider">Download on the</div>
                      <div className="text-xs sm:text-sm font-bold text-white tracking-wide">App Store</div>
                    </div>
                  </a>

                  {/* Sleek Mini QR Code Preview Card */}
                  <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200/90 text-left">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 shrink-0 shadow-2xs">
                      <QrCode size={18} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-900 leading-tight">Scan to Install</div>
                      <div className="text-[8px] text-slate-500">Camera / QR Scanner</div>
                    </div>
                  </div>

                </div>

                {/* Bottom Trust & Compliance Indicator Strip */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Star size={13} className="text-amber-500 fill-amber-500" /> 4.9 Rating (15k+ Reviews)
                  </span>
                  <span>•</span>
                  <span>50,000+ Active Downloads</span>
                  <span>•</span>
                  <span>🇮🇳 Bar Council Compliant</span>
                </div>

              </div>

            </div>
        </div>
      </section>

      {/* 6. READY TO GET LEGAL GUIDANCE BANNER */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-['Outfit',sans-serif]">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 p-8 sm:p-12 lg:p-16 text-center">
          <video 
            className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none filter brightness-75" 
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
          
          {/* High-Contrast Overlay */}
          <div className="absolute inset-0 z-1 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-950/90 pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              READY TO GET LEGAL GUIDANCE?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base md:text-lg mb-8 max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Join thousands of people who've resolved their legal issues with verified advocate consultations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
              <Link 
                to="/register?type=customer" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
              >
                <span>Talk to a Lawyer Now</span> 
                <ArrowRight size={18} />
              </Link>
              <Link 
                to="/lawyer/register" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base border border-slate-600 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
              >
                <span>For Advocates: Join Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
