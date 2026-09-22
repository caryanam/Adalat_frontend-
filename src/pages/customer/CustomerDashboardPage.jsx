import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import CustomerHeader from '../../components/CustomerHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  Scale, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Bot,
  Send,
  Zap,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations] = useState([]);
  const [aiQuickQuery, setAiQuickQuery] = useState('');

  const handleQuickAiSubmit = (e) => {
    e.preventDefault();
    if (aiQuickQuery.trim()) {
      navigate(`/customer/legal-assistant?query=${encodeURIComponent(aiQuickQuery.trim())}`);
    } else {
      navigate('/customer/legal-assistant');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="customer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <CustomerHeader 
          title={`Welcome back, ${user?.fullName || 'Customer'}`}
          subtitle="Manage your active legal consultations, booked appointments, and verified payment history."
          badge={{ text: "Account Active (₹99 Lifetime)", variant: "success", icon: ShieldCheck }}
          actions={
            <Link
              to="/customer/find-lawyers"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-sm transition-all duration-150 active:scale-95 shrink-0"
            >
              <Scale size={14} />
              <span>Book Advocate</span>
            </Link>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">

        {/* HERO LEGAL AI QUICK ACTION BANNER */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0b0f19] via-[#111827] to-[#1e1b4b] border border-slate-800/80 p-6 sm:p-8 shadow-xl text-white overflow-hidden">
          {/* Subtle Ambient Glow Effect */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                <Sparkles size={12} className="text-amber-400" />
                <span>24/7 AI Legal Companion & Procedural Roadmap</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
                Have a legal question or received a notice?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Ask our AI assistant to analyze procedural steps under Indian Law (BNS & IPC), or connect with a Bar Council verified advocate for a 10-minute free session.
              </p>
            </div>

            {/* Quick AI Search Form */}
            <form 
              onSubmit={handleQuickAiSubmit}
              className="w-full lg:w-96 flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all shadow-inner"
            >
              <Bot size={20} className="text-indigo-400 ml-2.5 shrink-0" />
              <input 
                type="text"
                value={aiQuickQuery}
                onChange={(e) => setAiQuickQuery(e.target.value)}
                placeholder="Ask legal question (e.g. rent dispute)..."
                className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none px-2 py-2"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <span>Ask</span>
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>

        {/* Overview Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Active Consultations */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Consultations
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {consultations.length} Active
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                <span>Live sessions</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <MessageSquare size={22} />
            </div>
          </div>

          {/* Card 2: Upcoming Appointments */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Appointments
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                0 Upcoming
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium pt-0.5">
                <Clock size={12} className="text-amber-500" />
                <span>Court & Advisory</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200 shadow-xs">
              <Calendar size={22} />
            </div>
          </div>

          {/* Card 3: Registration Paid */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Registration Paid
              </p>
              <h3 className="text-2xl font-bold text-emerald-700 tracking-tight">
                ₹99.00
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium pt-0.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Lifetime Access</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <CreditCard size={22} />
            </div>
          </div>

          {/* Card 4: Verified Advocates */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Top Advocates
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Verified
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-purple-600 font-medium pt-0.5">
                <Sparkles size={12} className="text-purple-500" />
                <span>Bar Council verified</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <Scale size={22} />
            </div>
          </div>
        </div>

        {/* Recent Consultations Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <MessageSquare size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Active & Recent Consultations
                </h3>
                <p className="text-xs text-slate-400">
                  Your ongoing and completed advocate conversations
                </p>
              </div>
            </div>

            <Link
              to="/customer/consultations"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            {consultations.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={MessageSquare}
                  title="No Active Consultations"
                  message="Visit the Find Advocates tab to book your direct consultation."
                  buttonText="Find Advocates"
                  buttonLink="/customer/find-lawyers"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/60 font-semibold">
                      <th className="py-3 px-4 rounded-l-lg">Advocate</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Rate</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consultations.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/80 transition-colors duration-150"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                              {c.lawyerName ? c.lawyerName.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <span>{c.lawyerName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {c.rate}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/customer/consultations?lawyerId=${c.lawyerId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-all duration-150"
                          >
                            <MessageSquare size={13} />
                            <span>Chat (10m Free)</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboardPage;
