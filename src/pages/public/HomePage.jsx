import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Scale, ShieldCheck, Clock, Users, ArrowRight, CheckCircle, 
  Search, MessageSquare, CreditCard, Star, Award, ShieldAlert, Lock, 
  Briefcase, Building, Car, ShoppingBag, Zap, Globe, FileText, Phone, Mail, MapPin
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
      {/* 1. HERO SECTION — Full BG Video with Gradient Overlay */}
      <section className="hero-section">
        <video 
          className="hero-video-bg" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Overlay gradient: solid purple on left for text, fading on right so scales video shows */}
        <div className="hero-overlay" />

        <div className="hero-content-wrapper">
          {/* Hero Left — Text Content */}
          <div className="hero-left">
            <div className="hero-top-badge">
              <Scale size={16} />
              <span>India's Trusted Legal Consultation Platform</span>
            </div>

            <h1 className="hero-title">
              INSTANT LEGAL<br />
              CONSULTATION WITH<br />
              <span className="highlight-lavender">VERIFIED ADVOCATES</span><br />
              ACROSS INDIA
            </h1>
            
            <p className="hero-subtitle">
              Connect with experienced lawyers for online consultation, case guidance, and legal support from the comfort of your home.
            </p>
            
            <div className="hero-actions">
              <Link to="/register?type=customer" className="btn-primary-purple">
                Speak to a Lawyer <ArrowRight size={18} />
              </Link>
              <Link to="/how-it-works" className="btn-outline-hero">
                How It Works
              </Link>
            </div>
            
            <div className="trust-pills-row">
              <div className="trust-pill"><ShieldCheck size={16} /> Verified Advocates</div>
              <div className="trust-pill"><Lock size={16} /> Secure & Private</div>
              <div className="trust-pill"><Zap size={16} /> Quick Response</div>
              <div className="trust-pill"><CreditCard size={16} /> Affordable Fees</div>
            </div>
          </div>
          
          {/* Hero Right — intentionally empty so the BG image (scales & gavel) shows through */}
          <div className="hero-right-spacer" />
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

      {/* 3. FIND SPECIALIZED ADVOCATES SECTION */}
      <section className="categories-section-purple">
        <div className="section-title-wrapper">
          <h2>FIND SPECIALIZED ADVOCATES</h2>
          <p className="section-subtitle">Choose from expert advocates in every legal field</p>
        </div>
        
        <div className="categories-grid-mockup">
          {categories.map((cat, index) => (
            <div 
              key={index} 
              className="category-card-mockup"
              onClick={() => navigate('/find-lawyer')}
            >
              <div className="category-icon-purple">
                {cat.icon}
              </div>
              <h4>{cat.name}</h4>
              <p>{cat.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center-btn">
          <Link to="/find-lawyer" className="btn-solid-purple">
            View All Categories
          </Link>
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

      {/* 5. CLIENT SUCCESS STORIES */}
      <section className="testimonials-section-purple">
        <div className="section-title-wrapper">
          <h2>CLIENT SUCCESS STORIES</h2>
          <p className="section-subtitle">Real people. Real solutions.</p>
        </div>
        
        <div className="testimonials-grid-mockup">
          <div className="testimonial-card-mockup">
            <span className="quote-mark">“</span>
            <div className="stars-row">
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
            </div>
            <p className="testimonial-text">"Adalat helped me connect with a great lawyer for my property dispute. The advice was clear and saved me a lot of time and money."</p>
            <div className="client-info">
              <strong>Sahil Sharma</strong>
              <span>Property Dispute</span>
            </div>
          </div>
          
          <div className="testimonial-card-mockup">
            <span className="quote-mark">“</span>
            <div className="stars-row">
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
            </div>
            <p className="testimonial-text">"Very quick response and professional lawyers. I got the right guidance for my divorce case and the process became much easier."</p>
            <div className="client-info">
              <strong>Neha Verma</strong>
              <span>Family Law</span>
            </div>
          </div>
          
          <div className="testimonial-card-mockup">
            <span className="quote-mark">“</span>
            <div className="stars-row">
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
              <Star size={14} fill="#5C5C99" color="#5C5C99" />
            </div>
            <p className="testimonial-text">"Excellent platform! The lawyer understood my issue and guided me step by step. Highly recommend Adalat for legal help."</p>
            <div className="client-info">
              <strong>Amit Kumar</strong>
              <span>Criminal Case</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. READY TO GET LEGAL GUIDANCE BANNER (Below Client Success Stories) */}
      <section className="cta-rounded-section">
        <div className="cta-rounded-card">
          <video 
            className="cta-video-bg" 
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="cta-card-overlay" />
          <div className="cta-card-content">
            <h2 className="cta-card-title">READY TO GET LEGAL GUIDANCE?</h2>
            <p className="cta-card-subtitle">Join thousands of people who've resolved their legal issues with Adalat.</p>
            <div className="cta-card-buttons">
              <Link to="/register?type=customer" className="btn-cta-white-pill">
                Talk to a Lawyer Now <ArrowRight size={18} />
              </Link>
              <Link to="/register?type=lawyer" className="btn-cta-outline-pill">
                For Advocates: Join Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
