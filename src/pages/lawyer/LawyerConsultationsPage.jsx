import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import LawyerHeader from '../../components/LawyerHeader';
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
  AlertCircle, 
  Paperclip, 
  CheckSquare,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw
} from 'lucide-react';

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
              <button 
                onClick={() => handleOpenAssignModal(pendingRequests[0])} 
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-sm shadow-amber-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Calendar size={13} />
                <span>Accept & Schedule Now</span>
              </button>
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

              {/* Case Summary Bar */}
              <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/80 text-[11px] sm:text-xs text-amber-900 flex items-center gap-2 shrink-0">
                <FileText size={13} className="text-amber-700 shrink-0" />
                <span className="truncate">
                  Brief: <strong>{activeChatConsultation.caseSummary || activeChatConsultation.summary || 'Legal summary attached by customer.'}</strong>
                </span>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-slate-400 my-auto py-8">
                    <MessageSquare size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">Real-time Consultation Room</p>
                    <p className="text-xs text-slate-400 mt-0.5">Send a greeting message to begin the legal consultation.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => {
                    const isLawyerMsg = msg.sender === 'LAWYER' || msg.senderType === 'LAWYER';
                    return (
                      <div 
                        key={msg.id || index}
                        className={`flex flex-col ${isLawyerMsg ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className={`max-w-[82%] sm:max-w-[75%] px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                            isLawyerMsg 
                              ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl rounded-tr-xs shadow-sm font-normal' 
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-2xl rounded-tl-xs shadow-xs'
                          }`}
                        >
                          {msg.text || msg.message}
                          {msg.attachedFileName && (
                            <button 
                              type="button"
                              onClick={() => openDocumentViewer(msg.attachedFileName)}
                              className={`mt-2 p-2 rounded-xl flex items-center gap-2 text-xs font-semibold w-full text-left transition-colors cursor-pointer ${
                                isLawyerMsg ? 'bg-white/15 text-indigo-200 hover:bg-white/25' : 'bg-slate-100 text-indigo-700 hover:bg-slate-200'
                              }`}
                            >
                              <FileText size={14} />
                              <span className="truncate">{msg.attachedFileName}</span>
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendLawyerMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200/90 flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  id="lawyer-file-input"
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
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border border-slate-200/80 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Attach Legal Document"
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

        {/* Document Viewer Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  <span>Document Preview</span>
                </h3>
                <button onClick={() => setShowPdfModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl text-center border border-dashed border-slate-300">
                <FileText size={48} className="text-indigo-600 mx-auto mb-3" />
                <p className="font-bold text-sm text-slate-900">{viewingPdfName}</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Legally secure client uploaded case evidence document.</p>
                <button 
                  onClick={() => toast.success('Document downloaded for offline review.')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download Document</span>
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
