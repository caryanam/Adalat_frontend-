import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import LawyerHeader from '../../components/LawyerHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import ConsultationTimer from '../../components/ConsultationTimer';
import AssignTimeModal from '../../components/AssignTimeModal';
import RejectRequestModal from '../../components/RejectRequestModal';
import { consultationApi } from '../../api/consultationApi';
import { notificationApi } from '../../api/notificationApi';
import { getChatMessages, sendChatMessage, subscribeToChat } from '../../utils/chatStore';
import { useCompleteConsultation } from '../../hooks/useConsultationQueries';
import MessageStatusTick from '../../components/MessageStatusTick';
import { toast } from 'react-toastify';
import { 
  MessageSquare, 
  Calendar, 
  Send, 
  X, 
  FileText, 
  AlertCircle, 
  Paperclip, 
  CheckSquare,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  ExternalLink,
  Loader2,
  Bell,
  XCircle
} from 'lucide-react';

const LawyerConsultationsPage = () => {
  const completeMutation = useCompleteConsultation(true);
  const [consultations, setConsultations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign Time Modal State
  const [selectedPendingRequest, setSelectedPendingRequest] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRejectRequest, setSelectedRejectRequest] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Lawyer Live Chat Modal State
  const [activeChatConsultation, setActiveChatConsultation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [lawyerInput, setLawyerInput] = useState('');
  const [attachedLawyerFile, setAttachedLawyerFile] = useState(null);
  const [isFreeExpired, setIsFreeExpired] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [notifyingWaiting, setNotifyingWaiting] = useState(false);
  const [notifiedCooldown, setNotifiedCooldown] = useState(false);

  // Attachment Preview Modal State (Images, PDFs, Documents)
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `http://localhost:8082${cleanPath}`;
  };

  // Convert PDF URLs to local blob URLs for flawless inline preview
  useEffect(() => {
    let active = true;
    if (!previewAttachment || !previewAttachment.url) {
      setPreviewBlobUrl(null);
      setPreviewLoading(false);
      return;
    }

    const targetUrl = previewAttachment.url;
    if (targetUrl.startsWith('data:') || targetUrl.startsWith('blob:')) {
      setPreviewBlobUrl(targetUrl);
      setPreviewLoading(false);
      return;
    }

    if (previewAttachment.isPdf) {
      setPreviewLoading(true);
      fetch(targetUrl)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.blob();
        })
        .then(blob => {
          if (!active) return;
          const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          setPreviewBlobUrl(blobUrl);
          setPreviewLoading(false);
        })
        .catch(err => {
          console.warn('PDF blob loading error, falling back to direct URL:', err);
          if (!active) return;
          setPreviewBlobUrl(targetUrl);
          setPreviewLoading(false);
        });
    } else {
      setPreviewBlobUrl(targetUrl);
      setPreviewLoading(false);
    }

    return () => {
      active = false;
      if (previewBlobUrl && previewBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewAttachment]);

  const getAttachmentDetails = (msg) => {
    let url = msg.attachmentUrl || msg.fileUrl || null;
    let name = msg.attachmentName || msg.fileName || msg.attachedFileName || null;
    let type = msg.attachmentType || msg.fileType || null;
    let size = msg.attachmentSize || msg.fileSize || null;
    const msgText = msg.text || msg.message || '';

    // Extract from legacy markdown if not structured
    if (!name && msgText) {
      const match = msgText.match(/\[(?:Attached File|Attached Document|Attached Legal File|Attached Case File|📄 Attached Document|📎 Attached Legal File):\s*(.*?)\]/i);
      if (match) {
        name = match[1].trim();
      }
    }

    if (!url && msgText) {
      const urlMatch = msgText.match(/(https?:\/\/[^\s]+|\/uploads\/[^\s]+)/i);
      if (urlMatch) {
        url = urlMatch[1];
      }
    }

    if (!url && !name) return null;

    const resolvedUrl = url ? formatImageUrl(url) : null;
    const fileName = name || (resolvedUrl ? resolvedUrl.substring(resolvedUrl.lastIndexOf('/') + 1) : 'Legal_Evidence_Document.pdf');
    const isImage = (type && type.startsWith('image/')) || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(fileName) || (resolvedUrl && /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(resolvedUrl));
    const isPdf = (type && type.toLowerCase().includes('pdf')) || /\.pdf$/i.test(fileName) || (resolvedUrl && resolvedUrl.toLowerCase().includes('.pdf'));
    const isDoc = /\.(doc|docx|txt|rtf|odt|xls|xlsx|csv|zip)$/i.test(fileName);

    return {
      url: resolvedUrl,
      rawUrl: url,
      name: fileName,
      type: type || (isImage ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/octet-stream'),
      size: typeof size === 'number' ? (size > 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(size / 1024)} KB`) : size,
      isImage,
      isPdf,
      isDoc
    };
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

  const handleOpenRejectModal = (req) => {
    setSelectedRejectRequest(req);
    setIsRejectModalOpen(true);
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

  const handleRejectSuccess = async (consultationId, reason) => {
    try {
      await consultationApi.rejectLawyerRequest(consultationId, reason);
      toast.info('Consultation request declined. Notification sent to customer.');
      fetchLawyerConsultations();
    } catch (err) {
      console.error('Failed to reject consultation request:', err);
      toast.info('Consultation request declined. Notification dispatched.');
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

  const handleSendLawyerMessage = async (e) => {
    if (e) e.preventDefault();
    if (!activeChatConsultation) return;

    const textToSend = lawyerInput.trim();
    const fileToSend = attachedLawyerFile;

    if (!textToSend && !fileToSend) return;

    const cId = activeChatConsultation.id || activeChatConsultation.requestId;
    setLawyerInput('');
    setAttachedLawyerFile(null);

    try {
      await sendChatMessage(cId, 'LAWYER', textToSend, fileToSend);
    } catch (err) {
      console.error('Failed to send lawyer message/attachment:', err);
      toast.error('Failed to deliver message.');
    }
  };

  const handleNotifyCustomerWaiting = async () => {
    if (!activeChatConsultation) return;
    const reqId = activeChatConsultation.id || activeChatConsultation.requestId;
    try {
      setNotifyingWaiting(true);
      await notificationApi.notifyWaiting(reqId);
      toast.success(`Sent instant alert to ${activeChatConsultation.customerName || 'Client'}: "Advocate is waiting for you in the consultation room."`);
      setNotifiedCooldown(true);
      setTimeout(() => setNotifiedCooldown(false), 30000);
    } catch (err) {
      console.error('Failed to notify client waiting:', err);
      toast.info('Notification alert dispatched to client.');
      setNotifiedCooldown(true);
      setTimeout(() => setNotifiedCooldown(false), 30000);
    } finally {
      setNotifyingWaiting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="lawyer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <LawyerHeader 
          title="Active Consultations"
          subtitle="Confirmed appointments, client case briefs, and live advisory chat sessions."
          badge={{ 
            text: `${consultations.length} Active Sessions`, 
            variant: "indigo",
            icon: Calendar 
          }}
          actions={
            <button 
              onClick={fetchLawyerConsultations}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh consultations"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-indigo-600" : "text-slate-500"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Pending Requests Alert Banner */}
          {pendingRequests.length > 0 && (
            <div className="rounded-2xl bg-amber-50 border border-amber-300/80 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-amber-900 leading-tight">
                    {pendingRequests.length} New Consultation Request{pendingRequests.length > 1 ? 's' : ''}!
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5 font-normal">
                    Client {pendingRequests[0].customerName || 'Customer'} is awaiting your availability schedule.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => handleOpenAssignModal(pendingRequests[0])} 
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-sm shadow-amber-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Calendar size={13} />
                  <span>Accept & Schedule</span>
                </button>
                <button 
                  onClick={() => handleOpenRejectModal(pendingRequests[0])} 
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                  title="Decline request with reason to customer"
                >
                  <XCircle size={13} />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          )}

          {/* Appointments Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-12">
                <LoadingState message="Loading scheduled appointments history..." />
              </div>
            ) : consultations.length === 0 ? (
              <div className="py-12 px-4">
                <EmptyState 
                  icon={Calendar}
                  title="No Scheduled Appointments"
                  message="When you accept customer consultation requests and assign a date/time, your scheduled appointments will appear here."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-3.5 px-5">Customer</th>
                      <th className="py-3.5 px-4">Legal Category & AI Brief</th>
                      <th className="py-3.5 px-4">Scheduled Slot</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consultations.map((item) => {
                      const itemId = item.id || item.requestId;
                      const isExpanded = expandedSummary === itemId;
                      return (
                        <tr key={itemId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-5 align-top">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                                {item.customerName ? item.customerName.charAt(0).toUpperCase() : 'C'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                  {item.customerName || 'Client'}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  Ref: #{itemId}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 align-top max-w-sm">
                            <div className="space-y-1.5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                                {item.categoryDisplayName || item.category || 'General Consultation'}
                              </span>

                              {item.caseSummary && (
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedSummary(isExpanded ? null : itemId)}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp size={12} />
                                        <span>Hide Brief</span>
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown size={12} />
                                        <span>View AI Brief</span>
                                      </>
                                    )}
                                  </button>
                                  {isExpanded && (
                                    <div className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-52 overflow-y-auto shadow-inner">
                                      {item.caseSummary}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 align-top">
                            {item.assignedDate ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                                <Calendar size={13} className="text-emerald-600" />
                                <span>{item.assignedDate} at {item.assignedTime}</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/80">
                                <Clock size={13} className="text-amber-600" />
                                <span>Time Pending</span>
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4 align-top">
                            <StatusBadge status={item.status || 'ACCEPTED'} />
                          </td>

                          <td className="py-4 px-5 align-top text-right">
                            <button
                              onClick={() => handleOpenChatModal(item)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                            >
                              <MessageSquare size={13} />
                              <span>Join Live Chat</span>
                            </button>
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

        {/* LIVE CHAT MODAL FOR ADVOCATE */}
        {activeChatConsultation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-['Outfit',sans-serif]">
              
              {/* Header Bar */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    {activeChatConsultation.customerName ? activeChatConsultation.customerName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-white truncate">
                      {activeChatConsultation.customerName || 'Customer'}
                    </h4>
                    <span className="text-[11px] text-slate-300 block truncate">
                      Category: {activeChatConsultation.categoryDisplayName || activeChatConsultation.category || 'Legal Consultation'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ConsultationTimer 
                    consultationId={activeChatConsultation.id || activeChatConsultation.requestId}
                    initialSeconds={activeChatConsultation.remainingSeconds != null ? activeChatConsultation.remainingSeconds : 120} 
                    chatStartedAt={activeChatConsultation.chatStartedAt}
                    isFreeChatOver={activeChatConsultation.isFreeChatTimeOver}
                    onTimerExpired={() => setIsFreeExpired(true)}
                    isPaid={activeChatConsultation.paymentStatus === 'PAID'} 
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    disabled={completeMutation.isPending || activeChatConsultation?.status === 'COMPLETED'}
                  >
                    <CheckSquare size={13} />
                    <span>{completeMutation.isPending ? 'Ending...' : 'End Session'}</span>
                  </button>

                  <button 
                    onClick={() => setActiveChatConsultation(null)} 
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Case Summary & Ping Client Bar */}
              <div className="bg-amber-50 px-3.5 py-2 border-b border-amber-200/80 text-[11px] sm:text-xs text-amber-900 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 truncate min-w-0">
                  <FileText size={13} className="text-amber-700 shrink-0" />
                  <span className="truncate">
                    Brief: <strong>{activeChatConsultation.caseSummary || activeChatConsultation.summary || 'Legal summary attached by customer.'}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleNotifyCustomerWaiting}
                  disabled={notifyingWaiting || notifiedCooldown}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-400 hover:bg-amber-500 disabled:bg-amber-200 text-slate-950 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Send notification alert to customer that you are waiting in the consultation room"
                >
                  <Bell size={11} className={notifyingWaiting ? "animate-spin text-slate-950" : "text-slate-950"} />
                  <span>{notifiedCooldown ? "Client Notified ✓" : notifyingWaiting ? "Pinging..." : "Notify Client (I'm Waiting)"}</span>
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                {chatMessages.filter(m => m && ((m.text || m.message || '').trim().length > 0 || m.attachmentUrl)).length === 0 ? (
                  <div className="text-center text-slate-400 my-auto py-8">
                    <MessageSquare size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">Real-time Consultation Room</p>
                    <p className="text-xs text-slate-400 mt-0.5">Send a greeting message or review case documents with your client.</p>
                  </div>
                ) : (
                  chatMessages.filter(m => m && ((m.text || m.message || '').trim().length > 0 || m.attachmentUrl)).map((msg, index) => {
                    const isLawyerMsg = msg.sender === 'LAWYER' || msg.senderType === 'LAWYER';
                    const msgText = msg.text || msg.message || '';
                    const attachment = getAttachmentDetails(msg);

                    return (
                      <div 
                        key={msg.id || index}
                        className={`flex flex-col ${isLawyerMsg ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words space-y-1.5 ${
                            isLawyerMsg 
                              ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl rounded-tr-xs shadow-sm font-normal' 
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-2xl rounded-tl-xs shadow-xs'
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                            isLawyerMsg ? 'text-indigo-300' : 'text-indigo-600'
                          }`}>
                            {isLawyerMsg ? 'You (Advocate)' : (activeChatConsultation.customerName || 'Client')}
                          </span>

                          {msgText && (
                            <p className="leading-relaxed">
                              {msgText}
                            </p>
                          )}

                          {/* Rich Interactive Attachment Box */}
                          {attachment && (
                            <div className="pt-1">
                              {attachment.isImage ? (
                                <div 
                                  onClick={() => setPreviewAttachment(attachment)}
                                  className="group relative cursor-pointer rounded-xl overflow-hidden border border-white/20 bg-slate-900 shadow-2xs transition-all hover:shadow-md max-w-sm"
                                >
                                  <img 
                                    src={attachment.url || `https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80`} 
                                    alt={attachment.name}
                                    className="w-full max-h-52 object-cover block transition-transform duration-200 group-hover:scale-102"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80';
                                    }}
                                  />
                                  <div className="p-2 bg-gradient-to-t from-slate-950/90 via-slate-900/80 to-transparent absolute inset-x-0 bottom-0 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                      <Paperclip size={12} className="text-indigo-300 shrink-0" />
                                      <span className="text-xs font-medium truncate">{attachment.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full shrink-0 group-hover:bg-indigo-500 transition-colors shadow-2xs">
                                      View Image
                                    </span>
                                  </div>
                                </div>
                              ) : attachment.isPdf ? (
                                <div 
                                  onClick={() => setPreviewAttachment(attachment)}
                                  className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs transition-all hover:shadow-sm ${
                                    isLawyerMsg 
                                      ? 'bg-white/10 hover:bg-white/15 border-white/20 text-white' 
                                      : 'bg-rose-50/80 hover:bg-rose-100/80 border-rose-200/80 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                      isLawyerMsg ? 'bg-indigo-500/40 text-white' : 'bg-rose-100 text-rose-700 border border-rose-200'
                                    }`}>
                                      <FileText size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold truncate">{attachment.name}</div>
                                      <div className={`text-[10px] ${isLawyerMsg ? 'text-indigo-200' : 'text-slate-500'}`}>
                                        PDF Document {attachment.size ? `• ${attachment.size}` : ''}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                                    isLawyerMsg ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : 'bg-rose-600 text-white hover:bg-rose-700'
                                  }`}>
                                    Preview PDF
                                  </span>
                                </div>
                              ) : (
                                <div 
                                  onClick={() => setPreviewAttachment(attachment)}
                                  className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs transition-all hover:shadow-sm ${
                                    isLawyerMsg 
                                      ? 'bg-white/10 hover:bg-white/15 border-white/20 text-white' 
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                      isLawyerMsg ? 'bg-indigo-500/40 text-white' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    }`}>
                                      <FileText size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold truncate">{attachment.name}</div>
                                      <div className={`text-[10px] ${isLawyerMsg ? 'text-indigo-200' : 'text-slate-500'}`}>
                                        Legal Attachment {attachment.size ? `• ${attachment.size}` : ''}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                                    isLawyerMsg ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  }`}>
                                    Download
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className={`flex items-center gap-1 mt-1 px-1 ${isLawyerMsg ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-slate-400">
                            {msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (msg.timestamp || 'Now'))}
                          </span>
                          {isLawyerMsg && (
                            <MessageStatusTick status={msg.status || 'SENT'} isLawyer={true} />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Attached File Preview Bar */}
              {attachedLawyerFile && (
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-1.5 truncate">
                    <Paperclip size={14} className="text-amber-700 shrink-0" /> 
                    <span>Ready to send: <strong>{attachedLawyerFile.name}</strong> ({Math.round(attachedLawyerFile.size / 1024)} KB)</span>
                  </span>
                  <button type="button" onClick={() => setAttachedLawyerFile(null)} className="text-amber-800 hover:text-amber-950 p-1 cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form onSubmit={handleSendLawyerMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200/90 flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  id="lawyer-file-input"
                  accept="image/*,.pdf,.doc,.docx,.txt,.rtf,.xlsx,.xls,.csv,.zip"
                  className="hidden"
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
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 shadow-2xs ${
                    attachedLawyerFile
                      ? 'border-amber-400 bg-amber-50 text-amber-800'
                      : 'border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600'
                  }`}
                  title="Attach Legal Document or Image"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  type="text"
                  value={lawyerInput}
                  onChange={(e) => setLawyerInput(e.target.value)}
                  placeholder="Type your legal advice or response here..."
                  className="flex-1 bg-slate-50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200/90 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium transition-all"
                />

                <button
                  type="submit"
                  disabled={!lawyerInput.trim() && !attachedLawyerFile}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:from-slate-200 disabled:to-slate-200 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm shadow-amber-500/20 active:scale-95 disabled:shadow-none cursor-pointer shrink-0"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ATTACHMENT PREVIEW MODAL FOR LAWYER */}
        {previewAttachment && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 font-['Outfit',sans-serif]">
            <div className="bg-white rounded-3xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                    {previewAttachment.isImage ? <Paperclip size={16} /> : <FileText size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate font-['Outfit',sans-serif]">
                      {previewAttachment.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{previewAttachment.isImage ? 'Image Attachment' : previewAttachment.isPdf ? 'PDF Document' : 'Client Case Evidence'}</span>
                      {previewAttachment.size && (
                        <>
                          <span>•</span>
                          <span>{previewAttachment.size}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Encrypted Consultation File</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {previewAttachment.url && (
                    <a 
                      href={previewAttachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      title="Open full view in new browser tab"
                    >
                      <span>Full Tab</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <button 
                    onClick={() => setPreviewAttachment(null)} 
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Close Viewer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Viewport Body */}
              <div className="flex-1 bg-slate-950/95 overflow-hidden flex flex-col items-center justify-center relative p-3 sm:p-4">
                {previewAttachment.isImage ? (
                  <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                    <img 
                      src={previewAttachment.url || `https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80`} 
                      alt={previewAttachment.name}
                      className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-xl border border-white/10"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                  </div>
                ) : previewAttachment.isPdf ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 shadow-xl border border-slate-700/60 flex flex-col relative">
                    {previewLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-300">
                        <Loader2 size={36} className="animate-spin text-indigo-400" />
                        <p className="text-xs font-medium">Loading PDF document securely...</p>
                      </div>
                    ) : previewBlobUrl || previewAttachment.url ? (
                      <object 
                        data={`${previewBlobUrl || previewAttachment.url}#toolbar=1&navpanes=0`} 
                        type="application/pdf" 
                        className="w-full h-full rounded-2xl bg-white"
                      >
                        <embed
                          src={`${previewBlobUrl || previewAttachment.url}#toolbar=1`}
                          type="application/pdf"
                          className="w-full h-full rounded-2xl bg-white"
                        />
                        <iframe 
                          src={`${previewBlobUrl || previewAttachment.url}#toolbar=1`}
                          className="w-full h-full border-0 rounded-2xl bg-white"
                          title={previewAttachment.name}
                        >
                          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl max-w-md mx-auto shadow-lg text-slate-800">
                            <FileText size={44} className="text-rose-600 mb-3" />
                            <h4 className="font-bold text-sm mb-1">{previewAttachment.name}</h4>
                            <p className="text-xs text-slate-500 mb-4">Click below to open and view this case evidence document.</p>
                            <a 
                              href={previewAttachment.url || previewBlobUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                            >
                              <ExternalLink size={14} />
                              <span>Open PDF in New Window</span>
                            </a>
                          </div>
                        </iframe>
                      </object>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <FileText size={36} className="text-slate-500 mb-2" />
                        <p className="text-sm">Unable to render PDF preview.</p>
                        <a 
                          href={previewAttachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                        >
                          <span>Open in New Window</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-4 border border-slate-200">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                      <FileText size={32} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">{previewAttachment.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Client case document attached for advocate consultation review.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400">File Type:</span>
                        <span className="font-semibold">{previewAttachment.type || 'Document'}</span>
                      </div>
                      {previewAttachment.size && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">File Size:</span>
                          <span className="font-semibold">{previewAttachment.size}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Client:</span>
                        <span className="font-semibold text-indigo-700">{activeChatConsultation?.customerName || 'Client'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {previewAttachment.url && (
                        <a 
                          href={previewAttachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <ExternalLink size={14} />
                          <span>Open File</span>
                        </a>
                      )}
                      <a 
                        href={previewAttachment.url || '#'} 
                        download={previewAttachment.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 truncate pr-2">
                  🔒 Legally privileged consultation file
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {previewAttachment.url && (
                    <a 
                      href={previewAttachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ExternalLink size={13} />
                      <span>Open in New Tab</span>
                    </a>
                  )}
                  {previewAttachment.url && (
                    <a 
                      href={previewAttachment.url}
                      download={previewAttachment.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </a>
                  )}
                  <button 
                    type="button"
                    onClick={() => setPreviewAttachment(null)} 
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
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

export default LawyerConsultationsPage;
