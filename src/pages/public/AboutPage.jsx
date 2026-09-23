import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  Zap, 
  MapPin, 
  Mail, 
  Phone, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Globe2,
  Sparkles,
  Building2
} from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { value: '500+', label: 'Verified Advocates', sub: 'Enrolled with State Bar Councils' },
    { value: '10,000+', label: 'Consultations', sub: 'Across civil, criminal & corporate' },
    { value: '28+', label: 'States & UTs Covered', sub: 'Pan-India legal presence' },
    { value: '4.9/5', label: 'Client Trust Rating', sub: 'Based on verified reviews' }
  ];

  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Rigorous Advocate Verification',
      desc: 'Every legal practitioner on Adalat undergoes strict Bar Council enrollment verification, certificate audits, and credential screening before taking client calls.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-200'
    },
    {
      icon: Lock,
      title: 'Confidential & Encrypted',
      desc: 'All consultations, case summaries, and shared case files are safeguarded with 256-bit SSL encryption under strict attorney-client privilege.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200'
    },
    {
      icon: Zap,
      title: 'AI-Powered Triage',
      desc: 'Our proprietary legal intelligence tool simplifies complex Indian statutes, helping citizens understand their rights before stepping into a consultation.',
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200'
    },
    {
      icon: Globe2,
      title: 'Pan-India Accessibility',
      desc: 'Bridging the geographic barrier by connecting citizens in tier-2 and tier-3 cities with high court and supreme court specialized advocates.',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 border-cyan-200'
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
            <span>Our Mission & Vision</span>
          </div>

          <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-5 leading-tight">
            Democratizing Legal Care <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800">Across India</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Adalat bridges the divide between citizens and qualified legal advocates through transparent pricing, verified credentials, and innovative digital intelligence.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-['Cinzel',serif] text-2xl sm:text-4xl font-bold text-amber-700 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Story Narrative */}
      <section className="py-14 md:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <Scale size={15} />
              <span>The Adalat Story</span>
            </div>
            
            <h2 className="font-['Cinzel',serif] text-2xl sm:text-4xl font-bold text-slate-900 leading-snug">
              Transforming How Everyday Citizens Access Justice
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Navigating India's legal landscape has traditionally been complex, intimidating, and opaque. Everyday citizens often face uncertainty about where to turn, how much legal services cost, and whether their advocate has the right specialized experience.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              <strong>Adalat</strong> was built to solve this challenge. By introducing transparent upfront consultations, verified Bar Council registrations, free introductory dialogues, and smart AI assistance, we empower citizens to make informed, confident legal choices.
            </p>

            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Zero hidden charges — transparent consultation rates</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Verified credentials with State Bar Councils across India</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Strict adherence to Advocate-Client confidentiality</span>
              </div>
            </div>
          </div>

          {/* Company Identity Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-['Cinzel',serif] text-base font-bold text-slate-900">
                    Caryanamindia Pvt Ltd
                  </h3>
                  <p className="text-xs text-slate-500">Parent Organization</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-5">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Corporate Location:</span>
                    <p className="text-slate-600">Pune, Maharashtra, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Direct Support:</span>
                    <p className="text-slate-600">
                      <a href="mailto:support@adalat.legal" className="hover:text-indigo-600 transition-colors">
                        support@adalat.legal
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Helpdesk:</span>
                    <p className="text-slate-600">
                      <a href="tel:+919898989898" className="hover:text-emerald-600 transition-colors">
                        +91 9898989898
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                Adalat is a digital technology platform connecting users with certified legal advocates.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-['Cinzel',serif] text-2xl sm:text-4xl font-bold text-slate-900 mb-2">
              Built on Trust & Integrity
            </h2>
            <p className="text-sm text-slate-600">
              The guiding principles that ensure high legal standards and data confidentiality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400/80 transition-all duration-300 hover:-translate-y-1 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${item.bg} ${item.color}`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="font-['Cinzel',serif] text-base font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl bg-slate-900 text-white border border-slate-800 p-8 sm:p-12 text-center overflow-hidden shadow-xl">
          <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-bold text-white mb-4">
            Begin Your Legal Journey with Adalat
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Get instant legal clarity or enroll your legal practice into India's fastest-growing advocate network.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-md hover:scale-[1.02]"
            >
              <span>Client Registration (₹99)</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/lawyer/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm transition-all"
            >
              <span>Advocate Enrollment</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
