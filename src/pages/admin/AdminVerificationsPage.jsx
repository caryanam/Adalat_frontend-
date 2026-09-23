import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { 
  UserCheck, ShieldCheck, FileText, CheckCircle2, XCircle, Eye, 
  X, Award, MapPin, Briefcase, DollarSign, Globe, BookOpen, 
  RefreshCw, Search, LayoutGrid, List, AlertTriangle, Download, 
  ExternalLink, Sparkles, Check, ChevronRight, User
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminVerificationsPage = () => {
  const [pendingLawyers, setPendingLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Selection States
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Document preview state
  const [fetchedDocs, setFetchedDocs] = useState([]);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [docBlobUrl, setDocBlobUrl] = useState(null);

  const fetchPending = useCallback(() => {
    setLoading(true);
    adminApi.getPendingLawyers()
      .then(res => {
        if (res && res.data && Array.isArray(res.data)) {
          setPendingLawyers(res.data);
        } else {
          setPendingLawyers([]);
        }
      })
      .catch(() => setPendingLawyers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

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

  const handleDownloadFile = (url, fileName) => {
    if (!url) return;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.blob();
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || 'Verification_Document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        toast.success(`Downloading ${fileName || 'document'}...`);
      })
      .catch(() => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'Verification_Document.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  const handleApprove = async (lawyer) => {
    setActionLoading(true);
    try {
      await adminApi.approveLawyer(lawyer.lawyerId);
      toast.success(`Advocate ${lawyer.fullName || 'account'} APPROVED successfully! Account is now ACTIVE and visible to customers.`);
      setShowDetailsModal(false);
      setPendingLawyers(prev => prev.filter(l => l.lawyerId !== lawyer.lawyerId));
    } catch (err) {
      toast.error(err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

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
      setPendingLawyers(prev => prev.filter(l => l.lawyerId !== selectedLawyer.lawyerId));
    } catch (err) {
      toast.error(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter pending lawyers by search query
  const filteredPendingLawyers = useMemo(() => {
    if (!searchQuery.trim()) return pendingLawyers;
    const query = searchQuery.toLowerCase();
    return pendingLawyers.filter(lawyer => {
      const matchName = (lawyer.fullName || '').toLowerCase().includes(query);
      const matchEmail = (lawyer.email || '').toLowerCase().includes(query);
      const matchBar = (lawyer.barEnrollmentNumber || '').toLowerCase().includes(query);
      const matchLoc = (lawyer.location || '').toLowerCase().includes(query);
      return matchName || matchEmail || matchBar || matchLoc;
    });
  }, [pendingLawyers, searchQuery]);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="admin" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <AdminHeader 
          title="Advocate Verification Queue"
          subtitle="Review Bar Council certifications, credentials, experience, and grant platform listing permissions."
          badge={{
            text: `${pendingLawyers.length} Pending Review`,
            variant: pendingLawyers.length > 0 ? 'amber' : 'emerald',
            icon: pendingLawyers.length > 0 ? UserCheck : ShieldCheck
          }}
          actions={
            <button
              type="button"
              onClick={fetchPending}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh queue"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
              <span className="hidden sm:inline">Refresh Queue</span>
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* Executive Queue Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0d1322] via-[#111827] to-[#1e1b4b] text-white p-5 sm:p-6 shadow-xl border border-slate-800/80">
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-2xs">
                    <UserCheck size={13} className="text-amber-400" />
                    <span>Bar Council Verification Gateway</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white/10 text-slate-300 border border-white/15 backdrop-blur-xs">
                    <Sparkles size={12} className="text-amber-300" />
                    <span>1-Click Authorization</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
                  Pending Advocate Verifications ({pendingLawyers.length})
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Carefully audit the lawyer's Bar enrollment number, certificates, experience, and fee structure before approving their live listing.
                </p>
              </div>

              {/* View & Search Controls */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex items-center bg-slate-900/80 border border-slate-700/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'table' 
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Table List View"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Stats Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
                <UserCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  Applications Awaiting Review
                </h3>
                <p className="text-xs text-slate-400">
                  {filteredPendingLawyers.length} advocate{filteredPendingLawyers.length === 1 ? '' : 's'} matching current filter
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by advocate name, Bar No, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
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

          {/* Verification Cards or Table Content */}
          {loading ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-12 shadow-xs">
              <LoadingState message="Fetching pending advocate applications..." />
            </div>
          ) : filteredPendingLawyers.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-12 shadow-xs">
              <EmptyState 
                icon={ShieldCheck}
                title="No Pending Applications"
                message={
                  searchQuery 
                    ? `No applications matched "${searchQuery}". Clear your search query.` 
                    : "All advocate verification requests have been audited and resolved."
                }
              />
            </div>
          ) : viewMode === 'grid' ? (
            /* 3-Column Modern Grid Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredPendingLawyers.map(lawyer => (
                <div 
                  key={lawyer.lawyerId}
                  onClick={() => handleOpenDetails(lawyer)}
                  className="group bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                >
                  {/* Top Ambient Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all" />

                  <div>
                    {/* Header: Photo + Name + Status */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {lawyer.profilePhotoUrl ? (
                          <img 
                            src={lawyer.profilePhotoUrl} 
                            alt={lawyer.fullName} 
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-100 shadow-2xs shrink-0" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-800 to-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                            {lawyer.fullName ? lawyer.fullName.charAt(0).toUpperCase() : 'A'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 truncate text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                            {lawyer.fullName}
                          </h3>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate">
                            <MapPin size={11} className="text-slate-400" />
                            <span>{lawyer.location || 'India'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                            {lawyer.email}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0 inline-flex items-center gap-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Pending</span>
                      </span>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70 text-xs space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Bar Reg No:</span>
                        <span className="font-mono font-bold text-slate-900 px-2 py-0.5 bg-white rounded-md border border-slate-200/80 text-[11px]">
                          {lawyer.barEnrollmentNumber || 'Not Provided'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Experience:</span>
                        <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
                          <Award size={12} className="text-amber-500" />
                          <span>{lawyer.yearsOfExperience !== null && lawyer.yearsOfExperience !== undefined ? `${lawyer.yearsOfExperience} Years` : 'N/A'}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Consultation Fee:</span>
                        <span className="font-bold font-mono text-emerald-600">
                          ₹{lawyer.consultationFee || lawyer.consultationRateAmount || 99}
                        </span>
                      </div>
                    </div>

                    {/* Practice Area Badges */}
                    {lawyer.practiceAreas && lawyer.practiceAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {lawyer.practiceAreas.slice(0, 3).map((p, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                            {typeof p === 'string' ? p.replace(/_/g, ' ') : p}
                          </span>
                        ))}
                        {lawyer.practiceAreas.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                            +{lawyer.practiceAreas.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="space-y-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      onClick={() => handleOpenDetails(lawyer)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Review Details & Documents</span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleApprove(lawyer)}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-xs shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => {
                          setSelectedLawyer(lawyer);
                          setShowRejectModal(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle size={13} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* Table List View */
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[780px]">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/80 font-bold">
                      <th className="py-3.5 px-5">Advocate</th>
                      <th className="py-3.5 px-5">Bar Reg No</th>
                      <th className="py-3.5 px-5">Experience & Fee</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPendingLawyers.map(lawyer => (
                      <tr key={lawyer.lawyerId} className="hover:bg-slate-50/70 transition-colors duration-150">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-900 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                              {lawyer.fullName ? lawyer.fullName.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate text-sm">
                                {lawyer.fullName}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {lawyer.email} • {lawyer.mobileNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="font-mono text-slate-800 font-bold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 inline-block text-[11px]">
                            {lawyer.barEnrollmentNumber || 'Not Provided'}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                              <Award size={12} className="text-amber-500" />
                              <span>{lawyer.yearsOfExperience !== null && lawyer.yearsOfExperience !== undefined ? `${lawyer.yearsOfExperience} Yrs` : 'N/A'}</span>
                            </span>
                            <div className="font-bold text-emerald-600 font-mono text-[11px]">
                              ₹{lawyer.consultationFee || lawyer.consultationRateAmount || 99}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Pending Review</span>
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(lawyer)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <Eye size={13} />
                              <span>Review</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApprove(lawyer)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              <CheckCircle2 size={13} />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLawyer(lawyer);
                                setShowRejectModal(true);
                              }}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
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

        {/* Detailed Verification & Documents Review Modal */}
        {showDetailsModal && selectedLawyer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
              
              {/* Modal Top Header */}
              <div className="bg-gradient-to-r from-[#0d1322] via-[#111827] to-[#1e1b4b] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  {selectedLawyer.profilePhotoUrl ? (
                    <img 
                      src={selectedLawyer.profilePhotoUrl} 
                      alt={selectedLawyer.fullName} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-400/40 shadow-md shrink-0" 
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
                      {selectedLawyer.education || 'LL.B, Law Degree'}
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
                    <span>Professional Bio & Summary</span>
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
                    <span>Uploaded Verification Documents ({fetchedDocs.length})</span>
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
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={fileUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>Open Preview</span>
                                    <ExternalLink size={12} />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(fileUrl, fileName)}
                                    className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download size={12} />
                                    <span>Download</span>
                                  </button>
                                </div>
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
                                <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1">
                                  <span>View Document File</span>
                                  <ExternalLink size={13} />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
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

export default AdminVerificationsPage;
