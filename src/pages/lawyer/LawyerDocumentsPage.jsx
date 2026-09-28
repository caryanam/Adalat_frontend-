import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import LawyerHeader from '../../components/LawyerHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { lawyerApi } from '../../api/lawyerApi';
import { toast } from 'react-toastify';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  Upload, 
  FileCheck,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  ExternalLink,
  X,
  Image,
  Sparkles
} from 'lucide-react';

const LawyerDocumentsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState('BAR_COUNCIL_CERTIFICATE');
  const [selectedFile, setSelectedFile] = useState(null);

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchProfile = () => {
    const lawyerId = user?.lawyerId || user?.id;
    if (lawyerId) {
      setLoading(true);
      lawyerApi.getLawyerById(lawyerId)
        .then(res => {
          if (res && res.data) {
            const data = res.data.data || res.data;
            setProfile(data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warning('Please select a document file to upload');
      return;
    }

    const lawyerId = user?.lawyerId || user?.id;
    if (!lawyerId) {
      toast.error('Unable to identify advocate account');
      return;
    }

    try {
      setUploading(true);
      await lawyerApi.uploadDocument(lawyerId, documentType, selectedFile);
      toast.success('Document uploaded successfully!');
      setSelectedFile(null);
      const fileInput = document.getElementById('lawyer-doc-upload-input');
      if (fileInput) fileInput.value = '';
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const advocate = profile || user || {};
  const isApproved = advocate?.verificationStatus === 'APPROVED' || advocate?.accountStatus === 'ACTIVE';

  // Build document list from API or local storage registered docs
  let docs = [];
  if (Array.isArray(advocate.documents) && advocate.documents.length > 0) {
    docs = [...advocate.documents];
  } else if (Array.isArray(advocate.lawyerDocuments) && advocate.lawyerDocuments.length > 0) {
    docs = [...advocate.lawyerDocuments];
  }

  if (docs.length === 0) {
    try {
      const lawyerId = user?.lawyerId || user?.id;
      const stored = localStorage.getItem(`adalat_lawyer_docs_${lawyerId}`) || localStorage.getItem('adalat_latest_lawyer_docs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.barCert) docs.push({ ...parsed.barCert, documentType: 'BAR_COUNCIL_CERTIFICATE' });
        if (parsed.enrollmentCert) docs.push({ ...parsed.enrollmentCert, documentType: 'ENROLLMENT_CERTIFICATE' });
        if (parsed.photo) docs.push({ ...parsed.photo, documentType: 'PHOTO' });
        if (parsed.idProof) docs.push({ ...parsed.idProof, documentType: 'ID_PROOF' });
        if (parsed.degreeCert) docs.push({ ...parsed.degreeCert, documentType: 'DEGREE_CERTIFICATE' });
      }
    } catch (e) {}
  }

  if (docs.length === 0) {
    if (advocate.profilePhotoUrl) {
      docs.push({
        documentType: 'PHOTO',
        fileName: 'profile_photo.png',
        originalFileName: 'profile_photo.png',
        fileUrl: advocate.profilePhotoUrl,
        createdAt: advocate.createdAt
      });
    }
    if (advocate.barCertificateUrl || advocate.barCertificatePath) {
      docs.push({
        documentType: 'BAR_COUNCIL_CERTIFICATE',
        fileName: 'bar_council_certificate.pdf',
        originalFileName: 'bar_council_certificate.pdf',
        fileUrl: advocate.barCertificateUrl || advocate.barCertificatePath,
        createdAt: advocate.createdAt
      });
    }
  }

  const formatDocType = (type) => {
    if (!type) return 'Bar Council Certificate';
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatDocUrl = (doc) => {
    if (!doc) return null;
    const rawUrl = doc.fileUrl || doc.file_url || doc.dataUrl || (doc.filePath ? (doc.filePath.startsWith('http') ? doc.filePath : `http://localhost:8082/uploads/lawyers/${doc.filePath}`) : null);
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const url = rawUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `http://localhost:8082${cleanPath}`;
  };

  const isImageFile = (doc, url) => {
    const name = (doc?.fileName || doc?.originalFileName || '').toLowerCase();
    const u = (url || '').toLowerCase();
    const type = (doc?.fileType || '').toLowerCase();
    return type.includes('image') || 
           name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp') || name.endsWith('.svg') ||
           u.includes('.png') || u.includes('.jpg') || u.includes('.jpeg') || u.includes('.webp') || u.startsWith('data:image/');
  };

  const isPdfFile = (doc, url) => {
    const name = (doc?.fileName || doc?.originalFileName || '').toLowerCase();
    const u = (url || '').toLowerCase();
    const type = (doc?.fileType || '').toLowerCase();
    return type.includes('pdf') || name.endsWith('.pdf') || u.includes('.pdf') || u.startsWith('data:application/pdf');
  };

  const handlePreviewDoc = (doc) => {
    setPreviewDoc(doc);
    setShowPreviewModal(true);
  };

  const handleDownloadDoc = (url, fileName) => {
    if (!url) return;
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'verification_document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${fileName || 'document'}...`);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="lawyer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <LawyerHeader 
          title="Verification Documents"
          subtitle="Manage and review your uploaded Bar Council Enrollment certificates, Identity proof, and credentials."
          badge={{ 
            text: advocate?.verificationStatus || user?.verificationStatus || 'PENDING', 
            variant: isApproved ? 'success' : 'amber',
            icon: isApproved ? ShieldCheck : Clock
          }}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Verification Status Banner */}
          {isApproved ? (
            <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-4 sm:p-5 shadow-sm flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-emerald-900 leading-tight">
                  Credentials Verified &amp; Approved
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800/90 mt-0.5 font-normal">
                  All your Bar Council and legal practice verification documents have been verified by Adalat Admins.
                </p>
              </div>
            </div>
          ) : advocate?.verificationStatus === 'REJECTED' ? (
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-rose-50/80 to-red-50 border-2 border-rose-300 p-5 sm:p-6 shadow-md flex items-start gap-4 animate-in fade-in duration-150">
              <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-rose-950">
                    Document Verification Rejected by Admin
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                    Re-upload Required
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-rose-900/90 font-normal">
                  Please upload a clear, authentic copy of your document addressing the admin's feedback below:
                </p>
                <div className="bg-white/95 rounded-xl p-3 border border-rose-200/90 shadow-2xs mt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-0.5">
                    Admin Feedback:
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    "{advocate?.rejectionReason || 'Uploaded Bar Council certificate was unclear or invalid. Please upload a clear photo or PDF.'}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 sm:p-5 shadow-sm flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-amber-900 leading-tight">
                  Verification In Progress
                </h3>
                <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5 font-normal">
                  Your uploaded documents are currently under manual review by the Adalat verification team. You can upload additional supporting documents below if requested.
                </p>
              </div>
            </div>
          )}

          {/* Upload New Document Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Upload size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Upload Supporting Verification Document
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit Bar certificates, degrees, or government identity proofs
                </p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block font-semibold text-xs text-slate-700 mb-1.5">
                  Document Category
                </label>
                <select 
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                >
                  <option value="BAR_COUNCIL_CERTIFICATE">Bar Council Enrollment Certificate (Sanad)</option>
                  <option value="ENROLLMENT_CERTIFICATE">Bar Enrollment Certificate</option>
                  <option value="DEGREE_CERTIFICATE">LL.B / Law Degree Certificate</option>
                  <option value="ID_PROOF">Identity Proof (Aadhar / PAN Card)</option>
                  <option value="ADDRESS_PROOF">Address Proof</option>
                  <option value="PROFESSIONAL_DOCUMENT">Bar Association Membership ID / Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-xs text-slate-700 mb-1.5">
                  Select File (PDF, PNG, JPG up to 10MB)
                </label>
                <input 
                  id="lawyer-doc-upload-input"
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs bg-slate-50 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={uploading || !selectedFile}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:from-slate-200 disabled:to-slate-200 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:shadow-none cursor-pointer"
                >
                  {uploading ? (
                    <span>Uploading...</span>
                  ) : (
                    <>
                      <Upload size={15} />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <FileCheck size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Uploaded Credentials & Proofs ({docs.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your submitted proof files registered with your advocate ID
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12">
                <LoadingState message="Loading verification documents..." />
              </div>
            ) : docs.length === 0 ? (
              <div className="py-12 px-4">
                <EmptyState 
                  icon={FileText}
                  title="No Verification Documents Found"
                  message="Please upload your Bar Council Enrollment certificate and law credentials using the form above."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-3.5 px-5">Document Category</th>
                      <th className="py-3.5 px-4">File Name</th>
                      <th className="py-3.5 px-4">Uploaded Date</th>
                      <th className="py-3.5 px-4 text-center">Verification Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {docs.map((doc, idx) => {
                      const docUrl = formatDocUrl(doc);
                      const isImg = isImageFile(doc, docUrl);
                      const docName = doc.originalFileName || doc.fileName || 'verification_document';

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="py-3.5 px-5 font-semibold text-slate-900">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-semibold capitalize">
                              {formatDocType(doc.documentType)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-900">
                            <button 
                              type="button"
                              onClick={() => handlePreviewDoc(doc)}
                              className="inline-flex items-center gap-2 text-slate-800 hover:text-indigo-600 transition-colors text-left group-hover:underline cursor-pointer"
                            >
                              {isImg ? (
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden shrink-0">
                                  {docUrl ? (
                                    <img src={docUrl} alt="preview thumbnail" className="w-full h-full object-cover" />
                                  ) : (
                                    <Image size={15} />
                                  )}
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                  <FileText size={15} />
                                </div>
                              )}
                              <span className="truncate max-w-[200px] sm:max-w-xs">{docName}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Verified on Registration'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <StatusBadge status={advocate?.verificationStatus || user?.verificationStatus || 'PENDING'} />
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handlePreviewDoc(doc)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 font-semibold text-xs transition-all cursor-pointer shadow-2xs active:scale-95"
                                title="Preview Document"
                              >
                                <Eye size={14} className="text-indigo-600" />
                                <span>Preview</span>
                              </button>
                              {docUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadDoc(docUrl, docName)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Download Document"
                                >
                                  <Download size={15} />
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

        {/* Document Preview Modal */}
        {showPreviewModal && previewDoc && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPreviewModal(false);
                setPreviewDoc(null);
              }
            }}
          >
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    {isImageFile(previewDoc, formatDocUrl(previewDoc)) ? <Image size={18} /> : <FileText size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {previewDoc.originalFileName || previewDoc.fileName || 'Document Preview'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                        {formatDocType(previewDoc.documentType)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      Uploaded on {previewDoc.createdAt ? new Date(previewDoc.createdAt).toLocaleString() : 'Registration'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {formatDocUrl(previewDoc) && (
                    <>
                      <a
                        href={formatDocUrl(previewDoc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(formatDocUrl(previewDoc), previewDoc.originalFileName || previewDoc.fileName)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
                        title="Download Document"
                      >
                        <Download size={16} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowPreviewModal(false);
                      setPreviewDoc(null);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer ml-1"
                    title="Close preview"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body / Viewer */}
              <div className="flex-1 overflow-auto bg-slate-950/5 p-4 sm:p-6 flex items-center justify-center min-h-[360px] max-h-[calc(90vh-140px)]">
                {(() => {
                  const url = formatDocUrl(previewDoc);
                  const isImg = isImageFile(previewDoc, url);
                  const isPdf = isPdfFile(previewDoc, url);

                  if (!url) {
                    return (
                      <div className="text-center p-8 max-w-sm">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3">
                          <FileText size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Document File Recorded</h4>
                        <p className="text-xs text-slate-500 mb-4">
                          This document was submitted during onboarding. To view or replace it, please re-upload a fresh copy using the form above.
                        </p>
                      </div>
                    );
                  }

                  if (isImg) {
                    return (
                      <div className="max-w-full max-h-full flex items-center justify-center">
                        <img 
                          src={url} 
                          alt="Document Preview" 
                          className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-200 bg-white"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div class="text-center p-8 bg-white rounded-xl border border-slate-200 shadow-sm max-w-md">
                                <p class="text-sm font-semibold text-slate-700 mb-2">Unable to display image directly.</p>
                                <a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                                  <span>Open File in Browser</span>
                                </a>
                              </div>
                            `;
                          }}
                        />
                      </div>
                    );
                  }

                  if (isPdf) {
                    return (
                      <div className="w-full h-[65vh] rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white">
                        <iframe 
                          src={url} 
                          title="PDF Preview" 
                          className="w-full h-full border-0"
                        />
                      </div>
                    );
                  }

                  // Other file formats (e.g. doc, docx, etc.)
                  return (
                    <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                        <FileText size={28} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">{previewDoc.originalFileName || previewDoc.fileName || 'Uploaded Document'}</h4>
                      <p className="text-xs text-slate-500 mb-5">
                        This document type cannot be rendered inline in the browser preview. You can open it in a new window or download it.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <ExternalLink size={14} />
                          <span>Open File</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(url, previewDoc.originalFileName || previewDoc.fileName)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Verified Adalat Legal Document Record</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewDoc(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LawyerDocumentsPage;
