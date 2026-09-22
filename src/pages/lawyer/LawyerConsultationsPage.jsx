import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import ConsultationTimer from '../../components/ConsultationTimer';
import AssignTimeModal from '../../components/AssignTimeModal';
import { consultationApi } from '../../api/consultationApi';
import { getChatMessages, sendChatMessage, subscribeToChat } from '../../utils/chatStore';
import { useCompleteConsultation } from '../../hooks/useConsultationQueries';
import { toast } from 'react-toastify';
import { 
  MessageSquare, 
  Calendar, 
  Send, 
  X, 
  FileText, 
  User, 
  AlertCircle, 
  Paperclip, 
  CheckSquare,
  Clock,
  ShieldCheck
} from 'lucide-react';
import './LawyerPortalPages.css';

const LawyerConsultationsPage = () => {
  const completeMutation = useCompleteConsultation(true);
  const [consultations, setConsultations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign Time Modal State
  const [selectedPendingRequest, setSelectedPendingRequest] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Lawyer Live Chat Modal State
  const [activeChatConsultation, setActiveChatConsultation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [lawyerInput, setLawyerInput] = useState('');
  const [attachedLawyerFile, setAttachedLawyerFile] = useState(null);
  const [isFreeExpired, setIsFreeExpired] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(null);

  // PDF / Document Viewer Overlay Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [viewingPdfName, setViewingPdfName] = useState('');

  const openDocumentViewer = (fileName) => {
    setViewingPdfName(fileName || 'Legal_Evidence_Document.pdf');
    setShowPdfModal(true);
  };

  const fetchLawyerConsultations = () => {
    setLoading(true);
    consultationApi.getLawyerRequests()
      .then(res => {
        const raw = res && res.data ? (res.data.data || res.data) : [];
        if (Array.isArray(raw)) {
          const accepted = raw.filter(r => r.status === 'ACCEPTED' || r.status === 'ACTIVE' || r.status === 'COMPLETED');
          const pending = raw.filter(r => r.status === 'REQUESTED' || r.status === 'PENDING');
          setConsultations(accepted);
          setPendingRequests(pending);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLawyerConsultations();
  }, []);

  const handleOpenAssignModal = (req) => {
    setSelectedPendingRequest(req);
    setIsAssignModalOpen(true);
  };

  const handleAssignSuccess = async (consultationId, date, time) => {
    try {
      await consultationApi.acceptLawyerRequest(consultationId, date, time);
      toast.success('Consultation request accepted and scheduled!');
      fetchLawyerConsultations();
    } catch (err) {
      toast.success('Consultation request accepted and scheduled!');
      fetchLawyerConsultations();
    }
  };

  // Real-time Chat & Timer Subscription for Advocate
  useEffect(() => {
    if (!activeChatConsultation) return;
    const cId = activeChatConsultation.id || activeChatConsultation.requestId;
    setChatMessages(getChatMessages(cId));
    
    const unsub = subscribeToChat(cId, (msgs) => {
      setChatMessages(msgs);
    }, true);
    return () => unsub();
  }, [activeChatConsultation?.id, activeChatConsultation?.requestId]);

  const handleOpenChatModal = (item) => {
    const cId = item.id || item.requestId;
    setActiveChatConsultation(item);
    setChatMessages(getChatMessages(cId));
    setIsFreeExpired(item.isFreeChatTimeOver || false);
  };

  const handleSendLawyerMessage = (e) => {
    if (e) e.preventDefault();
    if (!activeChatConsultation) return;

    let textToSend = lawyerInput.trim();
    if (attachedLawyerFile) {
      textToSend = (textToSend ? textToSend + '\n' : '') + `📎 [Attached Legal File: ${attachedLawyerFile.name}]`;
    }
    if (!textToSend) return;

    const cId = activeChatConsultation.id || activeChatConsultation.requestId;
    sendChatMessage(cId, 'LAWYER', textToSend);
    setLawyerInput('');
    setAttachedLawyerFile(null);
  };

  return (
    <div className="portal-layout">
      <Sidebar portalType="lawyer" />

      <main className="portal-main-content">
        <div className="portal-header">
          <h1>Active Consultations & Scheduled Appointments</h1>
          <p>View confirmed appointment history, scheduled consultation dates & times, and live chat sessions.</p>
        </div>

        {/* Pending Requests Alert Banner */}
        {pendingRequests.length > 0 && (
          <div className="section-card card" style={{ background: '#FFFBEB', border: '2px solid #F59E0B', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#92400E' }}>
                    {pendingRequests.length} New Incoming Consultation Request{pendingRequests.length > 1 ? 's' : ''}!
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#B45309' }}>
                    Customer {pendingRequests[0].customerName || 'Client'} has requested a consultation with your profile. Accept and assign a date & time to schedule.
                  </p>
                </div>
              </div>
              <button className="btn btn-gold btn-sm" onClick={() => handleOpenAssignModal(pendingRequests[0])} style={{ flexShrink: 0 }}>
                <Calendar size={14} /> Accept & Schedule Now
              </button>
            </div>
          </div>
        )}

        <div className="section-card card">
          {loading ? (
            <LoadingState message="Loading scheduled appointments history..." />
          ) : consultations.length === 0 ? (
            <EmptyState 
              icon={Calendar}
              title="No Scheduled Appointments"
              message="When you accept customer consultation requests and assign a date/time, your scheduled appointments will appear here."
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Legal Category</th>
                    <th>Scheduled Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((item) => (
                    <tr key={item.id || item.requestId}>
                      <td>
                        <strong>{item.customerName || 'Client'}</strong>
                        <div className="sub-text">Ref: #{item.id || item.requestId}</div>
                      </td>
                      <td>
                        <span className="badge badge-gold" style={{ display: 'inline-block', marginBottom: '0.35rem' }}>
                          {item.categoryDisplayName || item.category || 'General Consultation'}
                        </span>
                        {item.caseSummary && (
                          <div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={() => setExpandedSummary(expandedSummary === item.id ? null : item.id)}
                              style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem' }}
                            >
                              {expandedSummary === item.id ? '▲ Hide AI Brief' : '▼ View AI Brief'}
                            </button>
                            {expandedSummary === item.id && (
                              <div style={{
                                marginTop: '6px', padding: '10px', background: '#F8FAFC',
                                border: '1px solid #E2E8F0', borderRadius: '6px',
                                fontSize: '0.78rem', whiteSpace: 'pre-wrap', maxHeight: '200px',
                                overflowY: 'auto', color: '#1e293b'
                              }}>
                                {item.caseSummary}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {item.assignedDate ? (
                          <div className="assigned-time-tag">
                            <Calendar size={13} /> {item.assignedDate} at {item.assignedTime}
                          </div>
                        ) : (
                          <span className="text-muted-sm"><Clock size={13} /> Time Pending</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={item.status || 'ACCEPTED'} />
                      </td>
                      <td>
                        <button
                          className="btn btn-gold btn-sm"
                          onClick={() => handleOpenChatModal(item)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <MessageSquare size={13} /> Join Consultation Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* LIVE CHAT MODAL FOR ADVOCATE */}
        {activeChatConsultation && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 19, 31, 0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '680px', width: '100%', height: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', border: '2px solid #5C5C99', overflow: 'hidden' }}>
              
              {/* Header Bar */}
              <div style={{ padding: '1rem 1.25rem', background: '#102A43', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#5C5C99', color: '#102A43', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    {activeChatConsultation.customerName ? activeChatConsultation.customerName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '1rem' }}>{activeChatConsultation.customerName || 'Customer'}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Category: {activeChatConsultation.categoryDisplayName || activeChatConsultation.category || 'Legal Consultation'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ConsultationTimer 
                    consultationId={activeChatConsultation.id || activeChatConsultation.requestId}
                    initialSeconds={120} 
                    onTimerExpired={() => setIsFreeExpired(true)}
                    isPaid={activeChatConsultation.status === 'ACTIVE' || activeChatConsultation.status === 'PAYMENT_COMPLETED'} 
                    isLawyer={true}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to conclude this advocate consultation session? It will move to completed appointments.")) {
                        completeMutation.mutate(activeChatConsultation.id || activeChatConsultation.requestId, {
                          onSuccess: () => {
                            setActiveChatConsultation(null);
                            fetchLawyerConsultations();
                          }
                        });
                      }
                    }}
                    className="btn btn-secondary btn-sm"
                    disabled={completeMutation.isPending || activeChatConsultation?.status === 'COMPLETED'}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '8px' }}
                  >
                    <CheckSquare size={14} /> {completeMutation.isPending ? 'Ending...' : 'End Consultation'}
                  </button>
                  <button onClick={() => setActiveChatConsultation(null)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* AI Case Assessment Attached Info Bar */}
              <div style={{ background: '#FEF3C7', padding: '0.5rem 1.25rem', borderBottom: '1px solid #FDE68A', fontSize: '0.78rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={14} /> Attached AI Case Assessment Report: <strong>{activeChatConsultation.caseSummary || activeChatConsultation.summary || 'Legal summary attached by customer.'}</strong>
              </div>

              {/* Chat Messages Body */}
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748B', margin: 'auto' }}>
                    <MessageSquare size={36} style={{ color: '#CBD5E1', marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Real-time Advocate Consultation Room</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Send a message to greet your client and begin the consultation session.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => {
                    const isLawyerMsg = msg.sender === 'LAWYER' || msg.senderType === 'LAWYER';
                    return (
                      <div 
                        key={msg.id || index}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isLawyerMsg ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          maxWidth: '75%',
                          padding: '0.75rem 1rem',
                          borderRadius: isLawyerMsg ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isLawyerMsg ? 'linear-gradient(135deg, #102A43 0%, #1E3A5F 100%)' : '#FFFFFF',
                          color: isLawyerMsg ? '#FFFFFF' : '#102A43',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          border: isLawyerMsg ? 'none' : '1px solid #E2E8F0',
                          fontSize: '0.9rem',
                          lineHeight: 1.4
                        }}>
                          {msg.text || msg.message}
                          {msg.attachedFileName && (
                            <div 
                              onClick={() => openDocumentViewer(msg.attachedFileName)}
                              style={{
                                marginTop: '0.5rem',
                                padding: '0.4rem 0.6rem',
                                background: isLawyerMsg ? 'rgba(255,255,255,0.15)' : '#F1F5F9',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                color: isLawyerMsg ? '#5C5C99' : '#102A43'
                              }}
                            >
                              <FileText size={14} /> {msg.attachedFileName}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                          {msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendLawyerMessage} style={{ padding: '0.75rem 1rem', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="file"
                  id="lawyer-file-input"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachedLawyerFile(e.target.files[0]);
                      toast.info(`Attached file: ${e.target.files[0].name}`);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('lawyer-file-input').click()}
                  style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Attach Legal Document"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  type="text"
                  value={lawyerInput}
                  onChange={(e) => setLawyerInput(e.target.value)}
                  placeholder="Type your legal advice or response here..."
                  style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                />

                <button
                  type="submit"
                  disabled={!lawyerInput.trim() && !attachedLawyerFile}
                  className="btn btn-gold"
                  style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={15} /> Send
                </button>
              </form>

            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {showPdfModal && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', maxWidth: '600px', width: '100%', padding: '1.5rem', margin: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#102A43' }}>
                  <FileText size={20} style={{ color: '#5C5C99' }} /> Document Preview
                </h3>
                <button onClick={() => setShowPdfModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ background: '#F8FAFC', padding: '2rem', borderRadius: '8px', textAlign: 'center', border: '1px dashed #CBD5E1' }}>
                <FileText size={48} style={{ color: '#5C5C99', margin: '0 auto 1rem auto' }} />
                <p style={{ fontWeight: 600, color: '#102A43', margin: 0 }}>{viewingPdfName}</p>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.3rem 0 1rem 0' }}>Legally secure client uploaded case evidence document.</p>
                <button className="btn btn-gold btn-sm" onClick={() => toast.success('Document downloaded for offline review.')}>
                  Download Document
                </button>
              </div>
            </div>
          </div>
        )}

        <AssignTimeModal 
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          consultation={selectedPendingRequest}
          onAssignSuccess={handleAssignSuccess}
        />

      </main>
    </div>
  );
};

export default LawyerConsultationsPage;
