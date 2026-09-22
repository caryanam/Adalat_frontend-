import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { UserCheck, ShieldCheck, FileText, CheckCircle, XCircle, Eye, X, Award, MapPin, Briefcase, DollarSign, Globe, BookOpen, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import './AdminPortalPages.css';

const AdminVerificationsPage = () => {
  const [pendingLawyers, setPendingLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [fetchedDocs, setFetchedDocs] = useState([]);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [docBlobUrl, setDocBlobUrl] = useState(null);

  const fetchPending = () => {
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
  };

  useEffect(() => {
    fetchPending();
  }, []);

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

  const handleApprove = async (lawyerId) => {
    setActionLoading(true);
    setMsg('');
    try {
      await adminApi.approveLawyer(lawyerId);
      const successMsg = `Advocate ${selectedLawyer?.fullName || lawyerId} successfully APPROVED! Account is now ACTIVE and visible to customers.`;
      setMsg(successMsg);
      toast.success(successMsg);
      setShowDetailsModal(false);
      fetchPending();
    } catch (err) {
      const errMsg = err.message || 'Approval failed.';
      setMsg(errMsg);
      toast.error(errMsg);
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
      const rejectMsg = `Lawyer application for ${selectedLawyer.fullName} REJECTED.`;
      setMsg(rejectMsg);
      toast.info(rejectMsg);
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setRejectionReason('');
      fetchPending();
    } catch (err) {
      const errMsg = err.message || 'Rejection failed.';
      setMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="portal-layout">
      <Sidebar portalType="admin" />

      <main className="portal-main-content">
        <AdminHeader 
          title="Lawyer Verification Management"
          subtitle="Review advocate Bar Council certificates, credentials, bio, and approve accounts for customer listing."
          badge={{
            text: `${pendingLawyers.length} Pending Review`,
            variant: pendingLawyers.length > 0 ? 'amber' : 'emerald',
            icon: UserCheck
          }}
          actions={
            <button
              type="button"
              onClick={fetchPending}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh verifications"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          }
        />

        {msg && (
          <div className="admin-alert-banner card" style={{ marginBottom: '1.25rem' }}>
            <CheckCircle size={18} /> {msg}
          </div>
        )}

        {loading ? (
          <div className="section-card card">
            <LoadingState message="Fetching pending advocate verification requests..." />
          </div>
        ) : pendingLawyers.length === 0 ? (
          <div className="section-card card">
            <EmptyState 
              icon={ShieldCheck}
              title="No Pending Applications"
              message="There are currently no pending advocate verification applications awaiting admin review."
            />
          </div>
        ) : (
          /* 3-Column Advocate Cards Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {pendingLawyers.map(lawyer => (
              <div 
                key={lawyer.lawyerId}
                className="card"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E2E8F0',
                  padding: '1.25rem',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.25s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
                onClick={() => handleOpenDetails(lawyer)}
              >
                <div>
                  {/* Card Top Row: Avatar + Name + Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {lawyer.profilePhotoUrl ? (
                        <img src={lawyer.profilePhotoUrl} alt={lawyer.fullName} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #1C1C4A' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#1C1C4A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.15rem' }}>
                          {lawyer.fullName ? lawyer.fullName.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1C1C4A', fontWeight: 700 }}>{lawyer.fullName}</h3>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                          <MapPin size={12} /> {lawyer.location || 'India'}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={lawyer.verificationStatus || 'PENDING'} />
                  </div>

                  {/* Card Quick Info Box */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '12px', fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Bar Reg No:</span>
                      <strong style={{ color: '#1C1C4A' }}>{lawyer.barEnrollmentNumber || 'Not Provided'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Experience:</span>
                      <span style={{ fontWeight: 600 }}>{lawyer.yearsOfExperience !== null && lawyer.yearsOfExperience !== undefined ? `${lawyer.yearsOfExperience} Yrs` : 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Consultation Fee:</span>
                      <span style={{ fontWeight: 700, color: '#10B981' }}>₹{lawyer.consultationFee || lawyer.consultationRateAmount || 99}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <button 
                  className="btn"
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    padding: '0.65rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    background: '#1C1C4A',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => { e.stopPropagation(); handleOpenDetails(lawyer); }}
                >
                  <Eye size={16} /> Review Details & Documents
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Full Details & Documents Review Modal */}
        {showDetailsModal && selectedLawyer && (
          <div className="payment-modal-overlay">
            <div className="payment-modal-card" style={{ maxWidth: '820px', width: '95%', padding: '0', overflow: 'hidden', borderRadius: '18px' }}>
              {/* Modal Header */}
              <div style={{ background: '#1C1C4A', padding: '1.25rem 1.5rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {selectedLawyer.profilePhotoUrl ? (
                    <img src={selectedLawyer.profilePhotoUrl} alt={selectedLawyer.fullName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #CCCCFF' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#5C5C99', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                      {selectedLawyer.fullName ? selectedLawyer.fullName.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#FFFFFF', fontFamily: "'Cinzel', serif" }}>
                      {selectedLawyer.fullName}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#CCCCFF' }}>
                      Bar Reg: <strong>{selectedLawyer.barEnrollmentNumber || 'D/2491/2012'}</strong> • {selectedLawyer.location || 'New Delhi'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto', background: '#F8FAFC' }}>
                {/* Details 2-Column Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <Briefcase size={13} /> Years of Experience
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1C1C4A' }}>
                      {selectedLawyer.yearsOfExperience !== null && selectedLawyer.yearsOfExperience !== undefined ? `${selectedLawyer.yearsOfExperience} Years` : 'N/A'}
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <DollarSign size={13} /> Consultation Fee
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10B981' }}>
                      ₹{selectedLawyer.consultationFee || selectedLawyer.consultationRateAmount || 99} / Consultation
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <Award size={13} /> Education & Qualification
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1C1C4A' }}>
                      {selectedLawyer.education || 'LL.B, Delhi University'}
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <Globe size={13} /> UPI ID Payout
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1C1C4A' }}>
                      <code>{selectedLawyer.upiId || 'advocate@upi'}</code>
                    </div>
                  </div>
                </div>

                {/* Professional Bio */}
                <div style={{ background: '#FFFFFF', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem', color: '#1C1C4A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BookOpen size={15} style={{ color: '#1C1C4A' }} /> Professional Bio & Summary
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>
                    {selectedLawyer.bio || 'Practicing legal advocate with extensive courtroom representation and success rates.'}
                  </p>
                </div>

                {/* Practice Areas & Languages */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748B' }}>Practice Areas</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {selectedLawyer.practiceAreas && selectedLawyer.practiceAreas.length > 0 ? (
                        selectedLawyer.practiceAreas.map((p, i) => (
                          <span key={i} className="mini-tag" style={{ background: '#F0F0FC', color: '#1C1C4A' }}>{typeof p === 'string' ? p.replace('_', ' ') : p}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Criminal Law, Civil Law</span>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748B' }}>Languages Spoken</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {selectedLawyer.languages && selectedLawyer.languages.length > 0 ? (
                        selectedLawyer.languages.map((l, i) => (
                          <span key={i} className="mini-tag" style={{ background: '#ECFDF5', color: '#065F46' }}>{typeof l === 'string' ? l.replace('_', ' ') : l}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>English, Hindi</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div style={{ background: '#FFFFFF', padding: '1.15rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#1C1C4A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={16} /> Uploaded Verification Documents ({fetchedDocs.length})
                  </h4>

                  {fetchedDocs.length > 0 ? (
                    <div>
                      {/* Document Tabs */}
                      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.3rem' }}>
                        {fetchedDocs.map((doc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveDocIndex(idx)}
                            style={{
                              background: activeDocIndex === idx ? '#1C1C4A' : '#F1F5F9',
                              color: activeDocIndex === idx ? '#FFFFFF' : '#334155',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Doc #{idx + 1}: {doc.documentType || doc.name || 'Certificate'}
                          </button>
                        ))}
                      </div>

                      {/* Embedded File Viewer */}
                      {(() => {
                        const currentDoc = fetchedDocs[activeDocIndex] || fetchedDocs[0];
                        const fileUrl = currentDoc ? (currentDoc.fileUrl || currentDoc.file_url || currentDoc.dataUrl || (currentDoc.filePath ? `http://localhost:8082/uploads/lawyers/${currentDoc.filePath}` : null)) : null;
                        const fileName = currentDoc ? (currentDoc.originalFilename || currentDoc.original_filename || currentDoc.fileName || currentDoc.name || currentDoc.documentType || 'Document.pdf') : 'Document';
                        const fileType = currentDoc ? (currentDoc.fileType || currentDoc.file_type || currentDoc.type || (fileUrl && fileUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')) : '';

                        const isPdf = fileType.includes('pdf') || (fileUrl && fileUrl.toLowerCase().includes('.pdf'));
                        const isImage = fileType.includes('image') || (fileUrl && (fileUrl.toLowerCase().includes('.jpg') || fileUrl.toLowerCase().includes('.png') || fileUrl.toLowerCase().includes('.jpeg')));

                        return (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                              <span style={{ fontWeight: 600, color: '#1C1C4A' }}>{fileName}</span>
                              {fileUrl && (
                                <div style={{ display: 'flex', gap: '0.6rem' }}>
                                  <a 
                                    href={fileUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', background: '#EFF6FF', padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}
                                  >
                                    Open Preview ↗
                                  </a>
                                  <button 
                                    type="button"
                                    onClick={() => handleDownloadFile(fileUrl, fileName)}
                                    style={{ color: '#059669', fontWeight: 700, textDecoration: 'none', background: '#ECFDF5', padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid #A7F3D0', cursor: 'pointer' }}
                                  >
                                    Download File 📥
                                  </button>
                                </div>
                              )}
                            </div>

                            {isPdf ? (
                              <div style={{ width: '100%', height: '360px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #CBD5E1', background: '#FFFFFF' }}>
                                <object data={docBlobUrl || fileUrl} type="application/pdf" width="100%" height="100%">
                                  <embed src={docBlobUrl || fileUrl} type="application/pdf" width="100%" height="100%" />
                                </object>
                              </div>
                            ) : isImage ? (
                              <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '10px' }}>
                                <img src={docBlobUrl || fileUrl} alt={fileName} style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }} />
                              </div>
                            ) : (
                              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', textAlign: 'center' }}>
                                <a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                                  View Document File ↗
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: '#64748B', fontStyle: 'italic', padding: '0.5rem 0' }}>
                      No verification documents attached yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div style={{ padding: '1.15rem 1.5rem', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => setShowDetailsModal(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
                  Close
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => { setSelectedLawyer(selectedLawyer); setShowRejectModal(true); }} 
                    className="btn btn-danger"
                    disabled={actionLoading}
                    style={{ padding: '0.55rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <XCircle size={16} /> Reject Application
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedLawyer.lawyerId)} 
                    className="btn btn-gold"
                    disabled={actionLoading}
                    style={{ padding: '0.55rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#10B981', color: '#FFFFFF', border: 'none' }}
                  >
                    <CheckCircle size={16} /> Approve Advocate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '16px' }}>
              <h3 style={{ marginTop: 0, color: '#1C1C4A' }}>Reject Lawyer Application</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Advocate: <strong>{selectedLawyer?.fullName}</strong></p>
              <form onSubmit={handleRejectSubmit} className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Rejection Reason <span className="required">*</span></label>
                <textarea 
                  className="form-textarea" 
                  rows="3" 
                  placeholder="e.g. Invalid Bar Council Enrollment certificate or incomplete document details..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required 
                ></textarea>
                <div className="modal-actions-row" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowRejectModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-danger flex-1" disabled={actionLoading}>Confirm Rejection</button>
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
