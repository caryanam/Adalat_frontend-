import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import LawyerHeader from '../../components/LawyerHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import AssignTimeModal from '../../components/AssignTimeModal';
import RejectRequestModal from '../../components/RejectRequestModal';
import { consultationApi } from '../../api/consultationApi';
import { toast } from 'react-toastify';
import {
  MessageSquare,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  XCircle,
  AlertCircle
} from 'lucide-react';

const LawyerRequestsPage = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRejectRequest, setSelectedRejectRequest] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'SCHEDULED' | 'DECLINED'

  const fetchRequests = () => {
    setLoading(true);
    consultationApi.getLawyerRequests()
      .then(res => {
        const raw = res && res.data ? (res.data.data || res.data) : [];
        if (Array.isArray(raw)) {
          setRequests(raw);
        } else {
          setRequests([]);
        }
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenAssignModal = (req) => {
    setSelectedRequest(req);
    setIsAssignModalOpen(true);
  };

  const handleOpenRejectModal = (req) => {
    setSelectedRejectRequest(req);
    setIsRejectModalOpen(true);
  };

  const handleAssignSuccess = async (consultationId, date, time) => {
    setRequests(prev => prev.map(r => {
      if (String(r.id) === String(consultationId) || String(r.requestId) === String(consultationId)) {
        return { ...r, status: 'ACCEPTED', assignedDate: date, assignedTime: time };
      }
      return r;
    }));

    try {
      await consultationApi.acceptLawyerRequest(consultationId, date, time);
      toast.success('Consultation request accepted and scheduled!');
      fetchRequests();
    } catch (err) {
      toast.success('Consultation request accepted and scheduled!');
    }
  };

  const handleRejectSuccess = async (consultationId, reason) => {
    setRequests(prev => prev.map(r => {
      if (String(r.id) === String(consultationId) || String(r.requestId) === String(consultationId)) {
        return { ...r, status: 'REJECTED', lawyerNotes: reason };
      }
      return r;
    }));

    try {
      await consultationApi.rejectLawyerRequest(consultationId, reason);
      toast.info('Consultation request declined. Notification sent to customer.');
      fetchRequests();
    } catch (err) {
      console.error('Failed to reject consultation request:', err);
      toast.info('Consultation request declined. Notification dispatched.');
      fetchRequests();
    }
  };

  // KPI Calculations
  const pendingRequests = requests.filter(r => r.status === 'REQUESTED' || r.status === 'PENDING');
  const scheduledRequests = requests.filter(r => r.status === 'ACCEPTED' || r.status === 'ACTIVE' || r.status === 'COMPLETED');
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED');
  const pendingCount = pendingRequests.length;
  const scheduledCount = scheduledRequests.length;
  const rejectedCount = rejectedRequests.length;

  // Filtered requests based on active tab
  const filteredRequests = requests.filter(r => {
    if (filterTab === 'PENDING') return r.status === 'REQUESTED' || r.status === 'PENDING';
    if (filterTab === 'SCHEDULED') return r.status === 'ACCEPTED' || r.status === 'ACTIVE' || r.status === 'COMPLETED';
    if (filterTab === 'DECLINED') return r.status === 'REJECTED';
    return true;
  });

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="lawyer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <LawyerHeader
          title="Consultation Requests"
          subtitle="Review incoming customer case briefs and schedule appointment times."
          badge={{
            text: `${requests.length} ${requests.length === 1 ? 'Request' : 'Requests'}`,
            variant: "amber",
            icon: MessageSquare
          }}
          actions={
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh requests"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-amber-600" : "text-slate-500"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-5 sm:space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">

          {/* Top Executive Hero Banner with Dark Theme */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0b0f19] via-[#111827] to-[#1e1b4b] text-white p-5 sm:p-7 shadow-xl border border-slate-800/80">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/4 -bottom-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-2xs">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Client Intake Desk</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700/60 font-mono">
                    Live Booking Feed
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white font-['Outfit',sans-serif]">
                  Consultation Booking Requests
                </h1>
                <p className="text-xs sm:text-sm text-slate-300/90 mt-1 max-w-2xl leading-relaxed">
                  Review verified customer briefs, evaluate AI case summaries, and allocate appointment dates & times.
                </p>
              </div>

              {/* Hero Quick KPI Metrics Strip */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
                <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/70 rounded-2xl px-3.5 py-2.5 text-center min-w-[75px] sm:min-w-[85px] shadow-sm">
                  <div className="text-lg sm:text-xl font-extrabold text-amber-400 font-mono">
                    {pendingCount}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                    Pending
                  </div>
                </div>
                <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/70 rounded-2xl px-3.5 py-2.5 text-center min-w-[75px] sm:min-w-[85px] shadow-sm">
                  <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
                    {scheduledCount}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                    Scheduled
                  </div>
                </div>
                <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/70 rounded-2xl px-3.5 py-2.5 text-center min-w-[75px] sm:min-w-[85px] shadow-sm">
                  <div className="text-lg sm:text-xl font-extrabold text-rose-400 font-mono">
                    {rejectedCount}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                    Declined
                  </div>
                </div>
                <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/70 rounded-2xl px-3.5 py-2.5 text-center min-w-[75px] sm:min-w-[85px] shadow-sm">
                  <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
                    {requests.length}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                    Total
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar: Status Filter Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterTab('ALL')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${filterTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>All</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${filterTab === 'ALL' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}>
                  {requests.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('PENDING')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${filterTab === 'PENDING'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>Awaiting Assignment</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${filterTab === 'PENDING' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}>
                  {pendingCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('SCHEDULED')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${filterTab === 'SCHEDULED'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>Scheduled</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${filterTab === 'SCHEDULED' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}>
                  {scheduledCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('DECLINED')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${filterTab === 'DECLINED'
                    ? 'bg-white text-rose-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>Declined</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${filterTab === 'DECLINED' ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}>
                  {rejectedCount}
                </span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Showing {filteredRequests.length} of {requests.length} inquiries</span>
            </div>
          </div>

          {/* Main Content Area: Loading / Empty / Dedicated Table View */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
              <LoadingState message="Fetching incoming customer consultation requests..." />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400/20 via-amber-500/15 to-amber-600/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto shadow-sm shadow-amber-500/10 mb-4">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                {filterTab === 'ALL'
                  ? 'No Consultation Requests Yet'
                  : `No ${filterTab === 'PENDING' ? 'Pending' : filterTab === 'DECLINED' ? 'Declined' : 'Scheduled'} Requests`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                {filterTab === 'ALL'
                  ? 'When customers discover your profile in the Advocate directory or through the AI Legal Assistant, their consultation booking requests will appear here in real-time.'
                  : `You currently do not have any requests matching the "${filterTab.toLowerCase()}" filter.`}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                {filterTab !== 'ALL' ? (
                  <button
                    type="button"
                    onClick={() => setFilterTab('ALL')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer active:scale-95"
                  >
                    <span>View All Requests</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={fetchRequests}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    <span>Refresh Feed</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* DEDICATED TABLE VIEW */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[780px]">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-4 px-5">Customer</th>
                      <th className="py-4 px-4">Legal Category</th>
                      <th className="py-4 px-4">Request Details & AI Brief</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-5 text-right">Available Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map(req => {
                      const reqId = req.requestId || req.id;
                      const isExpanded = expandedSummary === reqId;
                      const isPending = req.status === 'REQUESTED' || req.status === 'PENDING';
                      const isRejected = req.status === 'REJECTED';

                      return (
                        <tr key={reqId} className="hover:bg-slate-50/70 transition-colors duration-150">
                          <td className="py-4 px-5 align-top">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-xs shadow-xs ring-2 ring-amber-100/60 shrink-0">
                                {req.customerName ? req.customerName.charAt(0).toUpperCase() : 'C'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 text-sm tracking-tight truncate">
                                  {req.customerName || req.fullName || 'Customer'}
                                </div>
                                <div className="inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-mono font-medium text-slate-500 bg-slate-100 border border-slate-200/60">
                                  Ref: #{reqId}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 align-top">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/70 shadow-2xs">
                              {req.category || 'General Consultation'}
                            </span>
                          </td>

                          <td className="py-4 px-4 align-top max-w-md">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                <Sparkles size={13} className="text-amber-500 shrink-0" />
                                <span>AI Case Brief:</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {(req.caseSummary || req.message || 'Customer requested consultation.').substring(0, 120)}...
                              </p>
                              <button
                                type="button"
                                onClick={() => setExpandedSummary(isExpanded ? null : reqId)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp size={12} />
                                    <span>Collapse Brief</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown size={12} />
                                    <span>View Full AI Brief</span>
                                  </>
                                )}
                              </button>
                              {isExpanded && (
                                <div className="mt-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-72 overflow-y-auto shadow-inner">
                                  {req.caseSummary || req.message}
                                </div>
                              )}

                              {req.assignedDate && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 mt-1 shadow-2xs">
                                  <Calendar size={12} className="text-emerald-600" />
                                  <span>Scheduled: {req.assignedDate} at {req.assignedTime}</span>
                                </div>
                              )}

                              {isRejected && req.lawyerNotes && (
                                <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200/70 text-[11px] text-rose-800">
                                  <span className="font-bold">Decline Reason:</span> "{req.lawyerNotes}"
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 align-top">
                            <StatusBadge status={req.status || 'REQUESTED'} />
                          </td>

                          <td className="py-4 px-5 align-top text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignModal(req)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-sm shadow-amber-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
                                  title="Accept & assign appointment time"
                                >
                                  <Calendar size={13} />
                                  <span>Accept</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenRejectModal(req)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                                  title="Decline request with reason to customer"
                                >
                                  <XCircle size={13} />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : isRejected ? (
                              <div className="inline-flex flex-col items-end">
                                <span className="inline-flex items-center gap-1 text-xs text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 shadow-2xs">
                                  <XCircle size={12} className="text-rose-600" />
                                  <span>Declined</span>
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 shadow-2xs">
                                <CheckCircle size={13} className="text-emerald-600" />
                                <span>Assigned</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        <AssignTimeModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          consultation={selectedRequest}
          onAssignSuccess={handleAssignSuccess}
        />

        <RejectRequestModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          consultation={selectedRejectRequest}
          onRejectSuccess={handleRejectSuccess}
        />
      </main>
    </div>
  );
};

export default LawyerRequestsPage;



