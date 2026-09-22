import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import CustomerHeader from '../../components/CustomerHeader';
import ConsultationTimer from '../../components/ConsultationTimer';
import PaymentModal from '../../components/PaymentModal';
import EmptyState from '../../components/EmptyState';
import { consultationApi } from '../../api/consultationApi';
import { toast } from 'react-toastify';
import { 
  Send, 
  ShieldCheck, 
  MessageSquare, 
  AlertCircle, 
  Lock, 
  Calendar, 
  Clock, 
  CheckCircle, 
  CheckCircle2,
  RefreshCw, 
  Star, 
  X, 
  Paperclip, 
  FileText, 
  CheckSquare,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { saveLawyerRating } from '../../utils/ratingUtils';
import { getChatMessages, sendChatMessage, subscribeToChat } from '../../utils/chatStore';
import { useCompleteConsultation } from '../../hooks/useConsultationQueries';

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

  // Left Sidebar Filter States
  const [listSearch, setListSearch] = useState('');
  const [listFilterTab, setListFilterTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'

  // Case Assessment Collapsible Drawer State
  const [showCaseAssessment, setShowCaseAssessment] = useState(false);

  // PDF / Attachment Viewer Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [viewingPdfName, setViewingPdfName] = useState('');

  // Rating Modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const openDocumentViewer = (fileName) => {
    setViewingPdfName(fileName || 'Legal_Case_Document.pdf');
    setShowPdfModal(true);
  };

  const fetchCustomerConsultations = () => {
    setLoading(true);
    consultationApi.getRequestsForCustomer()
      .then(res => {
        const requests = res && res.data ? (res.data.data || res.data) : [];
        const formatted = requests.map(r => {
          const rawRate = r.lawyerRate != null ? r.lawyerRate : (r.consultationRate || r.consultationFee || '₹99/10 min');
          const normalizedRate = typeof rawRate === 'object' ? `₹${rawRate.amount || 99}/10 min` : String(rawRate);

          return {
            id: r.id || r.requestId,
            lawyerId: r.lawyerId || 1,
            lawyerName: r.lawyerName || 'Advocate',
            category: r.categoryDisplayName || r.category || 'Legal Consultation',
            lawyerRate: normalizedRate,
            lawyerUpiId: r.lawyerUpiId || r.lawyerUpi || (r.lawyerName ? `${r.lawyerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@upi` : 'advocate@upi'),
            status: (r.status || 'ACCEPTED').toUpperCase(),
            customerConfirmationStatus: r.customerConfirmationStatus || 'ACCEPTED',
            assignedDate: r.assignedDate || null,
            assignedTime: r.assignedTime || null,
            remainingSeconds: r.remainingSeconds || 120,
            paymentStatus: r.paymentStatus,
            isFreeChatTimeOver: r.isFreeChatTimeOver,
            caseSummary: r.caseSummary || '',
            messages: []
          };
        });

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

  // Helpers for clean display
  const getInitials = (name) => {
    if (!name) return 'A';
    const cleaned = String(name).replace(/^(adv(\.|\s+)|advocate\s+|dr(\.|\s+)|mr(\.|\s+)|ms(\.|\s+)|mrs(\.|\s+))/i, '').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return String(name).charAt(0).toUpperCase();
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const formatName = (name) => {
    if (!name) return 'Advocate';
    const str = String(name);
    if (str === str.toUpperCase()) {
      return str
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return str;
  };

  const formatRate = (rate) => {
    if (!rate && rate !== 0) return '₹99 / 10 min';
    if (typeof rate === 'number') return `₹${rate} / 10 min`;
    if (typeof rate === 'object') return `₹${rate?.amount || 99} / 10 min`;
    const str = String(rate).replace('RATE_', '');
    if (str.includes('/')) return str.startsWith('₹') ? str : `₹${str}`;
    return `₹${str} / 10 min`;
  };

  const formatRateShort = (rate) => {
    if (!rate && rate !== 0) return '₹99';
    if (typeof rate === 'number') return `₹${rate}`;
    if (typeof rate === 'object') return `₹${rate?.amount || 99}`;
    const str = String(rate).replace('RATE_', '');
    const firstPart = str.split('/')[0].trim();
    return firstPart.startsWith('₹') ? firstPart : `₹${firstPart}`;
  };

  // Filtered consultations list for the left panel
  const filteredConsultationsList = useMemo(() => {
    return consultationsList.filter(item => {
      // Tab filter
      if (listFilterTab === 'ACTIVE' && (item.status === 'COMPLETED' || item.status === 'CANCELLED')) {
        return false;
      }
      if (listFilterTab === 'COMPLETED' && item.status !== 'COMPLETED') {
        return false;
      }
      // Search filter
      if (!listSearch.trim()) return true;
      const q = listSearch.trim().toLowerCase();
      return (
        item.lawyerName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.assignedDate && item.assignedDate.toLowerCase().includes(q))
      );
    });
  }, [consultationsList, listFilterTab, listSearch]);

  const quickSuggestedPrompts = [
    "Can you review the key legal facts of my dispute?",
    "What are my immediate remedies under Indian law?",
    "What evidence documents should I prepare for court?"
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="customer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <CustomerHeader 
          title="Consultations & Live Room"
          subtitle="Communicate in real-time, review case assessment files, and receive verified legal guidance."
          badge={{ text: "Encrypted Consultation", variant: "indigo" }}
          actions={
            <Link
              to="/customer/find-lawyers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs hover:shadow-indigo-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus size={14} />
              <span>Book Advocate</span>
            </Link>
          }
        />

        <div className="flex-1 p-2 sm:p-5 lg:p-6 pb-20 md:pb-6 flex flex-col min-h-0 overflow-hidden">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            
            {/* LEFT CONSULTATIONS LIST PANEL: Hidden on mobile when activeConsultation is open */}
            <div className={`w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200/80 bg-slate-50/50 flex-col shrink-0 min-h-0 ${
              activeConsultation ? 'hidden md:flex' : 'flex'
            }`}>
              
              {/* Header */}
              <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <MessageSquare size={15} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 truncate">
                    Consultations
                  </span>
                  {consultationsList.length > 0 && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full shrink-0">
                      {consultationsList.length}
                    </span>
                  )}
                </div>
                <button 
                  onClick={fetchCustomerConsultations} 
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0" 
                  title="Refresh consultations"
                >
                  <RefreshCw size={13} />
                </button>
              </div>

              {/* Search & Tabs Toolbar */}
              <div className="p-2.5 border-b border-slate-200/70 bg-white space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={listSearch}
                    onChange={(e) => setListSearch(e.target.value)}
                    placeholder="Search by advocate or matter..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-2xs"
                  />
                  {listSearch && (
                    <button
                      onClick={() => setListSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    onClick={() => setListFilterTab('ALL')}
                    className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                      listFilterTab === 'ALL'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All ({consultationsList.length})
                  </button>
                  <button
                    onClick={() => setListFilterTab('ACTIVE')}
                    className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                      listFilterTab === 'ACTIVE'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setListFilterTab('COMPLETED')}
                    className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                      listFilterTab === 'COMPLETED'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Consultations List Scrollable */}
              {loading ? (
                <div className="flex-1 flex items-center justify-center p-6 text-xs text-slate-400">
                  <RefreshCw size={14} className="animate-spin mr-2 text-indigo-600" />
                  Loading your consultations...
                </div>
              ) : filteredConsultationsList.length === 0 ? (
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                  <EmptyState 
                    icon={MessageSquare}
                    title={listSearch ? "No Results Found" : "No Consultations"}
                    message={listSearch ? "Try adjusting your search query." : "Book an advocate to start your consultation."}
                  />
                  {!listSearch && (
                    <Link
                      to="/customer/find-lawyers"
                      className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-2xs hover:bg-indigo-700 transition-all"
                    >
                      <Plus size={13} />
                      <span>Find Advocates</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
                  {filteredConsultationsList.map((item) => {
                    const isSelected = activeConsultation && activeConsultation.id === item.id;
                    const isCompleted = item.status === 'COMPLETED';
                    const isRequested = item.status === 'REQUESTED';

                    return (
                      <div 
                        key={item.id} 
                        className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 relative ${
                          isSelected 
                            ? 'bg-indigo-50/95 border-indigo-200 text-indigo-950 shadow-2xs border-l-4 border-l-indigo-600' 
                            : 'bg-white hover:bg-slate-100/60 border-slate-200/70 text-slate-700'
                        }`}
                        onClick={() => handleSelectConsultation(item)}
                      >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                          isSelected 
                            ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {getInitials(item.lawyerName)}
                        </div>

                        {/* Text info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                              <span className="truncate">{formatName(item.lawyerName)}</span>
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                              #{item.id}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.category}
                          </p>

                          <div className="mt-1.5 flex items-center justify-between gap-1">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                <CheckCircle size={10} className="text-emerald-600" /> Completed
                              </span>
                            ) : isRequested ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock size={10} className="text-amber-600" /> Awaiting Schedule
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {item.assignedDate ? `${item.assignedDate}` : 'Confirmed'}
                              </span>
                            )}

                            <span className="text-[10px] font-semibold text-emerald-700">
                              {formatRateShort(item.lawyerRate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT CHAT & WORKSPACE: On mobile, visible only when activeConsultation is open */}
            <div className={`flex-1 flex-col min-w-0 h-full bg-[#f8fafc] overflow-hidden relative ${
              activeConsultation ? 'flex' : 'hidden md:flex'
            }`}>
              {activeConsultation ? (
                <>
                  {/* Clean, Non-Messy Active Consultation Topbar */}
                  <div className="h-16 px-3 sm:px-6 border-b border-slate-200/80 bg-white flex items-center justify-between gap-2 sm:gap-3 shrink-0 z-10">
                    
                    {/* Left: Advocate Identity + Mobile Back Button */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => setActiveConsultation(null)}
                        className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                        title="Back to consultations list"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
                        {getInitials(activeConsultation.lawyerName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5 font-['Outfit',sans-serif]">
                          <span className="truncate">{formatName(activeConsultation.lawyerName)}</span>
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" title="Verified Advocate" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Advocate Online" />
                          <span className="truncate max-w-[120px] sm:max-w-[180px] font-medium text-slate-600">
                            {activeConsultation.category || 'Legal Consultation'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded text-[11px] shrink-0">
                            {formatRateShort(activeConsultation.lawyerRate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Timer Toolbar (Uncluttered, Single-line, Unified h-8) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      
                      {/* Session Timer OR Scheduled Badge */}
                      {!isChatLocked(activeConsultation) ? (
                        <ConsultationTimer 
                          consultationId={activeConsultation.id}
                          initialSeconds={activeConsultation.remainingSeconds || 600}
                          onTimerExpired={handleTimerExpired}
                          isPaid={isPaidActive}
                        />
                      ) : (
                        <div className="h-8 px-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center gap-1.5 shadow-2xs shrink-0">
                          <Clock size={13} className="text-indigo-600 shrink-0" />
                          <span>{activeConsultation.assignedTime || 'Scheduled'}</span>
                        </div>
                      )}

                      <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block shrink-0" />

                      {/* Case Assessment Facts Modal Trigger */}
                      {activeConsultation.caseSummary && (
                        <button
                          type="button"
                          onClick={() => setShowCaseAssessment(true)}
                          className="h-8 px-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                          title="View Case Assessment & Facts"
                        >
                          <FileText size={13} className="text-indigo-600 shrink-0" />
                          <span className="hidden md:inline">Facts</span>
                        </button>
                      )}

                      {/* Rate Advocate Trigger */}
                      <button
                        type="button"
                        onClick={() => setShowRatingModal(true)}
                        className="h-8 px-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                        title="Rate this Advocate"
                      >
                        <Star size={13} className="text-amber-500 fill-amber-400 shrink-0" />
                        <span className="hidden md:inline">Rate</span>
                      </button>

                      {/* End Consultation Button */}
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
                        disabled={completeMutation.isPending || activeConsultation?.status === 'COMPLETED'}
                        className="h-8 px-2.5 sm:px-3 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50 shrink-0 active:scale-95"
                        title="Conclude consultation and move to history"
                      >
                        <CheckSquare size={13} className="text-rose-600 shrink-0" />
                        <span>{completeMutation.isPending ? 'Ending...' : 'End'}</span>
                      </button>

                    </div>
                  </div>

                  {/* Compact Status Banners */}
                  {activeConsultation.status === 'ACCEPTED' && isChatLocked(activeConsultation) && (
                    <div className="mx-4 mt-3 px-3.5 py-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar size={14} className="text-emerald-600 shrink-0" />
                        <span className="truncate">
                          <strong>Appointment Scheduled:</strong> {activeConsultation.assignedDate || 'Upcoming'} at {activeConsultation.assignedTime || 'Scheduled Time'}.
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 shrink-0 flex items-center gap-1">
                        <Lock size={11} /> Unlocks at session time
                      </span>
                    </div>
                  )}

                  {activeConsultation.status === 'REQUESTED' && (
                    <div className="mx-4 mt-3 px-3.5 py-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock size={14} className="text-amber-600 shrink-0" />
                        <span className="truncate">
                          <strong>Consultation Request Pending:</strong> {formatName(activeConsultation.lawyerName)} will assign your session time shortly.
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-white px-2.5 py-0.5 rounded-md border border-amber-200 shrink-0">
                        Awaiting Time
                      </span>
                    </div>
                  )}

                  {isFreeExpired && !isPaidActive && (
                    <div className="mx-4 mt-3 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertCircle size={15} className="text-rose-600 shrink-0" />
                        <span className="truncate">
                          <strong>Session Ended:</strong> Free consultation concluded. Complete payment to continue chatting.
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        Unlock Chat ({formatRateShort(activeConsultation.lawyerRate)})
                      </button>
                    </div>
                  )}

                  {/* MESSAGES STREAM AREA */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    
                    {/* Welcome Prompt Card when no messages exist */}
                    {messages.length === 0 && (
                      <div className="max-w-xl mx-auto my-6 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                          <Sparkles size={22} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                            Consultation Room with {formatName(activeConsultation.lawyerName)}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Your secure legal consultation room is ready. Ask your legal questions or choose a suggested starter below.
                          </p>
                        </div>

                        {!isChatLocked(activeConsultation) && (
                          <div className="pt-2 space-y-1.5 text-left">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Suggested Questions:
                            </span>
                            {quickSuggestedPrompts.map((prompt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setInputMsg(prompt)}
                                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/70 hover:bg-indigo-50/50 text-xs text-slate-700 hover:text-indigo-900 transition-all flex items-center justify-between cursor-pointer"
                              >
                                <span>{prompt}</span>
                                <ArrowRight size={12} className="text-slate-400 shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chat Messages */}
                    {messages.map(msg => {
                      const isCustomer = msg.sender === 'CUSTOMER';
                      const isAttachment = msg.text && (msg.text.includes('📎') || msg.text.includes('Attached') || msg.text.toLowerCase().includes('.pdf'));
                      const match = msg.text.match(/\[(?:Attached File|Attached Document|Attached Legal File):\s*(.*?)\]/);
                      const fileName = match ? match[1] : 'Legal_Evidence_Document.pdf';

                      return (
                        <div key={msg.id} className={`flex w-full items-end gap-2 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                          
                          {/* Advocate Avatar next to message */}
                          {!isCustomer && (
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                              {getInitials(activeConsultation.lawyerName)}
                            </div>
                          )}

                          <div className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl shadow-2xs space-y-1 ${
                            isCustomer 
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs' 
                              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                          }`}>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                              isCustomer ? 'text-indigo-200' : 'text-indigo-600'
                            }`}>
                              {isCustomer ? 'You' : formatName(activeConsultation.lawyerName)}
                            </span>
                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words">
                              {msg.text}
                            </p>

                            {/* Attachment Box */}
                            {isAttachment && (
                              <div className="pt-2">
                                {fileName.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                                  <div 
                                    onClick={() => openDocumentViewer(fileName)}
                                    className="cursor-pointer rounded-xl overflow-hidden border border-slate-300 max-h-48 bg-slate-900 block shadow-2xs"
                                  >
                                    <img 
                                      src={msg.fileUrl || `https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80`} 
                                      alt={fileName}
                                      className="w-full max-h-48 object-cover block"
                                    />
                                    <div className="p-2 bg-slate-900 text-white text-xs flex items-center justify-between">
                                      <span className="truncate">📷 {fileName}</span>
                                      <span className="text-indigo-300 font-semibold text-[10px]">Expand</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    onClick={() => openDocumentViewer(fileName)}
                                    className="bg-slate-900 text-white border border-indigo-400/80 rounded-xl p-2.5 cursor-pointer flex items-center justify-between gap-2 shadow-xs hover:border-indigo-300 transition-all"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText size={16} className="text-indigo-400 shrink-0" />
                                      <span className="text-xs font-semibold truncate">
                                        {fileName}
                                      </span>
                                    </div>
                                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold shrink-0">
                                      Preview PDF
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            <span className={`text-[9px] block text-right ${
                              isCustomer ? 'text-indigo-200/80' : 'text-slate-400'
                            }`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Attached File Preview Bar */}
                  {attachedFile && (
                    <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <Paperclip size={14} className="text-amber-600 shrink-0" /> 
                        <span>Attached File: <strong>{attachedFile.name}</strong> ({Math.round(attachedFile.size / 1024)} KB)</span>
                      </span>
                      <button type="button" onClick={() => setAttachedFile(null)} className="text-amber-800 hover:text-amber-950 p-1 cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Chat Input Bar */}
                  <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200/80 bg-white flex items-center gap-2">
                    <label 
                      htmlFor="customer-chat-attachment-input" 
                      title="Attach File (Images, PDF, Word documents)"
                      onClick={(e) => {
                        if (isFreeExpired && !isPaidActive) {
                          e.preventDefault();
                          setShowPaymentModal(true);
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                        isChatLocked(activeConsultation) || (isFreeExpired && !isPaidActive)
                          ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                          : attachedFile 
                          ? 'border-amber-300 bg-amber-50 text-amber-700 cursor-pointer'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer'
                      }`}
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
                      className="hidden" 
                    />
                    
                    <input 
                      type="text"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed font-['Outfit',sans-serif]"
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
                    />

                    <button 
                      type="submit" 
                      disabled={isChatLocked(activeConsultation) || (!inputMsg.trim() && !attachedFile && !(isFreeExpired && !isPaidActive))}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs hover:shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isChatLocked(activeConsultation) || (isFreeExpired && !isPaidActive) ? <Lock size={16} /> : <Send size={16} />}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                  <EmptyState 
                    icon={MessageSquare}
                    title="No Consultation Selected"
                    message="Select a consultation session from the left queue to open live chat and view scheduled times."
                  />
                  <Link
                    to="/customer/find-lawyers"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all"
                  >
                    <Plus size={14} />
                    <span>Find & Book an Advocate</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {activeConsultation && (
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          title="Continue Consultation"
          amount={String(typeof activeConsultation.lawyerRate === 'object' ? (activeConsultation.lawyerRate?.amount || 199) : (activeConsultation.lawyerRate || "199")).replace(/[^0-9.]/g, '') || "199.00"}
          lawyerName={activeConsultation.lawyerName}
          lawyerUpiId={activeConsultation.lawyerUpiId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Client Advocate Rating Modal */}
      {showRatingModal && activeConsultation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-['Outfit',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={20} className="text-amber-500 fill-amber-500" />
                <div className="text-base font-bold text-slate-900">Rate Your Advocate</div>
              </div>
              <button 
                onClick={() => setShowRatingModal(false)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              How was your consultation experience with <strong className="text-slate-800">{formatName(activeConsultation.lawyerName)}</strong>? Your rating helps other clients choose verified advocates.
            </p>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div className="text-center py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Select Rating ({hoverRating || userRating} / 5 Stars)
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={(hoverRating || userRating) >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Feedback Review:
                </label>
                <textarea
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs resize-none"
                  rows={3}
                  placeholder="Share details about the advocate's legal guidance, responsiveness, or advice..."
                  value={ratingComment}
                  onChange={e => setRatingComment(e.target.value)}
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button 
                  type="button" 
                  onClick={() => setShowRatingModal(false)} 
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF / Document Viewer Overlay Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-['Outfit',sans-serif]">
          <div className="bg-white rounded-3xl max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText size={20} className="text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">Document Viewer: {viewingPdfName}</div>
                  <span className="text-[11px] text-slate-400">Verified Legal Attachment • Ref #{activeConsultation?.id || '1'}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowPdfModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 bg-slate-50 p-6 overflow-y-auto flex flex-col items-center">
              {viewingPdfName.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center max-w-2xl w-full">
                  <img 
                    src={`https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80`} 
                    alt={viewingPdfName}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg border border-slate-100 mx-auto"
                  />
                  <p className="mt-3 text-xs font-semibold text-slate-700">
                    Image Attachment: {viewingPdfName}
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-xs sm:text-sm text-slate-800 leading-relaxed max-w-2xl w-full space-y-4">
                  <div className="text-center border-b border-slate-200 pb-3">
                    <div className="text-base font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">LEGAL CONSULTATION CASE DOCUMENT</div>
                    <p className="text-xs text-slate-400 mt-0.5">Adalat Legal Services • File: {viewingPdfName}</p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700">
                    <p><strong>Client:</strong> Client Session</p>
                    <p><strong>Advocate:</strong> {formatName(activeConsultation?.lawyerName)}</p>
                    <p><strong>Matter Category:</strong> {activeConsultation?.category || 'Legal Consultation'}</p>
                    <p><strong>Assigned Time:</strong> {activeConsultation?.assignedDate || 'Scheduled'} at {activeConsultation?.assignedTime || 'Time'}</p>
                  </div>

                  <div className="bg-slate-50 border-l-4 border-indigo-600 p-3.5 rounded-xl text-xs italic text-slate-700">
                    <strong>ATTACHED CASE FACTS & SUMMARY:</strong>
                    <p className="mt-1 font-normal not-italic">
                      {activeConsultation?.caseSummary || 'Legal intake document and case evidence attached for advocate consultation review.'}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400 italic text-center pt-4">
                    *** Official Document generated via Adalat Portal ***
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                📄 Verified Document Preview
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const blob = new Blob([activeConsultation?.caseSummary || "Official Adalat Case Document"], { type: "application/pdf" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = viewingPdfName;
                    a.click();
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download Document</span>
                </button>
                <button 
                  onClick={() => setShowPdfModal(false)} 
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Assessment Modal */}
      {showCaseAssessment && activeConsultation && activeConsultation.caseSummary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-['Outfit',sans-serif]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">Shared Case Assessment & Facts</h3>
              </div>
              <button 
                onClick={() => setShowCaseAssessment(false)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 max-h-96 overflow-y-auto whitespace-pre-line text-xs leading-relaxed text-slate-700 font-sans">
              {activeConsultation.caseSummary}
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                type="button"
                onClick={() => setShowCaseAssessment(false)} 
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerConsultationPage;
