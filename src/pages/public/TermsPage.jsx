import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  Bot, 
  Gavel, 
  Sparkles 
} from 'lucide-react';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const terms = [
    {
      id: 'platform-nature',
      icon: Scale,
      title: '1. Platform Nature & Intermediary Status',
      content: (
        <>
          <p className="mb-2 text-slate-600">
            <strong>Adalat</strong> is an online technology intermediary platform owned and operated by <strong>Caryanamindia Pvt Ltd</strong>. Adalat is <strong>not a law firm</strong> and does not directly provide legal representation, litigation advocacy, or legal opinions.
          </p>
          <p className="text-slate-600">
            The platform functions as a digital meeting ground connecting citizens with independent, verified advocates registered with respective State Bar Councils across India.
          </p>
        </>
      )
    },
    {
      id: 'registration',
      icon: ShieldCheck,
      title: '2. User Registration & ₹99 Access Fee',
      content: (
        <>
          <p className="mb-2 text-slate-600">
            To access advocate booking, encrypted chat vaults, and consultation features, users must complete account registration and phone OTP verification.
          </p>
          <p className="text-slate-600">
            A non-refundable registration fee of <strong>₹99 (inclusive of applicable taxes)</strong> is charged at the time of client registration to maintain a high-trust, spam-free legal ecosystem.
          </p>
        </>
      )
    },
    {
      id: 'consultations',
      icon: CreditCard,
      title: '3. Consultation Structure & 10-Min Free Chat',
      content: (
        <>
          <p className="mb-2 text-slate-600">
            Every user is entitled to a <strong>10-minute complimentary text chat</strong> when initiating conversation with any participating advocate on the platform.
          </p>
          <p className="text-slate-600">
            Subsequent detailed consultations (extended chat, audio, or video calls) are priced transparently based on the individual advocate's stated professional fee schedule.
          </p>
        </>
      )
    },
    {
      id: 'ai-disclaimer',
      icon: Bot,
      title: '4. AI Intelligence Disclaimer',
      content: (
        <>
          <p className="mb-2 text-slate-600">
            The Adalat AI Assistant is designed purely for educational and preliminary informational triage. It helps summarize factual matters and identify legal practice categories.
          </p>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Important:</strong> AI outputs do not constitute formal legal counsel and do not establish an advocate-client relationship. Always consult a verified advocate for actionable legal representation.
          </div>
        </>
      )
    },
    {
      id: 'advocate-conduct',
      icon: Gavel,
      title: '5. Advocate Conduct & Professional Independence',
      content: (
        <p className="text-slate-600">
          All participating advocates act independently and are bound by the Bar Council of India (BCI) rules of professional ethics. Adalat does not interfere with the professional judgement, case strategy, or legal opinions rendered by consulting advocates.
        </p>
      )
    },
    {
      id: 'liability',
      icon: AlertTriangle,
      title: '6. Limitation of Liability',
      content: (
        <p className="text-slate-600">
          Caryanamindia Pvt Ltd and its directors, officers, and employees shall not be held liable for any indirect, incidental, or consequential damages resulting from advice provided by independent advocates, technical downtime, or user breach of these Terms.
        </p>
      )
    },
    {
      id: 'jurisdiction',
      icon: Scale,
      title: '7. Governing Law & Jurisdiction',
      content: (
        <p className="text-slate-600">
          These Terms of Service are governed by and construed in accordance with the laws of India. Any legal disputes or claims arising out of the use of the platform shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Pune, Maharashtra, India</strong>.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Outfit',sans-serif] selection:bg-amber-500 selection:text-slate-950">
      
      {/* Hero Header */}
      <section className="relative pt-20 pb-14 md:pt-28 md:pb-20 overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-slate-50 border-b border-slate-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-bold tracking-wider uppercase text-amber-800 shadow-xs mb-5">
            <Sparkles size={13} className="text-amber-600" />
            <span>Legal Framework & Terms</span>
          </div>

          <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Terms of Service
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Last Updated: March 2026 • Governing Caryanamindia Pvt Ltd & Adalat Platform
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-14 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="space-y-6">
          {terms.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                    <Icon size={18} />
                  </div>
                  <h2 className="font-['Cinzel',serif] text-lg sm:text-xl font-bold text-slate-900">
                    {item.title}
                  </h2>
                </div>

                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-0 sm:pl-12">
                  {item.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Home / Portal links */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <Link to="/" className="text-amber-700 hover:text-amber-800 font-bold inline-flex items-center gap-1.5">
            <span>← Return to Home</span>
          </Link>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/refund-policy" className="hover:text-slate-900 transition-colors">Refund Policy</Link>
          </div>
        </div>

      </section>

    </div>
  );
};

export default TermsPage;
