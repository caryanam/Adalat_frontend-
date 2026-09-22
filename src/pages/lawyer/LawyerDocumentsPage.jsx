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
  FileCheck 
} from 'lucide-react';

const LawyerDocumentsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState('BAR_COUNCIL_CERTIFICATE');
  const [selectedFile, setSelectedFile] = useState(null);

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
  const docs = Array.isArray(advocate.documents) ? advocate.documents : [];

  const formatDocType = (type) => {
    if (!type) return 'Bar Council Certificate';
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
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
                  Credentials Verified & Approved
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800/90 mt-0.5 font-normal">
                  All your Bar Council and legal practice verification documents have been verified by Adalat Admins.
                </p>
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
                      <th className="py-3.5 px-5 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {docs.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-semibold capitalize">
                            {formatDocType(doc.documentType)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <span className="inline-flex items-center gap-1.5 text-slate-800">
                            <FileText size={15} className="text-indigo-600 shrink-0" />
                            <span>{doc.originalFileName || doc.fileName || 'Bar_Certificate.pdf'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Verified on Registration'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <StatusBadge status={advocate?.verificationStatus || user?.verificationStatus || 'PENDING'} />
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

export default LawyerDocumentsPage;
