import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
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
import './LawyerPortalPages.css';

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
    <div className="portal-layout">
      <Sidebar portalType="lawyer" />

      <main className="portal-main-content">
        <div className="portal-header">
          <div className="header-title-row">
            <h1>My Verification Documents</h1>
            <StatusBadge status={advocate?.verificationStatus || user?.verificationStatus || 'PENDING'} />
          </div>
          <p>Manage and review your uploaded Bar Council Enrollment certificates, Identity proof, and academic credentials.</p>
        </div>

        {/* Verification Status Banner */}
        {isApproved ? (
          <div className="verification-banner success card" style={{ marginBottom: '1.5rem' }}>
            <div className="banner-content">
              <ShieldCheck size={28} className="banner-icon-success" />
              <div>
                <h3>Credentials Verified & Approved</h3>
                <p>All your Bar Council and legal practice verification documents have been verified by Adalat Admins.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="verification-banner warning card" style={{ marginBottom: '1.5rem' }}>
            <div className="banner-content">
              <Clock size={28} className="banner-icon-warning" />
              <div>
                <h3>Verification In Progress</h3>
                <p>Your uploaded documents are currently under manual review by the Adalat verification team. You can upload additional supporting documents below if requested.</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload New Document Card */}
        <div className="section-card card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header-row" style={{ marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#102A43' }}>
              <Upload size={18} style={{ color: '#5C5C99' }} /> Upload Supporting Verification Document
            </h3>
          </div>

          <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                Document Category
              </label>
              <select 
                className="form-control"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
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
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                Select File (PDF, PNG, JPG up to 10MB)
              </label>
              <input 
                id="lawyer-doc-upload-input"
                type="file" 
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileChange}
                className="form-control"
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <button 
                type="submit" 
                className="btn btn-gold" 
                disabled={uploading || !selectedFile}
                style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {uploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <Upload size={16} /> Upload Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="section-card card">
          <div className="card-header-row" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#102A43' }}>
              <FileCheck size={18} style={{ color: '#5C5C99' }} /> Uploaded Credentials & Proofs ({docs.length})
            </h3>
          </div>

          {loading ? (
            <LoadingState message="Loading verification documents..." />
          ) : docs.length === 0 ? (
            <EmptyState 
              icon={FileText}
              title="No Verification Documents Found"
              message="Please upload your Bar Council Enrollment certificate and law credentials using the form above."
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document Category</th>
                    <th>File Name</th>
                    <th>Uploaded Date</th>
                    <th>Verification Status</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>
                          {formatDocType(doc.documentType)}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#102A43' }}>
                          <FileText size={16} style={{ color: '#5C5C99' }} /> {doc.originalFileName || doc.fileName || 'Bar_Certificate.pdf'}
                        </span>
                      </td>
                      <td>
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Verified on Registration'}
                      </td>
                      <td>
                        <StatusBadge status={advocate?.verificationStatus || user?.verificationStatus || 'PENDING'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LawyerDocumentsPage;
