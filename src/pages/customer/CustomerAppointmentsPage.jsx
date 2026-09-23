import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import CustomerHeader from '../../components/CustomerHeader';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Scale, 
  Users, 
  AlertCircle, 
  Eye, 
  X, 
  Plus, 
  LayoutGrid, 
  List, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useCustomerRequests } from '../../hooks/useConsultationQueries';

const CustomerAppointmentsPage = () => {
  const navigate = useNavigate();
  const { data: requests = [], isLoading } = useCustomerRequests();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `http://localhost:8082${cleanPath}`;
  };

  const appointments = useMemo(() => {
    return requests.map(r => ({
      id: r.id || r.requestId,
      lawyerId: r.lawyerId || 1,
      lawyerName: r.lawyerName || 'Advocate',
      lawyerProfileImageUrl: formatImageUrl(r.lawyerProfileImageUrl || r.profilePhotoUrl || r.lawyerPhotoUrl || r.lawyerImage),
      category: r.categoryDisplayName || r.category || 'Legal Consultation',
      scheduledTime: r.assignedDate ? `${r.assignedDate} at ${r.assignedTime || 'Scheduled Time'}` : (r.scheduledAt || 'Scheduled'),
      assignedDate: r.assignedDate,
      assignedTime: r.assignedTime,
      status: (r.status || 'ACCEPTED').toUpperCase(),
      caseSummary: r.caseSummary || 'Legal consultation and preliminary advisory session.',
      lawyerRate: r.lawyerRate || '₹99 / session',
      fee: r.fee || r.consultationFee || 99
    }));
  }, [requests]);

  // Counts for KPI metrics
  const activeAppointments = useMemo(() => {
    return appointments.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED');
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter(a => a.status === 'COMPLETED');
  }, [appointments]);

  const uniqueLawyersCount = useMemo(() => {
    return new Set(appointments.map(a => a.lawyerId)).size;
  }, [appointments]);

  // Filtered by active tab and search query
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      // Tab filter
      if (activeTab === 'ACTIVE' && (app.status === 'COMPLETED' || app.status === 'CANCELLED')) {
        return false;
      }
      if (activeTab === 'COMPLETED' && app.status !== 'COMPLETED') {
        return false;
      }

      // Search term filter
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      return (
        app.lawyerName.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        app.scheduledTime.toLowerCase().includes(q) ||
        app.caseSummary.toLowerCase().includes(q)
      );
    });
  }, [appointments, activeTab, searchTerm]);

  // Helpers
  const getInitials = (name) => {
    if (!name) return 'A';
    const cleaned = name.replace(/^(adv(\.|\s+)|advocate\s+|dr(\.|\s+)|mr(\.|\s+)|ms(\.|\s+)|mrs(\.|\s+))/i, '').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return name.charAt(0).toUpperCase();
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const formatName = (name) => {
    if (!name) return 'Advocate';
    if (name === name.toUpperCase()) {
      return name
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return name;
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'ACCEPTED':
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Confirmed / Active</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
            <Clock size={12} className="text-amber-600" />
            <span>Awaiting Confirmation</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <AlertCircle size={12} className="text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="customer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <CustomerHeader 
          title="Appointments"
          subtitle="Track, manage, and join your scheduled advocate consultation sessions."
          badge={{ text: "Consultation Hub", variant: "indigo" }}
          actions={
            <Link
              to="/customer/find-lawyers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus size={14} />
              <span>Book New Advocate</span>
            </Link>
          }
        />

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-5 sm:space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* OVERVIEW KPI METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* KPI 1: Total Appointments */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total Bookings
                </p>
                <div className="text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  {appointments.length}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-0.5">
                  <span>Recorded sessions</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
                <Calendar size={22} />
              </div>
            </div>

            {/* KPI 2: Active / Upcoming Sessions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Upcoming & Active
                </p>
                <div className="text-2xl font-bold text-indigo-600 tracking-tight font-['Outfit',sans-serif]">
                  {activeAppointments.length}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready to join</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                <Clock size={22} />
              </div>
            </div>

            {/* KPI 3: Completed Consultations */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Completed Sessions
                </p>
                <div className="text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  {completedAppointments.length}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-0.5">
                  <span>Concluded consultations</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
                <CheckCircle2 size={22} />
              </div>
            </div>

            {/* KPI 4: Advocates Consulted */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Advocates Network
                </p>
                <div className="text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  {uniqueLawyersCount}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-0.5">
                  <span>Verified advocates</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shadow-xs shrink-0">
                <Scale size={22} />
              </div>
            </div>

          </div>

          {/* TOOLBAR: TAB FILTERS + SEARCH + VIEW SWITCHER */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl shrink-0 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'ALL'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>All Bookings</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'ALL' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {appointments.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('ACTIVE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'ACTIVE'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Active & Upcoming</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'ACTIVE' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {activeAppointments.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('COMPLETED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'COMPLETED'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Completed</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'COMPLETED' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {completedAppointments.length}
                  </span>
                </button>
              </div>

              {/* Search + View Mode Buttons */}
              <div className="flex items-center gap-2.5 flex-1 md:justify-end">
                <div className="relative flex-1 max-w-md">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by advocate, category, or date..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* View toggle (Grid / Table) */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200/60">
                  <button
                    onClick={() => setViewMode('GRID')}
                    title="Grid Cards View"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'GRID' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode('TABLE')}
                    title="Table View"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'TABLE' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>

            </div>

            {/* Results Counter & Active Filters Display */}
            {(searchTerm || activeTab !== 'ALL') && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Showing <strong className="text-slate-800">{filteredAppointments.length}</strong> matching appointments
                </span>
                <button
                  onClick={() => { setActiveTab('ALL'); setSearchTerm(''); }}
                  className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset Filter</span>
                </button>
              </div>
            )}
          </div>

          {/* MAIN CONTENT AREA */}
          {isLoading ? (
            <div className="py-12">
              <LoadingState message="Fetching your scheduled appointments..." />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs text-center">
              <EmptyState 
                icon={Calendar}
                title={searchTerm || activeTab !== 'ALL' ? 'No Matching Appointments' : 'No Appointments Found'}
                message={
                  searchTerm || activeTab !== 'ALL'
                    ? 'No appointments matched your current search or tab filters. Try adjusting your search query.'
                    : 'You do not have any scheduled or completed advocate consultations yet. Book a session with a verified advocate to get started.'
                }
              />
              <div className="mt-4 flex items-center justify-center gap-3">
                {searchTerm || activeTab !== 'ALL' ? (
                  <button
                    onClick={() => { setActiveTab('ALL'); setSearchTerm(''); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-2xs transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Clear Search & Filters</span>
                  </button>
                ) : (
                  <Link
                    to="/customer/find-lawyers"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <Scale size={14} />
                    <span>Find & Book an Advocate</span>
                  </Link>
                )}
              </div>
            </div>
          ) : viewMode === 'GRID' ? (
            
            /* CARDS GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Top: Avatar + Name + Status */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 shrink-0">
                          {app.lawyerProfileImageUrl ? (
                            <img 
                              src={app.lawyerProfileImageUrl} 
                              alt={app.lawyerName} 
                              className="w-12 h-12 rounded-xl object-cover shadow-xs border border-slate-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-base items-center justify-center shadow-xs ${
                            app.lawyerProfileImageUrl ? 'hidden' : 'flex'
                          }`}>
                            {getInitials(app.lawyerName)}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="truncate">{formatName(app.lawyerName)}</span>
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" title="Verified Advocate" />
                          </div>
                          <span className="inline-block text-[11px] font-medium text-slate-500 truncate mt-0.5">
                            {app.category}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {renderStatusBadge(app.status)}
                      </div>
                    </div>

                    {/* Schedule Date & Time Box */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3.5 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                        <Calendar size={13} className="text-indigo-600 shrink-0" />
                        <span className="truncate">{app.scheduledTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" /> Standard 10 Min Session
                        </span>
                        <span className="font-semibold text-emerald-700">₹{app.fee} Paid</span>
                      </div>
                    </div>

                    {/* Case Summary Snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {app.caseSummary}
                    </p>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(app)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>

                    {app.status === 'COMPLETED' ? (
                      <Link
                        to={`/customer/consultations?lawyerId=${app.lawyerId}`}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare size={13} className="text-slate-500" />
                        <span>View Chat Logs</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/customer/consultations?lawyerId=${app.lawyerId}`}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare size={13} />
                        <span>Open Session</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

          ) : (

            /* MODERN RESPONSIVE TABLE VIEW */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 sm:px-6">Advocate</th>
                      <th className="py-3.5 px-4">Legal Category</th>
                      <th className="py-3.5 px-4">Scheduled Time</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right sm:pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredAppointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 shrink-0">
                              {app.lawyerProfileImageUrl ? (
                                <img 
                                  src={app.lawyerProfileImageUrl} 
                                  alt={app.lawyerName} 
                                  className="w-9 h-9 rounded-xl object-cover shadow-xs border border-slate-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextElementSibling) {
                                      e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs items-center justify-center shadow-xs ${
                                app.lawyerProfileImageUrl ? 'hidden' : 'flex'
                              }`}>
                                {getInitials(app.lawyerName)}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                <span className="truncate">{formatName(app.lawyerName)}</span>
                                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                              </div>
                              <div className="text-[11px] text-slate-400">Ref: #{app.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block font-medium text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-md text-[11px]">
                            {app.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Calendar size={13} className="text-indigo-600 shrink-0" />
                            <span>{app.scheduledTime}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {renderStatusBadge(app.status)}
                        </td>

                        <td className="py-3.5 px-4 text-right sm:pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedAppointment(app)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
                              title="View details"
                            >
                              <Eye size={14} />
                            </button>

                            {app.status === 'COMPLETED' ? (
                              <Link
                                to={`/customer/consultations?lawyerId=${app.lawyerId}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
                              >
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                <span>Closed</span>
                              </Link>
                            ) : (
                              <Link
                                to={`/customer/consultations?lawyerId=${app.lawyerId}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs hover:shadow-indigo-500/20 transition-all"
                              >
                                <MessageSquare size={13} />
                                <span>Join Session</span>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* APPOINTMENT DETAILS PREVIEW MODAL */}
      {selectedAppointment && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedAppointment(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 relative shadow-2xl text-slate-800 font-['Outfit',sans-serif]"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setSelectedAppointment(null)} 
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-5 pr-8">
              <div className="relative w-14 h-14 shrink-0">
                {selectedAppointment.lawyerProfileImageUrl ? (
                  <img 
                    src={selectedAppointment.lawyerProfileImageUrl} 
                    alt={selectedAppointment.lawyerName} 
                    className="w-14 h-14 rounded-2xl object-cover shadow-md border border-slate-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white items-center justify-center text-xl font-bold shadow-md ${
                  selectedAppointment.lawyerProfileImageUrl ? 'hidden' : 'flex'
                }`}>
                  {getInitials(selectedAppointment.lawyerName)}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="truncate">{formatName(selectedAppointment.lawyerName)}</span>
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedAppointment.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    Ref #{selectedAppointment.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Timing Banner */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Session Status:</span>
                {renderStatusBadge(selectedAppointment.status)}
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Calendar size={13} className="text-indigo-600" /> Scheduled Time:
                </span>
                <span className="text-slate-900 font-bold">{selectedAppointment.scheduledTime}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Consultation Fee:</span>
                <span className="text-emerald-700 font-bold">₹{selectedAppointment.fee} (Paid)</span>
              </div>
            </div>

            {/* Case Details */}
            <div className="mb-5 space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Case Summary & Advisory Topic
              </div>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {selectedAppointment.caseSummary}
              </div>
            </div>

            {/* Guarantee Box */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 mb-5">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Direct, end-to-end encrypted chat with Bar Council advocate.</span>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="w-full sm:w-28 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer order-2 sm:order-1"
              >
                Close
              </button>
              <Link
                to={`/customer/consultations?lawyerId=${selectedAppointment.lawyerId}`}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-2xs hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                <MessageSquare size={15} />
                <span>Open Consultation Room</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerAppointmentsPage;
