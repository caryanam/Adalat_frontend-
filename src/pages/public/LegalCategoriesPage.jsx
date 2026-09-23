import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  Users, 
  Home, 
  FileText, 
  ShoppingCart, 
  ShieldAlert, 
  Briefcase, 
  Landmark, 
  Car, 
  HeartHandshake, 
  ArrowRight,
  Search,
  CheckCircle2,
  Sparkles,
  Bot
} from 'lucide-react';

const LegalCategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { 
      id: 'CRIMINAL_LAW', 
      name: 'Criminal Law', 
      icon: Scale, 
      count: '120+ Advocates', 
      desc: 'Expert representation for anticipatory bail, regular bail, FIR quashing, cybercrime FIRs, trial defense, and criminal appeals.',
      tags: ['Bail Matters', 'FIR Quashing', 'Trial Defense', 'Appeals'],
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200'
    },
    { 
      id: 'FAMILY_LAW', 
      name: 'Divorce & Family Law', 
      icon: HeartHandshake, 
      count: '150+ Advocates', 
      desc: 'Compassionate counsel for mutual & contested divorce, child custody, alimony & maintenance, 498A defense, and domestic violence.',
      tags: ['Mutual Divorce', 'Child Custody', 'Alimony', '498A / DV'],
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 border-rose-200'
    },
    { 
      id: 'PROPERTY_LAW', 
      name: 'Property & Real Estate', 
      icon: Home, 
      count: '200+ Advocates', 
      desc: 'Comprehensive advice on property title verification, partition suits, builder-buyer disputes (RERA), illegal possession, and registration.',
      tags: ['RERA Disputes', 'Title Search', 'Partition Suits', 'Tenant Issues'],
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200'
    },
    { 
      id: 'CIVIL_DISPUTES', 
      name: 'Civil Litigation & Contracts', 
      icon: FileText, 
      count: '180+ Advocates', 
      desc: 'Strategic litigation for money recovery suits, breach of contract, specific performance, permanent injunctions, and execution petitions.',
      tags: ['Money Recovery', 'Contract Breach', 'Injunctions', 'Writ Petitions'],
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-200'
    },
    { 
      id: 'CONSUMER_LAW', 
      name: 'Consumer Protection', 
      icon: ShoppingCart, 
      count: '90+ Advocates', 
      desc: 'Advocacy in District, State & National Consumer Forums (NCDRC) for deficient services, defective products, and insurance claim rejections.',
      tags: ['NCDRC Claims', 'Insurance Denials', 'Defective Goods', 'Builder Delay'],
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 border-purple-200'
    },
    { 
      id: 'CYBERCRIME', 
      name: 'Cybercrime & IT Law', 
      icon: ShieldAlert, 
      count: '60+ Advocates', 
      desc: 'Specialized legal assistance for online financial fraud, identity theft, unauthorized data breaches, cyber stalking, and IT Act litigation.',
      tags: ['Financial Fraud', 'Data Theft', 'IT Act 66D', 'Cyber Stalking'],
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50 border-red-200'
    },
    { 
      id: 'EMPLOYMENT_LAW', 
      name: 'Employment & Labour', 
      icon: Users, 
      count: '85+ Advocates', 
      desc: 'Representation for wrongful termination, POSH compliance, non-payment of gratuity/PF, employment contracts, and non-compete clauses.',
      tags: ['Wrongful Dismissal', 'POSH Cases', 'Gratuity & PF', 'Severance'],
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50 border-teal-200'
    },
    { 
      id: 'CORPORATE_LAW', 
      name: 'Corporate & Commercial', 
      icon: Briefcase, 
      count: '110+ Advocates', 
      desc: 'Advisory for startup incorporation, founder agreements, shareholder disputes, NCLT / insolvency proceedings, and trademark protection.',
      tags: ['NCLT / IBC', 'Shareholder Deals', 'Trademarks', 'Compliance'],
      iconColor: 'text-amber-700',
      iconBg: 'bg-amber-50 border-amber-200'
    },
    { 
      id: 'BANKING', 
      name: 'Banking & Debt Recovery', 
      icon: Landmark, 
      count: '75+ Advocates', 
      desc: 'Defense and representation for Section 138 NI Act (Cheque Bounce), SARFAESI Act notices, DRT proceedings, and loan settlement negotiation.',
      tags: ['Sec 138 Cheque Bounce', 'DRT & SARFAESI', 'Loan Settlement', 'CIBIL Dispute'],
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50 border-cyan-200'
    },
    { 
      id: 'MOTOR_VEHICLE', 
      name: 'Motor Accident Claims (MACT)', 
      icon: Car, 
      count: '130+ Advocates', 
      desc: 'High-success legal claims for road accident compensation in MACT tribunals, insurance contestations, vehicle damages, and traffic offenses.',
      tags: ['MACT Claims', 'Third Party Damage', 'Death Compensation', 'Insurance Dispute'],
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-200'
    }
  ];

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Outfit',sans-serif] selection:bg-amber-500 selection:text-slate-950">
      
      {/* Hero Header */}
      <section className="relative pt-20 pb-14 md:pt-28 md:pb-20 overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-slate-50 border-b border-slate-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-bold tracking-wider uppercase text-amber-800 shadow-xs mb-5">
            <Sparkles size={13} className="text-amber-600" />
            <span>Specialized Legal Practice Areas</span>
          </div>

          <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-5 leading-tight">
            Find Legal Experts by <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800">Practice Area</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Consult specialized, Bar Council enrolled advocates possessing deep courtroom and advisory experience in your exact domain.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by issue (e.g., Bail, Divorce, RERA, Cheque Bounce)..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-14 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-['Cinzel',serif] text-2xl font-bold text-slate-900">
              Available Legal Domains ({filteredCategories.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select any category to view verified advocates and book instant consultations.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <span>Browse All Advocates</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm mb-4">No legal categories matched "{searchTerm}".</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-amber-700 hover:bg-slate-200"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="group relative rounded-2xl p-6 bg-white border border-slate-200 hover:border-amber-400/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Icon & Count */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${cat.iconBg} ${cat.iconColor} group-hover:scale-105 transition-transform`}>
                        <Icon size={24} />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                        {cat.count}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <h3 className="font-['Cinzel',serif] text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {cat.desc}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {cat.tags.map((tag, tIdx) => (
                        <span 
                          key={tIdx} 
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">10m Free Chat Available</span>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:text-amber-800 transition-colors"
                    >
                      <span>Find Lawyers</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom AI & Guidance Box */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl bg-slate-900 text-white border border-slate-800 p-8 sm:p-10 text-center overflow-hidden shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-4">
            <Bot size={14} />
            <span>Unsure Which Category You Need?</span>
          </div>

          <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-bold text-white mb-3">
            Let Our Legal AI Guide You
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
            Explain your situation in plain words. Our AI assistant will analyze your legal facts and recommend the most suitable advocate category in seconds.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md hover:scale-[1.02]"
          >
            <span>Start Free Consultation</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default LegalCategoriesPage;
