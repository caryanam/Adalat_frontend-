import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  Bot, 
  ArrowRight, 
  UserCheck, 
  CheckCircle2, 
  ChevronDown, 
  HelpCircle,
  Scale,
  Sparkles,
  Lock,
  MessageSquare
} from 'lucide-react';

const HowItWorksPage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    {
      num: "01",
      icon: UserCheck,
      title: "Register & Verify",
      subtitle: "One-Time ₹99 Access",
      desc: "Create your secure account with basic details and mobile OTP. The nominal verification fee keeps our legal network spam-free and high-trust.",
      accent: "text-indigo-600",
      bgAccent: "bg-indigo-50 border-indigo-200"
    },
    {
      num: "02",
      icon: Bot,
      title: "AI Legal Assistance",
      subtitle: "Instant 24/7 Guidance",
      desc: "Describe your query or dispute in simple words. Our legal AI assistant analyzes applicable Indian laws and recommends the exact practice category.",
      accent: "text-amber-600",
      bgAccent: "bg-amber-50 border-amber-200"
    },
    {
      num: "03",
      icon: MessageSquare,
      title: "10-Min Free First Chat",
      subtitle: "Zero Risk Dialogue",
      desc: "Browse verified advocates matching your jurisdiction and start a 10-minute complimentary chat to gauge compatibility before paying.",
      accent: "text-emerald-600",
      bgAccent: "bg-emerald-50 border-emerald-200"
    },
    {
      num: "04",
      icon: ShieldCheck,
      title: "Book & Consult",
      subtitle: "Secure Payment & Vault",
      desc: "Schedule paid consultations at transparent advocate fees. Conduct private text, voice, or video calls with end-to-end encrypted document sharing.",
      accent: "text-purple-600",
      bgAccent: "bg-purple-50 border-purple-200"
    }
  ];

  const faqs = [
    {
      q: "Why is there a ₹99 registration fee?",
      a: "The nominal ₹99 fee filters out bot traffic and ensures our Bar Council verified advocates dedicate their valuable time only to genuine citizens with real legal needs."
    },
    {
      q: "How does the 10-Minute Free Chat work?",
      a: "When you first connect with any advocate, the first 10 minutes of text conversation are 100% complimentary. This allows you to explain your issue and confirm compatibility before booking paid consultation time."
    },
    {
      q: "Are the lawyers on Adalat verified and genuine?",
      a: "Yes. Every advocate must submit their State Bar Council enrollment number, identity credentials, and proof of active practice before being approved to consult on the platform."
    },
    {
      q: "Is my case data and conversation private?",
      a: "Absolutely. All messages, calls, and uploaded legal documents are protected with 256-bit SSL encryption. Communications are covered under legal client-attorney privilege."
    },
    {
      q: "What if the advocate misses the scheduled consultation?",
      a: "If an advocate is unavailable for a confirmed appointment, you are entitled to a full 100% refund of the consultation fee or the option to reschedule with another top-rated advocate."
    },
    {
      q: "Can I consult advocates outside my city or state?",
      a: "Yes. You can consult specialized High Court, Supreme Court, or specific jurisdictional advocates from anywhere in India via secure online chat and video calls."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Outfit',sans-serif] selection:bg-amber-500 selection:text-slate-950">
      
      {/* Hero Header */}
      <section className="relative pt-20 pb-14 md:pt-28 md:pb-20 overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-slate-50 border-b border-slate-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-bold tracking-wider uppercase text-amber-800 shadow-xs mb-5">
            <Sparkles size={13} className="text-amber-600" />
            <span>Simple, Transparent & Secure</span>
          </div>

          <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-5 leading-tight">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800">Adalat Works</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From preliminary AI analysis to private consultations with certified Bar Council advocates — discover your transparent path to legal care in 4 simple steps.
          </p>

          {/* Quick Metrics */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="text-2xl font-bold text-slate-900 font-['Cinzel',serif]">₹99</div>
              <div className="text-xs text-slate-500 mt-0.5">One-time registration</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="text-2xl font-bold text-emerald-600 font-['Cinzel',serif]">10 Mins</div>
              <div className="text-xs text-slate-500 mt-0.5">Free initial chat</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="text-2xl font-bold text-indigo-600 font-['Cinzel',serif]">100%</div>
              <div className="text-xs text-slate-500 mt-0.5">Bar verified advocates</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="text-2xl font-bold text-amber-600 font-['Cinzel',serif]">256-Bit</div>
              <div className="text-xs text-slate-500 mt-0.5">Encrypted privilege</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Journey Section */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-['Cinzel',serif] text-2xl sm:text-4xl font-bold text-slate-900 mb-3">
            Your 4-Step Legal Journey
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A seamless digital experience designed to protect your privacy and guarantee top-tier legal advice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="group relative p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 hover:border-amber-400/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-['Cinzel',serif] text-3xl font-bold text-slate-300 group-hover:text-amber-500/60 transition-colors">
                      {step.num}
                    </span>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.bgAccent} ${step.accent}`}>
                      <Icon size={24} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-['Cinzel',serif] text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {step.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                  <CheckCircle2 size={14} className={step.accent} />
                  <span>Step {idx + 1} Verified Protocol</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Highlights Strip */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mx-auto md:mx-0">
                <Scale size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-['Cinzel',serif]">Complete Practice Coverage</h4>
                <p className="text-xs text-slate-600 mt-1">Criminal, Civil, Family, Property, Cybercrime, Corporate & Labour laws.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mx-auto md:mx-0">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-['Cinzel',serif]">Encrypted Client Confidentiality</h4>
                <p className="text-xs text-slate-600 mt-1">Protected by Advocate-Client privilege with end-to-end encrypted chats & files.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mx-auto md:mx-0">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-['Cinzel',serif]">Flexible Consultation Modes</h4>
                <p className="text-xs text-slate-600 mt-1">Consult on your terms via private text chat, audio calls, or high-definition video.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-indigo-700 mb-3">
            <HelpCircle size={13} />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-['Cinzel',serif] text-2xl sm:text-4xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Clear answers to common questions about using the Adalat platform.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-xl bg-white border border-slate-200 overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600' : ''}`} 
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl bg-slate-900 text-white border border-slate-800 p-8 sm:p-12 text-center overflow-hidden shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Connect with a Verified Advocate?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Join citizens across India finding trusted, transparent, and affordable legal consultations today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-md hover:scale-[1.02]"
            >
              <span>Register as Client (₹99)</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm transition-all"
            >
              <span>Find an Advocate</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HowItWorksPage;
