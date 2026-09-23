import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import LawyerHeader from '../../components/LawyerHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, ShieldCheck, MessageSquare, Calendar, CreditCard, Star, 
  ChevronRight, ArrowRight, Award, FileText, CheckCircle2, 
  AlertTriangle, XCircle, RefreshCw, UserCheck
} from 'lucide-react';
import { getLawyerRatingData } from '../../utils/ratingUtils';
import { consultationApi } from '../../api/consultationApi';
import { lawyerApi } from '../../api/lawyerApi';

const LawyerDashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState('₹0.00');

  // Fetch latest lawyer profile from backend to ensure real-time status reflection
  const fetchLiveProfile = useCallback(() => {
    const lawyerId = user?.lawyerId || user?.id || 1;
    lawyerApi.getLawyerById(lawyerId)
      .then(res => {
        if (res && res.data) {
          const data = res.data.data || res.data;
          setProfile(data);
          if (updateUser) {
            updateUser(data);
          }
        }
      })
      .catch(() => {});
  }, [user?.lawyerId, user?.id, updateUser]);

  useEffect(() => {
    fetchLiveProfile();

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

    lawyerApi.getRatings(lawyerId)
      .then(data => {
        if (data) {
          const avg = data.averageRating !== undefined && data.averageRating !== null && !isNaN(Number(data.averageRating)) && Number(data.averageRating) > 0 
            ? Number(data.averageRating).toFixed(1) 
            : '0';
          const reviewsList = Array.isArray(data.reviews) ? data.reviews.map(r => ({
            id: r.id,
            name: r.customerName || 'Verified Client',
            rating: r.rating,
            comment: r.comment,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'
          })) : [];
          setRatingInfo({
            average: avg,
            count: data.ratingCount !== undefined ? data.ratingCount : reviewsList.length,
            reviews: reviewsList
          });
        }
      })
      .catch(() => {});
  }, [user?.lawyerId, user?.id, fetchLiveProfile]);

  const [ratingInfo, setRatingInfo] = useState(() => {
    const local = getLawyerRatingData(user?.lawyerId || user?.id || 1);
    return {
      average: local.count > 0 ? local.average.toFixed(1) : (user?.rating && Number(user.rating) > 0 ? Number(user.rating).toFixed(1) : '0'),
      count: local.count || user?.ratingCount || 0,
      reviews: local.reviews || []
    };
  });

  const advocate = profile || user || {};
  const currentStatus = (advocate?.verificationStatus || 'PENDING').toUpperCase();
  const isApproved = currentStatus === 'APPROVED' || advocate?.accountStatus === 'ACTIVE';
  const isRejected = currentStatus === 'REJECTED';
  const isPending = !isApproved && !isRejected;

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="lawyer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <LawyerHeader 
          title="Advocate Workspace"
          subtitle="Overview of your client requests, scheduled consultations, and direct earnings."
          badge={{ 
            text: isApproved 
              ? "Bar Verified & Active" 
              : isRejected 
              ? "Verification Rejected" 
              : "Pending Admin Review", 
            variant: isApproved ? "success" : isRejected ? "danger" : "amber",
            icon: isApproved ? ShieldCheck : isRejected ? XCircle : Clock
          }}
          actions={
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={fetchLiveProfile}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 shrink-0"
                title="Refresh Status"
              >
                <RefreshCw size={13} className="text-slate-500" />
                <span>Sync Status</span>
              </button>
              <Link
                to="/lawyer/profile"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 shrink-0"
              >
                <span>Edit Profile</span>
              </Link>
              <Link
                to="/lawyer/requests"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-sm shadow-amber-500/20 transition-all duration-150 active:scale-95 shrink-0"
              >
                <MessageSquare size={13} />
                <span>Requests ({requests.length})</span>
              </Link>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Top Welcome Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0b0f19] via-[#111827] to-[#1e1b4b] text-white p-6 sm:p-8 shadow-xl border border-slate-800/80">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/4 -bottom-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${
                    isApproved 
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                      : isRejected
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-400' : isRejected ? 'bg-rose-400' : 'bg-amber-400 animate-pulse'}`} />
                    {isApproved ? (
                      <ShieldCheck size={13} className="text-emerald-400" />
                    ) : isRejected ? (
                      <XCircle size={13} className="text-rose-400" />
                    ) : (
                      <Clock size={13} className="text-amber-400" />
                    )}
                    <span>
                      {isApproved 
                        ? 'Bar Verified & Active' 
                        : isRejected 
                        ? 'Verification Rejected' 
                        : 'Under Admin Review'}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/10 text-slate-200 border border-white/15 backdrop-blur-xs">
                    <Award size={13} className="text-amber-400" />
                    <span>Bar Reg: {advocate?.barEnrollmentNumber || 'Not Provided'}</span>
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white mb-2 font-['Outfit',sans-serif]">
                  Welcome, {advocate?.fullName ? (advocate.fullName.startsWith('Adv.') ? advocate.fullName : `Adv. ${advocate.fullName}`) : 'Adv. Advocate'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
                  Advocate Management Console • Track client briefs, confirm consultation dates, and verify UPI payout settlements.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  to="/lawyer/profile"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-xs transition-all duration-150 active:scale-95 backdrop-blur-xs"
                >
                  <span>Profile Settings</span>
                </Link>
                <Link
                  to="/lawyer/requests"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all duration-150 active:scale-95"
                >
                  <MessageSquare size={14} />
                  <span>View Requests</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Dynamic Verification Alert Banner */}
          {isApproved ? (
            /* APPROVED Banner */
            <div className="rounded-2xl sm:rounded-3xl bg-emerald-500/10 border border-emerald-300/40 p-5 sm:p-6 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-emerald-900 mb-0.5 flex items-center gap-2">
                  Verification Status: Approved & Active
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800/90 font-normal">
                  Your profile is officially verified and listed for client consultation requests across India.
                </p>
              </div>
            </div>
          ) : isRejected ? (
            /* REJECTED Banner with Rejection Reason */
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-50 via-rose-50/70 to-red-50 border-2 border-rose-300/80 p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-rose-950">
                      Advocate Verification Rejected by Admin
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-2xs">
                      CORRECTION NEEDED
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-rose-900/90 leading-relaxed max-w-2xl font-normal">
                    Your application was reviewed and could not be approved. Please check the feedback from the admin below, update your certificates or credentials, and re-submit.
                  </p>

                  {/* Highlighted Rejection Reason Box */}
                  <div className="bg-white/95 rounded-xl p-3.5 border border-rose-200/90 shadow-2xs mt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
                      Admin Feedback / Rejection Reason:
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      "{advocate?.rejectionReason || 'Uploaded Bar Council certificate or registration credentials did not pass verification. Please upload a clear document.'}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0 w-full md:w-auto">
                <Link
                  to="/lawyer/documents"
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition-all duration-150 active:scale-95"
                >
                  <FileText size={14} />
                  <span>Update Documents</span>
                </Link>
                <Link
                  to="/lawyer/profile"
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs transition-all duration-150 active:scale-95"
                >
                  <span>Edit Profile</span>
                </Link>
              </div>
            </div>
          ) : (
            /* PENDING Review Banner */
            <div className="rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-300/40 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all duration-150 shrink-0"
              >
                <FileText size={14} />
                <span>View Documents</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          )}

          {/* Overview Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Client Rating */}
            <div className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Client Rating
                </p>
                <div className="flex items-baseline gap-1.5">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                    {ratingInfo.average}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold pt-0.5">
                  <Star size={13} fill="#D97706" color="#D97706" />
                  <span>{ratingInfo.count} Verified Reviews</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200 shadow-xs shrink-0">
                <Star size={22} fill="#D97706" color="#D97706" />
              </div>
            </div>

            {/* Card 2: Consultation Requests */}
            <div className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Requests
                </p>
                <div className="text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  {requests.length}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  <span>Incoming queries</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shadow-xs shrink-0">
                <MessageSquare size={22} />
              </div>
            </div>

            {/* Card 3: Scheduled Appointments */}
            <div className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Appointments
                </p>
                <div className="text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  {scheduledCount}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-purple-600 font-medium pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  <span>Scheduled calendar</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 shadow-xs shrink-0">
                <Calendar size={22} />
              </div>
            </div>

            {/* Card 4: Total Earnings */}
            <div className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total Earnings
                </p>
                <div className="text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  {totalEarnings}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-medium pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span>Settled Payouts</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-200 shadow-xs shrink-0">
                <CreditCard size={22} />
              </div>
            </div>
          </div>

          {/* Pending Consultations Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Active Client Consultation Requests
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review and accept client queries submitted for your legal specialization
                  </p>
                </div>
              </div>

              <Link
                to="/lawyer/requests"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All Requests</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="p-5">
              {requests.length === 0 ? (
                <EmptyState 
                  icon={MessageSquare}
                  title="No Pending Consultation Requests"
                  message="When clients request a consultation with you, their case briefs and details will appear here."
                  action={
                    <Link to="/lawyer/requests" className="btn btn-secondary btn-sm mt-3">
                      Go to Requests Page
                    </Link>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] pb-2 font-semibold">
                        <th className="py-2.5 px-3">Client</th>
                        <th className="py-2.5 px-3">Case Category</th>
                        <th className="py-2.5 px-3">Preferred Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requests.slice(0, 5).map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800 block">
                              {req.customerName || req.clientName || 'Client'}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">
                              {req.briefDescription || req.legalIssue || 'Case Consultation'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-600">
                            {req.practiceArea || 'General Law'}
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {req.scheduledDate || req.preferredDate || 'Flexible'}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={req.status || 'PENDING'} />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              to="/lawyer/requests"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                              <span>Manage</span>
                              <ArrowRight size={12} />
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

          {/* Client Reviews Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Star size={16} fill="#D97706" color="#D97706" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Client Feedback &amp; Reviews
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ratings and testimonials submitted by clients following consultations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <Star size={12} fill="#D97706" color="#D97706" />
                  <span>{ratingInfo.average} / 5.0</span>
                </div>
              </div>
            </div>

            <div className="p-5">
              {ratingInfo.reviews && ratingInfo.reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ratingInfo.reviews.map(review => (
                    <div key={review.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs">
                            {review.name ? review.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 text-xs block">
                              {review.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {review.date}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={11} 
                              fill={i < review.rating ? '#D97706' : '#E2E8F0'} 
                              color={i < review.rating ? '#D97706' : '#CBD5E1'} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Star size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No client reviews yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Reviews will appear here once clients complete consultations with you.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LawyerDashboardPage;
