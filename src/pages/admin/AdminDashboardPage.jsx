import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { lawyerApi } from '../../api/lawyerApi';
import apiClient from '../../api/apiClient';
import { 
  Users, UserCheck, ShieldCheck, CreditCard, 
  ChevronRight, ArrowRight, ShieldAlert, Award, FileCheck, CheckCircle2 
} from 'lucide-react';
import './AdminPortalPages.css';

const AdminDashboardPage = () => {
  const [pendingLawyers, setPendingLawyers] = useState([]);
  const [approvedLawyers, setApprovedLawyers] = useState([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <div className="portal-layout">
      <Sidebar portalType="admin" />

      <main className="portal-main-content p-6 lg:p-8 space-y-6">
        {/* Admin Command Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-xs mb-3">
                <ShieldCheck size={14} className="text-purple-400" />
                <span>Adalat Platform Administration</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse ml-0.5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-['Cinzel'] tracking-wide text-white mb-2">
                Admin Command Dashboard
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Complete platform overview • Advocate verification queue, transaction audits, and jurisdiction analytics.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/admin/payments"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 shadow-xs transition-all duration-150 active:scale-95 backdrop-blur-xs"
              >
                <CreditCard size={15} />
                <span>Payment Audit</span>
              </Link>
              <Link
                to="/admin/verifications"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all duration-150 active:scale-95"
              >
                <UserCheck size={15} />
                <span>Review Queue</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Registered Advocates */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Registered Advocates
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {approvedLawyers.length + pendingLawyers.length}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Total Onboarded</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <Users size={22} />
            </div>
          </div>

          {/* Card 2: Approved Lawyers */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Approved Lawyers
              </p>
              <h3 className="text-2xl font-bold text-emerald-700 tracking-tight">
                {approvedLawyers.length}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium pt-0.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Active & Verified</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <ShieldCheck size={22} />
            </div>
          </div>

          {/* Card 3: Pending Approvals */}
          <div className="group bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Pending Approvals
              </p>
              <h3 className="text-2xl font-bold text-amber-600 tracking-tight">
                {pendingLawyers.length} Pending
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium pt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-amber-500 ${pendingLawyers.length > 0 ? 'animate-pulse' : ''}`} />
                <span>Action Required</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200 shadow-xs">
              <UserCheck size={22} />
            </div>
          </div>

          {/* Card 4: Total Volume */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Financial Volume
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                ₹{totalVolume.toFixed(2)}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-medium pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>Platform Transactions</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <CreditCard size={22} />
            </div>
          </div>
        </div>

        {/* Pending Verification Queue Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <UserCheck size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Pending Verification Queue
                </h3>
                <p className="text-xs text-slate-400">
                  Advocates awaiting Bar credential review and profile authorization
                </p>
              </div>
            </div>

            <Link
              to="/admin/verifications"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
            >
              <span>Manage Queue</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="py-8">
                <LoadingState message="Loading pending lawyer applications..." />
              </div>
            ) : pendingLawyers.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={ShieldCheck}
                  title="Queue is Empty"
                  message="No pending advocate verification applications awaiting admin review."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/60 font-semibold">
                      <th className="py-3 px-4 rounded-l-lg">Advocate</th>
                      <th className="py-3 px-4">Bar Reg No</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingLawyers.map((lawyer) => (
                      <tr
                        key={lawyer.lawyerId}
                        className="hover:bg-slate-50/80 transition-colors duration-150"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                              {lawyer.fullName ? lawyer.fullName.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div>
                              <strong className="text-slate-900 block font-semibold leading-tight">
                                {lawyer.fullName}
                              </strong>
                              <span className="text-[11px] text-slate-400 block leading-tight">
                                {lawyer.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                          {lawyer.barEnrollmentNumber || 'Not Provided'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {lawyer.yearsOfExperience !== null && lawyer.yearsOfExperience !== undefined
                              ? `${lawyer.yearsOfExperience} Yrs`
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={lawyer.verificationStatus || 'PENDING'} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to="/admin/verifications"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-all duration-150"
                          >
                            <span>Review & Approve</span>
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
      </main>
    </div>
  );
};

export default AdminDashboardPage;
