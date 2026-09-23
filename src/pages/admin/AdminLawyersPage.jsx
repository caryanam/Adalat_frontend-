import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { lawyerApi } from '../../api/lawyerApi';
import { 
  User, ShieldCheck, UserCheck, RefreshCw, Scale, CheckCircle2, 
  XCircle, Eye, Search, Filter, Briefcase, DollarSign, Award, 
  MapPin, BookOpen, Globe, FileText, X, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminLawyersPage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Action States
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Document preview state in modal
  const [fetchedDocs, setFetchedDocs] = useState([]);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [docBlobUrl, setDocBlobUrl] = useState(null);

  const fetchLawyers = useCallback(() => {
    setLoading(true);
    adminApi.getAllLawyers()
      .then(res => {
        if (res && res.data && Array.isArray(res.data)) {
          setLawyers(res.data);
        } else {
          // Fallback to approved lawyers if all fails
          return lawyerApi.getApprovedLawyers().then(aRes => {
            setLawyers(aRes && Array.isArray(aRes.data) ? aRes.data : []);
          });
        }
      })
      .catch(() => {
        lawyerApi.getApprovedLawyers()
          .then(aRes => setLawyers(aRes && Array.isArray(aRes.data) ? aRes.data : []))
          .catch(() => setLawyers([]));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  // Document fetching for modal
  const handleOpenDetails = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowDetailsModal(true);
    setActiveDocIndex(0);
    setDocBlobUrl(null);

    let docs = [];
    if (lawyer && lawyer.documents && Array.isArray(lawyer.documents) && lawyer.documents.length > 0) {
      docs = lawyer.documents;
    } else if (lawyer && lawyer.lawyerDocuments && Array.isArray(lawyer.lawyerDocuments) && lawyer.lawyerDocuments.length > 0) {
      docs = lawyer.lawyerDocuments;
    }

    if (docs.length === 0) {
      try {
        const stored = localStorage.getItem(`adalat_lawyer_docs_${lawyer.lawyerId}`) || localStorage.getItem('adalat_latest_lawyer_docs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.barCert && (parsed.barCert.dataUrl || parsed.barCert.fileUrl)) {
            docs = [parsed.barCert];
          }
        }
      } catch (e) {}
    }

    setFetchedDocs(docs);
  };

  useEffect(() => {
    if (showDetailsModal && fetchedDocs.length > 0) {
      const currentDoc = fetchedDocs[activeDocIndex] || fetchedDocs[0];
      const url = currentDoc ? (currentDoc.fileUrl || currentDoc.file_url || currentDoc.dataUrl || (currentDoc.filePath ? `http://localhost:8082/uploads/lawyers/${currentDoc.filePath}` : null)) : null;

      if (url) {
        if (url.startsWith('data:') || url.startsWith('blob:')) {
          setDocBlobUrl(url);
        } else {
          fetch(url)
            .then(res => {
              if (!res.ok) throw new Error('HTTP ' + res.status);
              return res.blob();
            })
            .then(blob => {
              const bUrl = URL.createObjectURL(blob);
              setDocBlobUrl(bUrl);
            })
            .catch(() => setDocBlobUrl(url));
        }
      } else {
        setDocBlobUrl(null);
      }
    }
  }, [showDetailsModal, activeDocIndex, fetchedDocs]);

  // Approve Lawyer Action
  const handleApprove = async (lawyer) => {
    setActionLoading(true);
    try {
      await adminApi.approveLawyer(lawyer.lawyerId);
      toast.success(`Advocate ${lawyer.fullName || 'account'} approved successfully! Account is now ACTIVE.`);
      setShowDetailsModal(false);
      
      // Update local state immediately
      setLawyers(prev => prev.map(l => 
        l.lawyerId === lawyer.lawyerId 
          ? { ...l, verificationStatus: 'APPROVED', accountStatus: 'ACTIVE', rejectionReason: null } 
          : l
      ));
    } catch (err) {
      toast.error(err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Lawyer Action
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim() || !selectedLawyer) return;
    setActionLoading(true);
    try {
      await adminApi.rejectLawyer(selectedLawyer.lawyerId, rejectionReason);
      toast.info(`Application for ${selectedLawyer.fullName} rejected.`);
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setRejectionReason('');

      // Update local state immediately
      setLawyers(prev => prev.map(l => 
        l.lawyerId === selectedLawyer.lawyerId 
          ? { ...l, verificationStatus: 'REJECTED', accountStatus: 'INACTIVE', rejectionReason: rejectionReason } 
          : l
      ));
    } catch (err) {
      toast.error(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Lawyers based on tab & search
  const filteredLawyers = useMemo(() => {
    return lawyers.filter(lawyer => {
      // Tab filter
      const status = (lawyer.verificationStatus || '').toUpperCase();
      if (activeTab === 'PENDING' && status !== 'PENDING') return false;
      if (activeTab === 'APPROVED' && status !== 'APPROVED') return false;
      if (activeTab === 'REJECTED' && status !== 'REJECTED') return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchName = (lawyer.fullName || '').toLowerCase().includes(query);
      const matchEmail = (lawyer.email || '').toLowerCase().includes(query);
      const matchBar = (lawyer.barEnrollmentNumber || '').toLowerCase().includes(query);
      const matchLoc = (lawyer.location || '').toLowerCase().includes(query);
      return matchName || matchEmail || matchBar || matchLoc;
    });
  }, [lawyers, activeTab, searchQuery]);

  // Counts
  const pendingCount = lawyers.filter(l => (l.verificationStatus || '').toUpperCase() === 'PENDING').length;
  const approvedCount = lawyers.filter(l => (l.verificationStatus || '').toUpperCase() === 'APPROVED').length;
  const rejectedCount = lawyers.filter(l => (l.verificationStatus || '').toUpperCase() === 'REJECTED').length;

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="admin" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <AdminHeader 
          title="Lawyer Directory & Verification"
          subtitle="Manage advocate applications, bar verifications, approvals, and credentials."
          badge={{
            text: `${pendingCount} Pending Approval`,
            variant: pendingCount > 0 ? 'amber' : 'emerald',
            icon: pendingCount > 0 ? UserCheck : ShieldCheck
          }}
          actions={
            <button
              type="button"
              onClick={fetchLawyers}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh directory"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* Main Card with Tabs and Search */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            
            {/* Header / Tabs Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/40">
              
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <Scale size={13} />
                  <span>All Lawyers</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {lawyers.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('PENDING')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'PENDING'
                      ? 'bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <UserCheck size={13} className={activeTab === 'PENDING' ? 'text-slate-950' : 'text-amber-500'} />
                  <span>Pending Review</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pendingCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('APPROVED')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'APPROVED'
                      ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <ShieldCheck size={13} className={activeTab === 'APPROVED' ? 'text-white' : 'text-emerald-600'} />
                  <span>Verified & Active</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'APPROVED' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {approvedCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('REJECTED')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'REJECTED'
                      ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <XCircle size={13} className={activeTab === 'REJECTED' ? 'text-white' : 'text-rose-600'} />
                  <span>Rejected</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'REJECTED' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {rejectedCount}
                  </span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, Bar No, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Content Table / Empty States */}
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="py-12">
                  <LoadingState message="Loading advocate directory and verification records..." />
                </div>
              ) : filteredLawyers.length === 0 ? (
                <div className="py-8">
                  <EmptyState 
                    icon={activeTab === 'PENDING' ? UserCheck : User}
                    title={
                      activeTab === 'PENDING' 
                        ? 'No Pending Verifications' 
                        : activeTab === 'APPROVED' 
                        ? 'No Approved Advocates' 
                        : activeTab === 'REJECTED' 
                        ? 'No Rejected Applications' 
                        : 'No Advocates Found'
                    }
                    message={
                      searchQuery 
                        ? `No advocate matched your query "${searchQuery}". Try a different search.` 
                        : 'No lawyer accounts found in this category.'
                    }
                  />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
                  <table className="w-full text-left text-xs min-w-[780px]">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/80 font-bold">
                        <th className="py-3.5 px-5">Lawyer / Contact</th>
                        <th className="py-3.5 px-5">Bar Reg No</th>
                        <th className="py-3.5 px-5">Experience & Fee</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLawyers.map(lawyer => {
                        const status = (lawyer.verificationStatus || 'PENDING').toUpperCase();
                        const isPending = status === 'PENDING';
                        const isApproved = status === 'APPROVED';
                        const isRejected = status === 'REJECTED';

                        return (
                          <tr key={lawyer.lawyerId} className="hover:bg-slate-50/70 transition-colors duration-150">
                            {/* Lawyer Info */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                {lawyer.profilePhotoUrl ? (
                                  <img 
                                    src={lawyer.profilePhotoUrl} 
                                    alt={lawyer.fullName} 
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0" 
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-900 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                                    {lawyer.fullName ? lawyer.fullName.charAt(0).toUpperCase() : 'L'}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 block truncate text-sm">
                                    {lawyer.fullName}
                                  </span>
                                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                                    {lawyer.email} • {lawyer.mobileNumber}
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                    <MapPin size={11} /> {lawyer.location || 'India'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Bar Reg */}
                            <td className="py-4 px-5">
                              <span className="font-mono text-slate-800 font-bold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 inline-block text-[11px]">
                                {lawyer.barEnrollmentNumber || 'Not Provided'}
                              </span>
                            </td>

                            {/* Experience & Fee */}
                            <td className="py-4 px-5">
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                                  <Award size={12} className="text-amber-500" />
                                  <span>{lawyer.yearsOfExperience !== null && lawyer.yearsOfExperience !== undefined ? `${lawyer.yearsOfExperience} Yrs Exp` : 'Exp N/A'}</span>
                                </span>
                                <div className="font-bold text-emerald-600 font-mono text-[11px]">
                                  ₹{lawyer.consultationFee || lawyer.consultationRateAmount || 99} / consult
                                </div>
                              </div>
                            </td>

                            {/* Verification Status */}
                            <td className="py-4 px-5">
                              <div className="space-y-1">
                                <StatusBadge status={lawyer.verificationStatus || 'PENDING'} />
                                {isRejected && lawyer.rejectionReason && (
                                  <p className="text-[10px] text-rose-600 font-medium max-w-[160px] truncate" title={lawyer.rejectionReason}>
                                    Reason: {lawyer.rejectionReason}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* Details Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetails(lawyer)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                                  title="View details & documents"
                                >
                                  <Eye size={13} />
                                  <span>Details</span>
                                </button>

                                {/* Direct Approve Button for Pending or Rejected */}
                                {(isPending || isRejected) && (
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(lawyer)}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                    title="Approve Advocate"
                                  >
                                    <CheckCircle2 size={13} />
                                    <span>Approve</span>
                                  </button>
                                )}

                                {/* Reject Button for Pending or Approved */}
                                {(isPending || isApproved) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedLawyer(lawyer);
                                      setShowRejectModal(true);
                                    }}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                    title="Reject or Suspend"
                                  >
                                    <XCircle size={13} />
                                    <span>Reject</span>
                                  </button>
                                )}

                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advocate Details & Verification Documents Modal */}
        {showDetailsModal && selectedLawyer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
              
              {/* Modal Top Header */}
              <div className="bg-gradient-to-r from-[#0d1322] to-[#1e1b4b] text-white p-5 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  {selectedLawyer.profilePhotoUrl ? (
                    <img 
                      src={selectedLawyer.profilePhotoUrl} 
                      alt={selectedLawyer.fullName} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-md shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                      {selectedLawyer.fullName ? selectedLawyer.fullName.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {selectedLawyer.fullName}
                    </h3>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      Bar Reg: <strong className="text-white">{selectedLawyer.barEnrollmentNumber || 'Not Provided'}</strong> • {selectedLawyer.location || 'India'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50">
                
                {/* 4-Stat Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                      <Briefcase size={13} className="text-indigo-500" />
                      <span>Experience</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {selectedLawyer.yearsOfExperience !== null && selectedLawyer.yearsOfExperience !== undefined ? `${selectedLawyer.yearsOfExperience} Years` : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                      <DollarSign size={13} className="text-emerald-500" />
                      <span>Fee Rate</span>
                    </div>
                    <div className="text-sm font-bold text-emerald-600 font-mono">
                      ₹{selectedLawyer.consultationFee || selectedLawyer.consultationRateAmount || 99}
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                      <Award size={13} className="text-amber-500" />
                      <span>Education</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate" title={selectedLawyer.education}>
                      {selectedLawyer.education || 'LL.B'}
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                      <Globe size={13} className="text-purple-500" />
                      <span>UPI Payout</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-800 truncate" title={selectedLawyer.upiId}>
                      {selectedLawyer.upiId || 'advocate@upi'}
                    </div>
                  </div>
                </div>

                {/* Professional Bio */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-indigo-600" />
                    <span>Professional Bio</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedLawyer.bio || 'Advocate practicing in high courts and district courts with verified credentials.'}
                  </p>
                </div>

                {/* Practice Areas & Languages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Practice Areas
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLawyer.practiceAreas && selectedLawyer.practiceAreas.length > 0 ? (
                        selectedLawyer.practiceAreas.map((p, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {typeof p === 'string' ? p.replace(/_/g, ' ') : p}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Civil Law, Criminal Law</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Languages Spoken
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLawyer.languages && selectedLawyer.languages.length > 0 ? (
                        selectedLawyer.languages.map((l, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {typeof l === 'string' ? l.replace(/_/g, ' ') : l}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">English, Hindi</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-600" />
                    <span>Verification Documents ({fetchedDocs.length})</span>
                  </h4>

                  {fetchedDocs.length > 0 ? (
                    <div>
                      {/* Tabs */}
                      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
                        {fetchedDocs.map((doc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveDocIndex(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              activeDocIndex === idx
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Doc #{idx + 1}: {doc.documentType || doc.name || 'Bar Certificate'}
                          </button>
                        ))}
                      </div>

                      {/* File preview */}
                      {(() => {
                        const currentDoc = fetchedDocs[activeDocIndex] || fetchedDocs[0];
                        const fileUrl = currentDoc ? (currentDoc.fileUrl || currentDoc.file_url || currentDoc.dataUrl || (currentDoc.filePath ? `http://localhost:8082/uploads/lawyers/${currentDoc.filePath}` : null)) : null;
                        const fileName = currentDoc ? (currentDoc.originalFilename || currentDoc.original_filename || currentDoc.fileName || currentDoc.name || currentDoc.documentType || 'Document.pdf') : 'Document';
                        const fileType = currentDoc ? (currentDoc.fileType || currentDoc.file_type || currentDoc.type || (fileUrl && fileUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')) : '';

                        const isPdf = fileType.includes('pdf') || (fileUrl && fileUrl.toLowerCase().includes('.pdf'));
                        const isImage = fileType.includes('image') || (fileUrl && (fileUrl.toLowerCase().includes('.jpg') || fileUrl.toLowerCase().includes('.png') || fileUrl.toLowerCase().includes('.jpeg')));

                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800">{fileName}</span>
                              {fileUrl && (
                                <a 
                                  href={fileUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-indigo-600 font-bold hover:underline"
                                >
                                  Open in New Tab ↗
                                </a>
                              )}
                            </div>

                            {isPdf ? (
                              <div className="w-full h-72 rounded-xl overflow-hidden border border-slate-200 bg-white">
                                <object data={docBlobUrl || fileUrl} type="application/pdf" width="100%" height="100%">
                                  <embed src={docBlobUrl || fileUrl} type="application/pdf" width="100%" height="100%" />
                                </object>
                              </div>
                            ) : isImage ? (
                              <div className="text-center bg-slate-100 p-3 border border-slate-200 rounded-xl">
                                <img src={docBlobUrl || fileUrl} alt={fileName} className="max-h-72 object-contain mx-auto rounded-lg" />
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-100 rounded-xl text-center">
                                <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600">
                                  View Document File ↗
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No verification certificates or ID documents attached yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    <span>Reject Application</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(selectedLawyer)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve Advocate</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Reject Reason Modal */}
        {showRejectModal && selectedLawyer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Reject Application
                  </h3>
                  <p className="text-xs text-slate-500">
                    Advocate: {selectedLawyer.fullName}
                  </p>
                </div>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Rejection Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Invalid Bar Council Enrollment certificate or incomplete document details..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !rejectionReason.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminLawyersPage;
