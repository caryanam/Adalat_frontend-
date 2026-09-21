import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ConsultationTimer from '../../components/ConsultationTimer';
import PaymentModal from '../../components/PaymentModal';
import EmptyState from '../../components/EmptyState';
import { consultationApi } from '../../api/consultationApi';
import { toast } from 'react-toastify';
import { Send, ShieldCheck, MessageSquare, AlertCircle, Lock, Calendar, Clock, CheckCircle, RefreshCw, Star, X, Paperclip, FileText, CheckSquare } from 'lucide-react';
import { saveLawyerRating, getLawyerRatingData } from '../../utils/ratingUtils';
import { getChatMessages, sendChatMessage, subscribeToChat, getSharedTimerSeconds } from '../../utils/chatStore';
import { useCustomerRequests, useCompleteConsultation } from '../../hooks/useConsultationQueries';
import './CustomerConsultationPage.css';

const CustomerConsultationPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramLawyerId = searchParams.get('lawyerId');
  const completeMutation = useCompleteConsultation(false);

  const [consultationsList, setConsultationsList] = useState([]);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  
  const [isFreeExpired, setIsFreeExpired] = useState(false);
  const [isPaidActive, setIsPaidActive] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [dismissedPaymentModal, setDismissedPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // PDF / Attachment Viewer Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [viewingPdfName, setViewingPdfName] = useState('');

  // Rating Modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const openDocumentViewer = (fileName) => {
    setViewingPdfName(fileName || 'Legal_Case_Document.pdf');
    setShowPdfModal(true);
  };

  const fetchCustomerConsultations = () => {
    setLoading(true);
    consultationApi.getRequestsForCustomer()
      .then(res => {
        const requests = res && res.data ? (res.data.data || res.data) : [];
        const formatted = requests.map(r => ({
          id: r.id || r.requestId,
          lawyerId: r.lawyerId || 1,
          lawyerName: r.lawyerName || 'Advocate',
          category: r.categoryDisplayName || r.category || 'Legal Consultation',
          lawyerRate: r.lawyerRate || '₹99/10 min',
          lawyerUpiId: r.lawyerUpiId || r.lawyerUpi || (r.lawyerName ? `${r.lawyerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@upi` : 'advocate@upi'),
          status: r.status || 'ACCEPTED',
          customerConfirmationStatus: r.customerConfirmationStatus || 'ACCEPTED',
          assignedDate: r.assignedDate || null,
          assignedTime: r.assignedTime || null,
          remainingSeconds: r.remainingSeconds || 120,
          paymentStatus: r.paymentStatus,
          isFreeChatTimeOver: r.isFreeChatTimeOver,
          messages: []
        }));

        setConsultationsList(formatted);
        if (formatted.length > 0) {
          const selected = paramLawyerId 
            ? formatted.find(c => String(c.lawyerId) === String(paramLawyerId)) || formatted[0]
            : formatted[0];
          setActiveConsultation(selected);
          setMessages(getChatMessages(selected.id));
          if (selected.isFreeChatTimeOver) setIsFreeExpired(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setConsultationsList([]);
        setActiveConsultation(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomerConsultations();
  }, [paramLawyerId]);

  // Real-time Chat Subscription
  useEffect(() => {
    if (!activeConsultation) return;
    const unsub = subscribeToChat(activeConsultation.id, (msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [activeConsultation?.id]);

  const handleSelectConsultation = (item) => {
    setActiveConsultation(item);
    setMessages(getChatMessages(item.id));
    setIsFreeExpired(item.isFreeChatTimeOver || false);
    setDismissedPaymentModal(false);
    setIsPaidActive(item.status === 'PAYMENT_COMPLETED' || item.paymentStatus === 'PAID');
    setSearchParams({ lawyerId: item.lawyerId });
  };

  const handleConfirmAppointment = async (requestId, action) => {
    try {
      await consultationApi.confirmAppointment(requestId, action);
      if (action === 'ACCEPT') {
        toast.success('Appointment time accepted! Chat will unlock at the scheduled time.');
      } else {
        toast.info('Reschedule request sent to advocate.');
      }
      fetchCustomerConsultations();
    } catch (err) {
      toast.error('Could not update appointment status.');
    }
  };

  const handleTimerExpired = () => {
    setIsFreeExpired(true);
    if (!dismissedPaymentModal) {
      setShowPaymentModal(true);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setDismissedPaymentModal(true);
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (!activeConsultation) return;

    saveLawyerRating(activeConsultation.lawyerId, userRating, ratingComment, 'Customer');
    toast.success(`⭐ Thank you! Your ${userRating}-star rating for ${activeConsultation.lawyerName} has been recorded.`);
    setShowRatingModal(false);
    setRatingComment('');
  };

  const handlePaymentSuccess = async (paymentRef) => {
    if (activeConsultation) {
      try {
        await consultationApi.unlockPaidConsultation(activeConsultation.id, paymentRef?.gatewayPaymentId, paymentRef?.amount);
      } catch (err) {}
    }
    setIsPaidActive(true);
    setIsFreeExpired(false);
    setShowPaymentModal(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!activeConsultation) return;

    if (isFreeExpired && !isPaidActive) {
      setShowPaymentModal(true);
      return;
    }

    if (isChatLocked(activeConsultation)) return;
    
    let textToSend = inputMsg.trim();
    if (attachedFile) {
      textToSend = (textToSend ? textToSend + '\n' : '') + `📄 [Attached Document: ${attachedFile.name}]`;
    }
    if (!textToSend) return;

    sendChatMessage(activeConsultation.id, 'CUSTOMER', textToSend);
    setInputMsg('');
    setAttachedFile(null);
  };

  // Helper to check if chat is locked before assigned time
  const isChatLocked = (item) => {
    if (!item) return true;
    if (item.status === 'REQUESTED') return true; // Awaiting advocate response
    if (item.status === 'ACCEPTED' || item.status === 'ACTIVE') {
      if (item.assignedDate && item.assignedTime) {
        try {
          const timeParts = item.assignedTime.split(':');
          const hour = parseInt(timeParts[0], 10);
          const minute = parseInt(timeParts[1], 10);

          const dateParts = item.assignedDate.split('-');
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const day = parseInt(dateParts[2], 10);

          const scheduledDateTime = new Date(year, month, day, hour, minute, 0);
          const now = new Date();

          // If current time is strictly earlier than scheduled time, lock chat!
          if (now < scheduledDateTime) {
            return true;
          }
        } catch (e) {
          return false;
        }
      }
      return false; // Scheduled time has arrived or passed! Unlock chat!
    }
    return false;
  };

  return (
    <div className="portal-layout">
      <Sidebar portalType="customer" />

      <main className="portal-main-content">
        <div className="portal-header">
          <h1>Consultations & Live Chat</h1>
          <p>Manage your appointment requests, accept scheduled times, and communicate live with advocates.</p>
        </div>

        <div className="consultation-master-detail card">
          <div className="consultations-list-panel">
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span><MessageSquare size={16} /> My Consultations ({consultationsList.length})</span>
              <button onClick={fetchCustomerConsultations} style={{ background: 'transparent', border: 'none', color: '#5C5C99', cursor: 'pointer' }} title="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>
                Loading your consultations...
              </div>
            ) : consultationsList.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <EmptyState 
                  icon={MessageSquare}
                  title="No Active Consultations"
                  message="When you request consultation with an advocate after your AI assessment, it will appear here."
                />
              </div>
            ) : (
              <div className="consultations-items-scroll">
                {consultationsList.map((item) => {
                  const isSelected = activeConsultation && activeConsultation.id === item.id;
                  const statusLabel = item.status === 'REQUESTED' ? '⏳ Request Pending' 
                    : item.status === 'ACCEPTED' ? (item.customerConfirmationStatus === 'ACCEPTED' ? '✅ Confirmed Time' : '📅 Time Assigned')
                    : '⏱️ 10m Free Chat';

                  return (
                    <div 
                      key={item.id} 
                      className={`consultation-item-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectConsultation(item)}
                    >
                      <div className="item-avatar">
                        {item.lawyerName.charAt(4) || 'A'}
                      </div>
                      <div className="item-details">
                        <div className="item-name-row">
                          <strong>{item.lawyerName}</strong>
                        </div>
                        <p className="item-category">{item.category}</p>
                        <span className={`item-status-pill ${item.status === 'ACCEPTED' ? 'active-free' : 'scheduled'}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="consultation-chat-panel">
            {activeConsultation ? (
              <>
                <div className="chat-header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="chat-lawyer-info">
                    <div className="chat-avatar">{activeConsultation.lawyerName.charAt(4)}</div>
                    <div>
                      <h4>{activeConsultation.lawyerName}</h4>
                      <p><ShieldCheck size={13} className="verified-gold" /> {activeConsultation.category} • {activeConsultation.lawyerRate}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to conclude this consultation? It will move to your Appointments history.")) {
                          completeMutation.mutate(activeConsultation.id, {
                            onSuccess: () => {
                              fetchCustomerConsultations();
                              navigate('/customer/appointments');
                            }
                          });
                        }
                      }}
                      className="btn btn-secondary btn-sm"
                      disabled={completeMutation.isPending || activeConsultation?.status === 'COMPLETED'}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, background: '#DC2626', color: '#FFF', border: 'none' }}
                    >
                      <CheckSquare size={14} /> {completeMutation.isPending ? 'Ending...' : 'End Consultation'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRatingModal(true)}
                      className="btn btn-gold btn-sm"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                    >
                      <Star size={14} fill="#FFFFFF" /> Rate Advocate
                    </button>

                    <div className="timer-box">
                      {!isChatLocked(activeConsultation) ? (
                        <ConsultationTimer 
                          consultationId={activeConsultation.id}
                          initialSeconds={activeConsultation.remainingSeconds || 600}
                          onTimerExpired={handleTimerExpired}
                          isPaid={isPaidActive}
                        />
                      ) : (
                        <span className="badge badge-gold" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} /> 2m Timer Starts at Scheduled Time
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advocate Time Assignment & Confirmed Appointment Banner (Visible ONLY while awaiting scheduled time) */}
                {activeConsultation.status === 'ACCEPTED' && isChatLocked(activeConsultation) && (
                  <div style={{ background: '#F0FDF4', border: '1.5px solid #10B981', borderRadius: '12px', padding: '1rem 1.25rem', margin: '1rem', color: '#065F46' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={18} style={{ color: '#059669' }} /> Consultation Confirmed & Scheduled
                    </div>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>
                      <strong>{activeConsultation.lawyerName}</strong> has accepted your appointment and scheduled your 10-minute consultation for:
                      <br />
                      <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#047857', marginTop: '0.25rem', display: 'inline-block' }}>
                        📆 Date: {activeConsultation.assignedDate || 'Upcoming Date'} • ⏰ Time: {activeConsultation.assignedTime || 'Assigned Time'}
                      </span>
                    </p>

                    <div style={{ background: '#DCFCE7', color: '#166534', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle size={16} /> Appointment Confirmed! Live chat & 10-min timer will activate at the scheduled time.
                    </div>
                  </div>
                )}

                {activeConsultation.status === 'REQUESTED' && (
                  <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px', padding: '1rem 1.25rem', margin: '1rem', color: '#92400E' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={16} /> Consultation Request Pending Advocate Review
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem' }}>
                      Your consultation request & AI Case Assessment File have been submitted to <strong>{activeConsultation.lawyerName}</strong>. The advocate will accept & assign your consultation date & time shortly.
                    </p>
                  </div>
                )}

                {isFreeExpired && !isPaidActive && (
                  <div className="expired-lock-banner">
                    <AlertCircle size={20} />
                    <div>
                      <strong>Your free 10-minute consultation period has ended.</strong>
                      <p>To continue conversing with {activeConsultation.lawyerName}, please complete the payment ({activeConsultation.lawyerRate}).</p>
                    </div>
                    <button className="btn btn-gold btn-sm" onClick={() => setShowPaymentModal(true)}>
                      Pay & Unlock Chat
                    </button>
                  </div>
                )}

                <div className="chat-messages-container">
                  {activeConsultation.caseSummary && (
                    <div style={{ background: '#FFFDF5', border: '1px solid #5C5C99', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#102A43', lineHeight: '1.5' }}>
                      <div style={{ fontWeight: 700, color: '#5C5C99', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        📌 SHARED AI CASE ASSESSMENT WITH ADVOCATE
                      </div>
                      <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{activeConsultation.caseSummary}</p>
                    </div>
                  )}
                  {messages.map(msg => {
                    const isAttachment = msg.text && (msg.text.includes('📎') || msg.text.includes('Attached') || msg.text.toLowerCase().includes('.pdf'));
                    const match = msg.text.match(/\[(?:Attached File|Attached Document|Attached Legal File):\s*(.*?)\]/);
                    const fileName = match ? match[1] : 'Legal_Evidence_Document.pdf';

                    return (
                      <div key={msg.id} className={`chat-bubble-row ${msg.sender === 'CUSTOMER' ? 'customer' : 'lawyer'}`}>
                        <div className="chat-bubble">
                          <span className="sender-name">{msg.sender === 'CUSTOMER' ? 'You' : activeConsultation.lawyerName}</span>
                          <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                          {isAttachment && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {fileName.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                                <div 
                                  onClick={() => openDocumentViewer(fileName)}
                                  style={{ 
                                    cursor: 'pointer', 
                                    borderRadius: '10px', 
                                    overflow: 'hidden', 
                                    border: '1.5px solid #5C5C99', 
                                    maxHeight: '180px',
                                    background: '#09131F',
                                    display: 'inline-block'
                                  }}
                                >
                                  <img 
                                    src={msg.fileUrl || `https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80`} 
                                    alt={fileName}
                                    style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
                                  />
                                  <div style={{ padding: '0.25rem 0.5rem', background: '#102A43', color: '#FFF', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>📷 {fileName}</span>
                                    <span style={{ color: '#5C5C99', fontWeight: 600 }}>Click to Expand</span>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  onClick={() => openDocumentViewer(fileName)}
                                  style={{
                                    background: '#102A43',
                                    color: '#FFFFFF',
                                    border: '1.5px solid #5C5C99',
                                    borderRadius: '10px',
                                    padding: '0.5rem 0.75rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justify: 'space-between',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                                    <FileText size={18} style={{ color: '#5C5C99', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                      {fileName}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '0.7rem', background: '#5C5C99', color: '#102A43', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700, flexShrink: 0 }}>
                                    Preview PDF
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          <span className="msg-time">{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {attachedFile && (
                  <div style={{ padding: '0.35rem 1rem', background: '#FEF3C7', borderTop: '1px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#92400E', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Paperclip size={14} /> Attached File: <strong>{attachedFile.name}</strong> ({Math.round(attachedFile.size / 1024)} KB)
                    </span>
                    <button type="button" onClick={() => setAttachedFile(null)} style={{ background: 'transparent', border: 'none', color: '#92400E', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="chat-input-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label 
                    htmlFor="customer-chat-attachment-input" 
                    title="Attach File (Images, PDF, Word documents)"
                    onClick={(e) => {
                        if (isFreeExpired && !isPaidActive) {
                            e.preventDefault();
                            setShowPaymentModal(true);
                        }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      padding: '0.55rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: attachedFile ? '#FEF3C7' : '#F8FAFC',
                      color: attachedFile ? '#D97706' : '#64748B',
                      cursor: isChatLocked(activeConsultation) || (isFreeExpired && !isPaidActive) ? 'not-allowed' : 'pointer',
                      opacity: isChatLocked(activeConsultation) || (isFreeExpired && !isPaidActive) ? 0.5 : 1,
                      flexShrink: 0
                    }}
                  >
                    <Paperclip size={18} />
                  </label>
                  <input 
                    id="customer-chat-attachment-input"
                    type="file" 
                    accept="image/*,.pdf,.doc,.docx,.txt" 
                    disabled={isChatLocked(activeConsultation)}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        if (isFreeExpired && !isPaidActive) {
                            setShowPaymentModal(true);
                            return;
                        }
                        setAttachedFile(e.target.files[0]);
                        toast.success(`Attached file: ${e.target.files[0].name}`);
                      }
                    }} 
                    style={{ display: 'none' }} 
                  />
                  <input 
                    type="text"
                    className="form-input"
                    placeholder={
                      isChatLocked(activeConsultation) 
                        ? (activeConsultation.status === 'REQUESTED' 
                            ? "Consultation request pending advocate time assignment..." 
                            : `Appointment scheduled for ${activeConsultation.assignedDate || ''} at ${activeConsultation.assignedTime || ''}. Chat unlocks automatically at scheduled time.`)
                        : (isFreeExpired && !isPaidActive ? "Consultation paused. Complete payment to continue..." : "Type your legal query to advocate...")
                    }
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    disabled={isChatLocked(activeConsultation)}
                    onClick={() => { if (isFreeExpired && !isPaidActive) setShowPaymentModal(true); }}
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-gold"
                    disabled={isChatLocked(activeConsultation) || (!inputMsg.trim() && !attachedFile && !(isFreeExpired && !isPaidActive))}
                  >
                    {isChatLocked(activeConsultation) || (isFreeExpired && !isPaidActive) ? <Lock size={16} /> : <Send size={16} />}
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-empty-panel">
                <EmptyState 
                  icon={MessageSquare}
                  title="No Active Consultation Selected"
                  message="When you initiate a consultation with an advocate, the live chat window and 10-minute timer will appear here."
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {activeConsultation && (
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          title="Continue Consultation"
          amount={String(activeConsultation.lawyerRate || "199").replace(/[^0-9.]/g, '') || "199.00"}
          lawyerName={activeConsultation.lawyerName}
          lawyerUpiId={activeConsultation.lawyerUpiId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Client Advocate Rating Modal */}
      {showRatingModal && activeConsultation && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 19, 31, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #5C5C99' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={22} fill="#5C5C99" color="#5C5C99" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#102A43' }}>Rate Your Advocate</h3>
              </div>
              <button onClick={() => setShowRatingModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1.25rem 0' }}>
              How was your consultation experience with <strong>{activeConsultation.lawyerName}</strong>? Your rating helps other clients choose top-rated advocates.
            </p>

            <form onSubmit={handleRatingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#5C5C99', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                  SELECT RATING ({hoverRating || userRating} / 5 STARS)
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem', transition: 'transform 0.15s ease' }}
                    >
                      <Star
                        size={32}
                        fill={(hoverRating || userRating) >= star ? '#5C5C99' : 'none'}
                        color={(hoverRating || userRating) >= star ? '#5C5C99' : '#CBD5E1'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#102A43', marginBottom: '0.35rem', display: 'block' }}>
                  Optional Feedback Review:
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Share details about the advocate's legal guidance, punctuality, or legal advice..."
                  value={ratingComment}
                  onChange={e => setRatingComment(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem', padding: '0.65rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowRatingModal(false)} className="btn btn-secondary btn-block" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-block" style={{ flex: 1, fontWeight: 600 }}>
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF / Document Viewer Overlay Modal */}
      {showPdfModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 19, 31, 0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '750px', width: '100%', height: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.35)', border: '2px solid #5C5C99', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', background: '#102A43', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #5C5C99' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FileText size={22} style={{ color: '#5C5C99' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#FFFFFF', fontFamily: 'Cinzel, serif' }}>Document Viewer: {viewingPdfName}</h3>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Verified Legal Attachment • Ref #{activeConsultation?.id || '1'}</span>
                </div>
              </div>
              <button onClick={() => setShowPdfModal(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '0.2rem' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ flex: 1, background: '#F8FAFC', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              {viewingPdfName.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center', width: '100%' }}>
                  <img 
                    src={`https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80`} 
                    alt={viewingPdfName}
                    style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                  <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.85rem', color: '#102A43', fontWeight: 600 }}>
                    Image Attachment: {viewingPdfName}
                  </p>
                </div>
              ) : (
                <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', fontSize: '0.9rem', color: '#102A43', lineHeight: '1.7', fontFamily: 'Georgia, serif', width: '100%' }}>
                  <div style={{ textAlign: 'center', borderBottom: '2px double #5C5C99', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontFamily: 'Cinzel, serif', color: '#102A43', fontSize: '1.3rem' }}>LEGAL CONSULTATION CASE DOCUMENT</h2>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>Adalat Legal Services • File: {viewingPdfName}</p>
                  </div>

                  <div style={{ margin: '1rem 0' }}>
                    <p><strong>Client:</strong> {activeConsultation?.customerName || 'Client'}</p>
                    <p><strong>Advocate:</strong> {activeConsultation?.lawyerName || 'Advocate'}</p>
                    <p><strong>Matter Category:</strong> {activeConsultation?.category || 'Property & Rental Dispute'}</p>
                    <p><strong>Assigned Time:</strong> {activeConsultation?.assignedDate || 'Scheduled'} at {activeConsultation?.assignedTime || 'Time'}</p>
                  </div>

                  <div style={{ background: '#F1F5F9', borderLeft: '4px solid #5C5C99', padding: '1rem', borderRadius: '4px', margin: '1rem 0' }}>
                    <strong>ATTACHED CASE FACTS & SUMMARY:</strong>
                    <p style={{ margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
                      {activeConsultation?.caseSummary || 'Legal intake document and case evidence attached for advocate consultation review.'}
                    </p>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#64748B', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
                    *** Official Document generated via Adalat Portal ***
                  </p>
                </div>
              )}
            </div>

            <div style={{ padding: '1rem 1.5rem', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                📄 Verified PDF Preview
              </span>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button 
                  onClick={() => {
                    const blob = new Blob([activeConsultation?.caseSummary || "Official Adalat Case Document"], { type: "application/pdf" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = viewingPdfName;
                    a.click();
                  }}
                  className="btn btn-gold btn-sm"
                  style={{ padding: '0.45rem 1.25rem', fontWeight: 600 }}
                >
                  Download Document
                </button>
                <button onClick={() => setShowPdfModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.45rem 1.25rem' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerConsultationPage;
