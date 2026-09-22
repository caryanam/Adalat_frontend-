import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, ShieldCheck, MessageSquare, Calendar, CreditCard, Star, 
  ChevronRight, ArrowRight, Award, FileText, UserCheck, CheckCircle2 
} from 'lucide-react';
import { getLawyerRatingData } from '../../utils/ratingUtils';
import { consultationApi } from '../../api/consultationApi';
import { lawyerApi } from '../../api/lawyerApi';
import './LawyerPortalPages.css';

const LawyerDashboardPage = () => {
  const { user } = useAuth();
  const isApproved = user?.verificationStatus === 'APPROVED' || user?.accountStatus === 'ACTIVE';
  const [requests, setRequests] = useState([]);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState('₹0.00');

  useEffect(() => {
    const lawyerId = user?.lawyerId || user?.id || 1;
    consultationApi.getLawyerRequests()
      .then(res => {
        const raw = res && res.data ? (res.data.data || res.data) : [];
        if (Array.isArray(raw)) {
          setRequests(raw);
          const accepted = raw.filter(r => r.status === 'ACCEPTED' || r.status === 'ACTIVE' || r.status === 'COMPLETED');
          setScheduledCount(accepted.length);
        }
      })
      .catch(() => setRequests([]));

    lawyerApi.getEarnings(lawyerId)
      .then(res => {
        const data = res && res.data ? (res.data.data || res.data) : null;
        if (data) {
          if (data.totalEarningsNum !== undefined && data.totalEarningsNum !== null) {
            setTotalEarnings(`₹${Number(data.totalEarningsNum).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
          } else if (data.totalEarnings) {
            setTotalEarnings(data.totalEarnings);
          }
        }
      })
      .catch(() => {});
  }, [user]);

  const ratingInfo = getLawyerRatingData(user?.lawyerId || user?.id || 1);

  return (
    <div className="portal-layout">
      <Sidebar portalType="lawyer" />

      <main className="portal-main-content p-6 lg:p-8 space-y-6">
        {/* Top Header / Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StatusBadge status={user?.verificationStatus || 'PENDING'} />
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800/80 text-amber-300 border border-slate-700/80 shadow-xs">
                  <Award size={13} className="text-amber-400" />
                  <span>Bar Reg: {user?.barEnrollmentNumber || 'Not Provided'}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-['Cinzel'] tracking-wide text-white mb-2">
                Welcome, Adv. {user?.fullName || 'Advocate'}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Advocate Management Console • Track consultations, customer briefs, and platform payouts.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/lawyer/profile"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 shadow-xs transition-all duration-150 active:scale-95 backdrop-blur-xs"
              >
                <span>Edit Profile</span>
              </Link>
              <Link
                to="/lawyer/requests"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all duration-150 active:scale-95"
              >
                <MessageSquare size={15} />
                <span>View Requests</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Verification Alert Banner */}
        {!isApproved ? (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-300/40 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
                <Clock size={22} className="animate-pulse text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-amber-900 mb-0.5">
                  Verification Status: Under Admin Review
                </h3>
                <p className="text-xs sm:text-sm text-amber-800/90 leading-relaxed max-w-2xl">
                  Your Bar credentials and identity documents are currently under manual review. <strong>Your profile will become visible to customers in advocate listings immediately after admin approval.</strong>
                </p>
              </div>
            </div>
            <Link
              to="/lawyer/documents"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all duration-150 shrink-0"
            >
              <FileText size={14} />
              <span>View Documents</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-300/40 p-5 sm:p-6 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-emerald-900 mb-0.5 flex items-center gap-2">
                Verification Status: Approved & Active
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800/90">
                Your profile is officially verified and listed for client consultation requests across India.
              </p>
            </div>
          </div>
        )}

        {/* Overview Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Client Rating */}
          <div className="group bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Client Rating
              </p>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {ratingInfo.average}
                </h3>
                <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold pt-0.5">
                <Star size={13} fill="#D97706" color="#D97706" />
                <span>{ratingInfo.count} Verified Reviews</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200 shadow-xs">
              <Star size={22} fill="#D97706" color="#D97706" />
            </div>
          </div>

          {/* Card 2: Consultation Requests */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Requests
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {requests.length}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Incoming queries</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <MessageSquare size={22} />
            </div>
          </div>

          {/* Card 3: Scheduled Appointments */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Appointments
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {scheduledCount}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-purple-600 font-medium pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                <span>Scheduled calendar</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <Calendar size={22} />
            </div>
          </div>

          {/* Card 4: Total Earnings */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Earnings
              </p>
              <h3 className="text-2xl font-bold text-emerald-700 tracking-tight">
                {totalEarnings}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium pt-0.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Verified Payouts</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <CreditCard size={22} />
            </div>
          </div>
        </div>

        {/* Client Ratings & Feedback Reviews Section */}
        {ratingInfo.reviews && ratingInfo.reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Star size={16} fill="#D97706" color="#D97706" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Client Ratings & Feedback Reviews
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct feedback from verified customer consultations ({ratingInfo.reviews.length})
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {ratingInfo.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all duration-150 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {rev.name ? rev.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <span className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                          {rev.name}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Star size={11} fill="#D97706" color="#D97706" />
                        {rev.rating} / 5
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      "{rev.comment || 'Great legal consultation experience.'}"
                    </p>

                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                      <span>Verified Client</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Incoming Consultation Requests Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <MessageSquare size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Incoming Consultation Requests
                </h3>
                <p className="text-xs text-slate-400">
                  Customer briefs waiting for your evaluation and schedule assignment
                </p>
              </div>
            </div>

            <Link
              to="/lawyer/requests"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
            >
              <span>Manage Requests</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            {requests.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={MessageSquare}
                  title="No Consultation Requests"
                  message="New consultation booking requests from customers will appear here."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/60 font-semibold">
                      <th className="py-3 px-4 rounded-l-lg">Customer</th>
                      <th className="py-3 px-4">Legal Category</th>
                      <th className="py-3 px-4">Request Message</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/80 transition-colors duration-150"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-xs shadow-xs">
                              {req.customerName ? req.customerName.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <span>{req.customerName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {req.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          <span className="italic">"{req.message}"</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={req.status || 'REQUESTED'} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to="/lawyer/requests"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-all duration-150"
                          >
                            <Calendar size={13} />
                            <span>Accept / Assign Time</span>
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

export default LawyerDashboardPage;
