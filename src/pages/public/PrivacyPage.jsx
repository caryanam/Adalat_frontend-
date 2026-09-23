import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  FileText, 
  Database, 
  Mail, 
  MapPin, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'collection',
      icon: Database,
      title: '1. Information We Collect',
      content: (
        <>
          <p className="mb-3 text-slate-600">
            To provide transparent and secure legal consultation services, Adalat (operated by <strong>Caryanamindia Pvt Ltd</strong>) collects the following categories of information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Personal Identity:</strong> Full name, verified mobile number, email address, and state/city of residence.</li>
            <li><strong>Advocate KYC Details:</strong> Bar Council registration number, state bar council enrollment certificate, academic degrees, and identity proofs.</li>
            <li><strong>Case & Consultation Context:</strong> Legal descriptions, case categories, questions submitted to AI triage, and shared documents.</li>
            <li><strong>Transactional Data:</strong> Payment order IDs, transaction timestamps, and invoice records (payment card/UPI details are handled exclusively by RBI-authorized payment gateways).</li>
          </ul>
        </>
      )
    },
    {
      id: 'usage',
      icon: FileText,
      title: '2. How We Use Your Data',
      content: (
        <>
          <p className="mb-3 text-slate-600">We strictly utilize gathered data for operational purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Facilitating scheduled chat, audio, and video consultations between clients and verified advocates.</li>
            <li>Powering AI-driven legal category mapping and statutory reference retrieval.</li>
            <li>Verifying the authentic professional status of practicing advocates.</li>
            <li>Generating invoices and managing dispute resolutions.</li>
            <li>We <strong>never sell, lease, or monetize</strong> personal data to external marketing agencies or advertisers.</li>
          </ul>
        </>
      )
    },
    {
      id: 'confidentiality',
      icon: Lock,
      title: '3. Advocate-Client Privilege & Security',
      content: (
        <>
          <p className="mb-3 text-slate-600">
            All direct communications between clients and advocates conducted on the Adalat platform are subject to <strong>Advocate-Client Confidentiality</strong> under the Indian Evidence Act:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <ShieldCheck size={16} />
              <span>256-Bit SSL Transport Layer Security</span>
            </div>
            <p>
              Data in transit is encrypted using modern TLS protocols. Case documents uploaded to secure vaults remain accessible only to the active client and the assigned consulting advocate.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'third-parties',
      icon: EyeOff,
      title: '4. Third-Party Integrations',
      content: (
        <p className="text-slate-600">
          We partner with leading infrastructure providers (cloud hosting, SMS OTP gateways, and RBI-regulated payment aggregators) under strict confidentiality agreements. These vendors are granted access solely to execute essential transaction infrastructure and cannot utilize your data for independent purposes.
        </p>
      )
    },
    {
      id: 'user-rights',
      icon: ShieldCheck,
      title: '5. Your Rights & Data Erasure',
      content: (
        <p className="text-slate-600">
          Under applicable Indian data protection laws, you reserve the right to access your stored consultation records, correct inaccuracies, or request the closure of your account and purge of uploaded case files by submitting a verification request to our compliance team.
        </p>
      )
    },
    {
      id: 'grievance',
      icon: Mail,
      title: '6. Grievance Redressal & Contact',
      content: (
        <div className="space-y-3">
          <p className="text-slate-600">
            For privacy inquiries, data access requests, or grievance escalations, you may contact our designated Grievance Officer:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
            <div className="font-semibold text-slate-900">Grievance Officer — Caryanamindia Pvt Ltd</div>
            <div>Email: <a href="mailto:support@adalat.legal" className="text-indigo-600 font-medium hover:underline">support@adalat.legal</a></div>
            <div>Phone: <a href="tel:+919898989898" className="text-emerald-600 font-medium hover:underline">+91 9898989898</a></div>
            <div>Location: Pune, Maharashtra, India</div>
          </div>
        </div>
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
            <span>Data Privacy & Confidentiality</span>
          </div>

          <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Effective Date: March 2026 • Operated by Caryanamindia Pvt Ltd, Pune, India
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-14 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Quick summary alert */}
        <div className="mb-10 p-5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3.5 text-xs sm:text-sm text-indigo-950 shadow-xs">
          <AlertCircle size={20} className="text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-indigo-900 block mb-1">Your Privacy is Sacred:</strong>
            Adalat is committed to safeguarding attorney-client privilege. We never sell your personal data or case documents to any external party.
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div 
                key={sec.id}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                    <Icon size={18} />
                  </div>
                  <h2 className="font-['Cinzel',serif] text-lg sm:text-xl font-bold text-slate-900">
                    {sec.title}
                  </h2>
                </div>

                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-0 sm:pl-12">
                  {sec.content}
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
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/refund-policy" className="hover:text-slate-900 transition-colors">Refund Policy</Link>
          </div>
        </div>

      </section>

    </div>
  );
};

export default PrivacyPage;
