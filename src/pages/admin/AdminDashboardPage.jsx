import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { lawyerApi } from '../../api/lawyerApi';
import apiClient from '../../api/apiClient';
import { 
  Users, UserCheck, ShieldCheck, CreditCard, 
  ChevronRight, ArrowRight, Award, CheckCircle2,
  RefreshCw, Sparkles
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [pendingLawyers, setPendingLawyers] = useState([]);
  const [approvedLawyers, setApprovedLawyers] = useState([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(() => {
    setLoading(true);
    Promise.all([
      adminApi.getPendingLawyers().catch(() => ({ data: [] })),
      lawyerApi.getApprovedLawyers().catch(() => ({ data: [] })),
      apiClient.get('/api/admin/payments').catch(() => ({ data: [] }))
    ]).then(([pendingRes, approvedRes, paymentsRes]) => {
      setPendingLawyers((pendingRes && Array.isArray(pendingRes.data)) ? pendingRes.data : []);
      setApprovedLawyers((approvedRes && Array.isArray(approvedRes.data)) ? approvedRes.data : []);
      
      const payments = (paymentsRes && Array.isArray(paymentsRes.data)) ? paymentsRes.data : [];
      const sum = payments.reduce((acc, p) => acc + (p.amountNum || 0), 0);
      setTotalVolume(sum);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalLawyers = approvedLawyers.length + pendingLawyers.length;

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="admin" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <AdminHeader 
          title="Admin Command Center"
          subtitle="Platform overview, advocate verification pipeline, and financial telemetry."
          badge={{
            text: `${pendingLawyers.length} Pending Review`,
            variant: pendingLawyers.length > 0 ? 'amber' : 'emerald',
            icon: pendingLawyers.length > 0 ? UserCheck : ShieldCheck
          }}
          actions={
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh telemetry"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Executive Command Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0b0f19] via-[#111827] to-[#1e1b4b] text-white p-5 sm:p-7 shadow-xl border border-slate-800/80">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/4 top-0 w-40 h-40 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-2xs">
                    <ShieldCheck size={13} className="text-purple-400" />
                    <span>Adalat Platform Administration</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse ml-0.5" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white/10 text-slate-300 border border-white/15 backdrop-blur-xs">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Live Audit Sync</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white mb-1.5 font-['Outfit',sans-serif]">
                  Admin Command Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Complete platform overview • Advocate verification queue, transaction audits, and jurisdiction analytics.
                </p>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <Link
                  to="/admin/payments"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-xs transition-all duration-150 active:scale-95 backdrop-blur-xs"
                >
                  <CreditCard size={14} />
                  <span>Payment Audit</span>
                </Link>
                <Link
                  to="/admin/verifications"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all duration-150 active:scale-95"
                >
                  <UserCheck size={14} />
                  <span>Review Queue ({pendingLawyers.length})</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Overview Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Total Registered Advocates */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Registered Advocates
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {totalLawyers}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-semibold pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  <span>Total Onboarded</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                <Users size={22} />
              </div>
            </div>

            {/* Card 2: Approved Lawyers */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Approved Lawyers
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight font-mono">
                  {approvedLawyers.length}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold pt-0.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>Active &amp; Verified</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                <ShieldCheck size={22} />
              </div>
            </div>

            {/* Card 3: Pending Approvals */}
            <div className={`group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between ${
              pendingLawyers.length > 0 ? 'border-amber-300/90 bg-gradient-to-br from-amber-50/40 via-white to-white' : 'border-slate-200/90'
            }`}>
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pending Approvals
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight font-mono">
                  {pendingLawyers.length}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold pt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full bg-amber-500 ${pendingLawyers.length > 0 ? 'animate-pulse' : ''}`} />
                  <span>{pendingLawyers.length > 0 ? 'Action Required' : 'All Clear'}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200 shadow-2xs">
                <UserCheck size={22} />
              </div>
            </div>

            {/* Card 4: Total Volume */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Financial Volume
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                  ₹{totalVolume.toFixed(2)}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-semibold pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Platform Transactions</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                <CreditCard size={22} />
              </div>
            </div>
          </div>

          {/* Pending Verification Queue Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
                  <UserCheck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      Pending Verification Queue
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {pendingLawyers.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Advocates awaiting Bar credential review and profile authorization
                  </p>
                </div>
              </div>

              <Link
                to="/admin/verifications"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 transition-all cursor-pointer self-start sm:self-auto"
              >
                <span>Manage All Verifications</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="py-12">
                  <LoadingState message="Loading pending lawyer applications..." />
                </div>
              ) : pendingLawyers.length === 0 ? (
                <div className="py-8">
                  <EmptyState
                    icon={ShieldCheck}
                    title="Queue is Empty"
                    message="No pending advocate verification applications awaiting admin review."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/80 font-bold">
                        <th className="py-3.5 px-5">Advocate</th>
                        <th className="py-3.5 px-5">Bar Registration</th>
                        <th className="py-3.5 px-5">Experience</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingLawyers.map((lawyer) => (
                        <tr
                          key={lawyer.lawyerId}
                          className="hover:bg-slate-50/70 transition-colors duration-150"
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-800 to-indigo-900 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                                {lawyer.fullName ? lawyer.fullName.charAt(0).toUpperCase() : 'A'}
                              </div>
                              <div className="min-w-0">
                                <span className="text-slate-900 font-bold block truncate">
                                  {lawyer.fullName}
                                </span>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  {lawyer.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-mono text-slate-800 font-bold text-xs">
                            <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200/60">
                              {lawyer.barEnrollmentNumber || 'Not Provided'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-600">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                              <Award size={12} className="text-amber-500" />
                              <span>
                                {lawyer.yearsOfExperience !== null && lawyer.yearsOfExperience !== undefined
                                  ? `${lawyer.yearsOfExperience} Yrs`
                                  : 'N/A'}
                              </span>
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <StatusBadge status={lawyer.verificationStatus || 'PENDING'} />
                          </td>
                          <td className="py-4 px-5 text-right">
                            <Link
                              to="/admin/verifications"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-xs shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                            >
                              <span>Review</span>
                              <ArrowRight size={13} />
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

export default AdminDashboardPage;

