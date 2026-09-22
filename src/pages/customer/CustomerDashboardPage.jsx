import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import CustomerHeader from '../../components/CustomerHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { MessageSquare, Calendar, CreditCard, Scale, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CustomerDashboardPage.css';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [consultations] = useState([]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 overflow-x-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="customer" />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen relative">
        <CustomerHeader 
          title={`Welcome back, ${user?.fullName || 'Customer'}`}
          subtitle="Manage your active legal consultations, booked appointments, and verified payment history."
          badge={{ text: "Account Active (₹99 Paid)", variant: "success", icon: ShieldCheck }}
          actions={
            <Link
              to="/customer/find-lawyers"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-all duration-150 active:scale-95 shrink-0"
            >
              <Scale size={14} />
              <span>Book Advocate</span>
            </Link>
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6">

        {/* Overview Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Active Consultations */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Consultations
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {consultations.length} Active
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Live sessions</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <MessageSquare size={22} />
            </div>
          </div>

          {/* Card 2: Upcoming Appointments */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Appointments
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                0 Upcoming
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Court & Advisory</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200 shadow-xs">
              <Calendar size={22} />
            </div>
          </div>

          {/* Card 3: Registration Paid */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
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
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
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

        {/* Quick Action Legal Advice Prompt Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#101828] via-[#1E293B] to-[#0F172A] border border-indigo-900/50 p-6 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-500" />

          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Scale size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                Need Legal Advice Right Now?
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Instant Access
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Connect with top verified advocates across India for court litigation, legal advisory, and consultation with 10-minute free chat.
              </p>
            </div>
          </div>

          <Link
            to="/find-lawyers"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all duration-200 active:scale-95 shrink-0"
          >
            <span>Find Advocates</span>
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Recent Consultations Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
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
                  buttonLink="/find-lawyers"
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
