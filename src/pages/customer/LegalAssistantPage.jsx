import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import CustomerHeader from '../../components/CustomerHeader';
import apiClient from '../../api/apiClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  UserCheck, 
  FileText, 
  MessageSquare, 
  Users, 
  Calendar, 
  Loader2, 
  Trash2, 
  Sparkles, 
  Scale, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  MapPin, 
  Languages, 
  GraduationCap, 
  Award, 
  Edit3, 
  HelpCircle,
  History,
  Plus,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';

const LegalAssistantPage = () => {
  const [sessionsList, setSessionsList] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initializePage = async () => {
    await fetchSessionsList();
    // Auto-create or load an active session on first open
    try {
      const res = await apiClient.post('/api/customer/legal-assistance/sessions?forceNew=false');
      const data = res.data;
      setSession(data);
      if (data.messageHistory && data.messageHistory.length > 0) {
        setMessages(data.messageHistory);
      } else if (data.assistantMessage) {
        setMessages([{
          id: 'init-' + Date.now(),
          senderType: 'AI',
          message: data.assistantMessage,
          createdAt: new Date().toISOString()
        }]);
      }
      // refresh sidebar after auto-session
      fetchSessionsList();
    } catch (err) {
      console.error('Failed to auto-initialize session', err);
    }
  };

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    const q = searchParams.get('query');
    if (q) {
      setInputValue(q);
    }
  }, [searchParams]);

  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const fetchSessionsList = async (autoLoadId = null) => {
    try {
      setSidebarLoading(true);
      const res = await apiClient.get('/api/customer/legal-assistance/sessions');
      const list = res.data;
      setSessionsList(list);
      
      if (list && list.length > 0) {
        if (autoLoadId) {
          loadSession(autoLoadId);
        }
      }
    } catch (err) {
      console.error('Failed to load session history', err);
    } finally {
      setSidebarLoading(false);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      setIsEditing(false);
      const res = await apiClient.get(`/api/customer/legal-assistance/sessions/${sessionId}`);
      const data = res.data;
      setSession(data);
      if (data.messageHistory && data.messageHistory.length > 0) {
        setMessages(data.messageHistory);
      } else if (data.assistantMessage) {
        setMessages([{
          id: 'init-' + Date.now(),
          senderType: 'AI',
          message: data.assistantMessage,
          createdAt: new Date().toISOString()
        }]);
      }
    } catch (err) {
      if (err.status === 401 || err.message?.includes('401') || err.message?.includes('403')) {
        setError('Session expired or access denied. Please log in again.');
      } else {
        setError('Failed to load the specific session.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsEditing(false);
      setInputValue('');
      setSession(null);
      setMessages([]);
      
      const res = await apiClient.post('/api/customer/legal-assistance/sessions?forceNew=true');
      const data = res.data;
      setSession(data);
      if (data.messageHistory && data.messageHistory.length > 0) {
        setMessages(data.messageHistory);
      } else if (data.assistantMessage) {
        setMessages([{
          id: 'init-' + Date.now(),
          senderType: 'AI',
          message: data.assistantMessage,
          createdAt: new Date().toISOString()
        }]);
      }
      await fetchSessionsList();
    } catch (err) {
      if (err.status === 401 || err.message?.includes('401') || err.message?.includes('403')) {
        setError('Session expired or access denied. Please log in again.');
      } else {
        setError('Failed to start a new consultation.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat session?')) return;
    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(`/api/customer/legal-assistance/sessions/${sessionId}`);
      if (session?.sessionId === sessionId) {
        setSession(null);
        setMessages([]);
      }
      await fetchSessionsList();
    } catch (err) {
      console.error('Failed to delete session', err);
      setError('Failed to delete chat session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    let activeSessionId = session?.sessionId;
    let currentSession = session;

    // If we're on the welcome state and haven't created a session yet
    if (!currentSession) {
      try {
        setLoading(true);
        const res = await apiClient.post('/api/customer/legal-assistance/sessions?forceNew=true');
        currentSession = res.data;
        setSession(currentSession);
        activeSessionId = currentSession.sessionId;
        await fetchSessionsList(); // update sidebar
        setLoading(false);
      } catch {
        setError('Failed to initialize session.');
        setLoading(false);
        return;
      }
    }

    const text = inputValue.trim();
    const clientMsgId = crypto.randomUUID ? crypto.randomUUID() : 'msg-' + Date.now();
    
    // Optimistic UI update
    const newMsg = {
      id: clientMsgId,
      senderType: 'CUSTOMER',
      message: text,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);
    setError(null);
    setIsEditing(false);

    try {
      const res = await apiClient.post(`/api/customer/legal-assistance/sessions/${activeSessionId}/messages`, {
        message: text,
        clientMessageId: clientMsgId
      });
      const data = res.data;
      setSession(data);
      
      if (data.messageHistory && data.messageHistory.length > 0) {
        let history = [...data.messageHistory];
        if (data.assistantMessage && history[history.length - 1].senderType !== 'AI') {
          history.push({
            id: 'ai-fallback-' + Date.now(),
            senderType: 'AI',
            message: data.assistantMessage,
            createdAt: new Date().toISOString()
          });
        }
        setMessages(history);
      } else if (data.assistantMessage) {
        setMessages(prev => [...prev, {
          id: 'ai-' + Date.now(),
          senderType: 'AI',
          message: data.assistantMessage,
          createdAt: new Date().toISOString()
        }]);
      }
      
      // Update sidebar summary
      fetchSessionsList();
    } catch (err) {
      if (err.status === 401 || err.message?.includes('401')) {
        setError('Your session has expired. Please log in again.');
      } else {
        setMessages(prev => [...prev, {
          id: 'err-' + Date.now(),
          senderType: 'AI',
          message: "The Legal Assistant is temporarily unavailable. Your message has been saved. Please try again.",
          createdAt: new Date().toISOString()
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmSummary = async () => {
    if (!session?.sessionId || actionLoading) return;
    try {
      setActionLoading(true);
      setError(null);
      const res = await apiClient.post(`/api/customer/legal-assistance/sessions/${session.sessionId}/confirm`);
      const data = res.data;
      setSession(data);
      if (data.messageHistory && data.messageHistory.length > 0) {
        setMessages(data.messageHistory);
      }
      fetchSessionsList(); // update status in sidebar
    } catch (err) {
      if (err.status === 401 || err.message?.includes('401')) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.message || 'Failed to confirm summary.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleNextStep = async (action) => {
    if (!session?.sessionId || actionLoading) return;
    try {
      setActionLoading(true);
      setError(null);
      const res = await apiClient.post(`/api/customer/legal-assistance/sessions/${session.sessionId}/next-step`, { action });
      const data = res.data;
      setSession(data);
      if (data.messageHistory && data.messageHistory.length > 0) {
        setMessages(data.messageHistory);
      }
      fetchSessionsList(); // update status in sidebar
    } catch (err) {
      if (err.status === 401 || err.message?.includes('401')) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.message || 'Failed to process next action.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSummaryMode = session?.status === 'SUMMARY_READY' || (session?.canConfirm && !session?.summaryConfirmed);
  // Hide input if the session is closed/assigned
  const isReadOnly = session && ['ASSIGNED', 'AI_ONLY_COMPLETED', 'CLOSED'].includes(session.status);

  const getSessionDisplayTitle = (s, index) => {
    if (s?.title && s.title.trim()) {
      return s.title.trim();
    }
    if (s?.summary && s.summary.trim()) {
      const firstLine = s.summary.trim().split('\n')[0];
      return firstLine.length > 28 ? firstLine.substring(0, 28) + '...' : firstLine;
    }
    if (s?.createdAt) {
      try {
        const d = new Date(s.createdAt);
        const isToday = new Date().toDateString() === d.toDateString();
        if (isToday) {
          return `Chat · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return `Chat · ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
      } catch {
        // fallback
      }
    }
    return `Consultation #${sessionsList.length - index}`;
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const s = status.toUpperCase();
    if (s === 'ACTIVE') {
      return (
        <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full leading-none">
          Active
        </span>
      );
    }
    if (s === 'SUMMARY_READY' || s === 'AWAITING_NEXT_STEP') {
      return (
        <span className="inline-flex items-center text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-full leading-none">
          Action
        </span>
      );
    }
    return (
      <span className="text-[10px] font-normal text-slate-400 leading-none">
        Closed
      </span>
    );
  };

  const handleConsultLawyer = async (lawyer) => {
    try {
      // 1. Create the consultation request in the backend
      await apiClient.post('/api/customer/consultations', {
        lawyerId: lawyer.lawyerId || lawyer.id,
        caseSummary: 'Consultation requested from AI Legal Assistant'
      });
      // 2. Navigate to the consultations page (which will now fetch the newly created request)
      navigate('/customer/consultations');
    } catch (err) {
      console.error('Failed to create consultation request:', err);
      // Fallback: just navigate and let the user handle it
      navigate(`/customer/consultations?lawyerId=${lawyer.lawyerId || lawyer.id}`);
    }
  };  const renderMessages = () => {
    return messages.map((msg, index) => {
      const isAI = msg.senderType === 'AI';
      if (isSummaryMode && !isEditing && isAI && msg.message && (msg.message.startsWith('Case Category:') || msg.message.includes('Based on your description, here are the key facts'))) {
        return null;
      }

      return (
        <div 
          key={msg.id || index} 
          className={`flex w-full mb-5 ${isAI ? 'justify-start' : 'justify-end'}`}
        >
          {isAI ? (
            <div className="flex items-start gap-3 max-w-[92%] sm:max-w-[85%]">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20 mt-0.5 border border-indigo-400/20">
                <Bot size={17} />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 pl-1">
                  <span className="text-xs font-bold text-slate-800">Adalat Legal AI</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    <Sparkles size={10} className="text-amber-500" />
                    <span>Indian Law (BNS & IPC)</span>
                  </span>
                </div>
                <div className="bg-white border border-slate-200/90 text-slate-800 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-sm text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {msg.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-end gap-2.5 max-w-[92%] sm:max-w-[85%]">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-sm px-4 sm:px-5 py-3 sm:py-3.5 shadow-sm shadow-indigo-600/25 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
                {msg.message}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="customer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        
        {/* COMPACT CUSTOMER HEADER */}
        <CustomerHeader 
          title="Legal Assistant" 
          subtitle="Your 24/7 intelligent legal companion for procedural guidance & advocate matching."
          badge={{ text: "AI Live", variant: "indigo" }}
          actions={
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setIsHistoryOpen(prev => !prev)}
                title={isHistoryOpen ? "Collapse chat history" : "Open chat history"}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 shadow-xs shrink-0 ${
                  isHistoryOpen
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border-slate-200'
                }`}
              >
                <PanelLeft size={13} className={isHistoryOpen ? 'text-indigo-600' : 'text-slate-500'} />
                <span>History</span>
                {sessionsList.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {sessionsList.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={handleStartNew} 
                disabled={loading}
                title="Start new consultation"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          }
        />

        {/* WORKSPACE: LEFT CHATGPT SESSIONS SIDEBAR + RIGHT CHAT CONTAINER */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          
          {/* CHATGPT-STYLE CHAT HISTORY SIDEBAR: Absolute overlay on mobile, relative on sm */}
          <aside 
            className={`${
              isHistoryOpen ? 'w-72 sm:w-76 max-w-[85vw] border-r border-slate-200/90' : 'w-0 border-r-0'
            } transition-all duration-300 ease-in-out bg-slate-50/80 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden absolute sm:relative inset-y-0 left-0 shadow-xl sm:shadow-none z-30 sm:z-20`}
          >
            {/* Sidebar Header with Title, Counter and Collapse Close Button */}
            <div className="px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/80">
              <div className="flex items-center gap-2 min-w-0">
                <History size={15} className="text-indigo-600 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 truncate">
                  Consultations
                </span>
                {sessionsList.length > 0 && (
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full shrink-0">
                    {sessionsList.length}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                title="Collapse sidebar"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>

            {/* New Chat CTA button inside Sidebar */}
            <div className="p-3 border-b border-slate-200/70 bg-white/40">
              <button 
                onClick={handleStartNew} 
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm shadow-indigo-600/25 hover:shadow-md hover:shadow-indigo-600/35 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />}
                <span>New Consultation</span>
              </button>
            </div>

            {/* Vertical Sessions List with compact spacing */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              {sidebarLoading && sessionsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                  <Loader2 className="animate-spin text-indigo-600" size={20} />
                  <span className="text-xs font-medium">Loading history...</span>
                </div>
              ) : sessionsList.length === 0 ? (
                <div className="text-center py-10 px-3 text-slate-400">
                  <MessageSquare size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No previous chats</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click New to begin</p>
                </div>
              ) : (
                sessionsList.map((s, idx) => {
                  const isSelected = session?.sessionId === s.sessionId;
                  const displayTitle = getSessionDisplayTitle(s, idx);
                  return (
                    <div 
                      key={s.sessionId}
                      onClick={() => loadSession(s.sessionId)}
                      title={s.summary || displayTitle}
                      className={`group relative flex items-center justify-between gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-white border-slate-200 text-indigo-950 font-bold shadow-sm border-l-4 border-l-indigo-600'
                          : 'bg-white/50 hover:bg-white border-slate-200/60 hover:border-slate-300 text-slate-700 font-medium hover:shadow-xs'
                      }`}
                    >
                      {/* Left: Icon with active indicator dot */}
                      <div className="relative shrink-0 flex items-center justify-center">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                          <Scale size={14} />
                        </div>
                        {s.status === 'ACTIVE' && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                        )}
                      </div>

                      {/* Center: Truncated Title on single line */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs truncate leading-snug">
                          {displayTitle}
                        </p>
                      </div>

                      {/* Right: Inline Micro Status or Delete Button on Hover */}
                      <div className="shrink-0 flex items-center gap-1">
                        <div className="group-hover:hidden flex items-center">
                          {getStatusBadge(s.status)}
                        </div>
                        <button
                          onClick={(e) => handleDeleteSession(e, s.sessionId)}
                          title="Delete consultation"
                          className="hidden group-hover:flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* MAIN CHAT WORKSPACE (RIGHT SIDE) */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-[#f8fafc]">
            
            {/* Quick history toggle button when collapsed */}
            {!isHistoryOpen && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                title="Open chat history"
                className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              >
                <PanelLeft size={13} className="text-slate-400 group-hover:text-indigo-600" />
                <span className="text-[11px] font-semibold">History</span>
                {sessionsList.length > 0 && (
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 px-1 py-0.2 rounded-full">
                    {sessionsList.length}
                  </span>
                )}
              </button>
            )}
            
            {/* SCROLLABLE CONVERSATION / WELCOME HERO */}
            <div 
              ref={chatScrollContainerRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col items-center [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              
              {(!session && messages.length === 0) ? (
                // MODERN WELCOME HERO (Full Hero view when no session/messages)
                <div className="max-w-2xl w-full flex flex-col items-center my-auto py-6 px-4 text-center">
                  
                  {/* AI Companion Avatar with Ambient Glow */}
                  <div className="relative mb-5">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-amber-500/20 rounded-3xl blur-xl" />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-md flex items-center justify-center">
                      <Bot size={36} className="text-indigo-600" />
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white"></span>
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/90 mb-3 shadow-xs">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>24/7 Intelligent Legal Companion</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
                    How can Adalat Legal Assistant help you today?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mb-8 font-normal">
                    Ask legal questions, explore procedural roadmaps under Indian Law, or connect directly with Bar Council verified advocates.
                  </p>

                  {/* 4 Quick Starter Prompt Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                    {[
                      { icon: MessageSquare, label: 'Property & Eviction Notice', desc: 'Tenancy rights, illegal possession, or vacation notices' },
                      { icon: FileText, label: 'Cheque Bounce (Sec 138 NI Act)', desc: 'Statutory 30-day notice & filing criminal complaint' },
                      { icon: Users, label: 'Employment & Unpaid Salary', desc: 'Wrongful termination, dues recovery, or employment contract' },
                      { icon: Calendar, label: 'Book Verified Advocate', desc: 'Schedule confidential advisory with specialized counsel' }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button 
                          key={idx} 
                          onClick={() => setInputValue(`I need legal guidance regarding ${item.label}. What are the procedural steps?`)} 
                          className="group p-4 rounded-2xl bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/90 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 shadow-xs">
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                {item.label}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={15} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // ACTIVE CHAT STREAM
                <div className="max-w-3xl w-full flex flex-col flex-1 pb-4">
                  <div className="flex flex-col">
                    {messages.length === 0 && loading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="animate-spin text-indigo-600" size={30} />
                      </div>
                    ) : (
                      renderMessages()
                    )}

                    {/* QUICK STARTER PROMPT CARDS (Always visible when conversation is in initial greeting state) */}
                    {messages.length <= 1 && (
                      <div className="w-full mt-3 mb-6 pt-2">
                        <div className="flex items-center gap-2 mb-3 px-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Suggested Legal Inquiries • Click to Ask
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          {[
                            { icon: FileText, label: 'Property & Eviction Notice', desc: 'Tenancy rights, illegal possession, or vacation notices' },
                            { icon: Scale, label: 'Cheque Bounce (Sec 138 NI Act)', desc: 'Statutory 30-day notice & filing criminal complaint' },
                            { icon: Users, label: 'Employment & Unpaid Dues', desc: 'Wrongful termination, unpaid salary, or contract breach' },
                            { icon: ShieldCheck, label: 'Consumer Forum Dispute', desc: 'Filing complaints for defective products or refund claims' }
                          ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <button 
                                key={idx} 
                                onClick={() => setInputValue(`I need legal advice regarding ${item.label}. What are the procedural steps under Indian Law?`)} 
                                className="group p-4 rounded-2xl bg-white hover:bg-indigo-50/40 border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-between text-left"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/90 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 shadow-xs">
                                    <Icon size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                      {item.label}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                      {item.desc}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight size={15} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {isTyping && (
                      <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[80%] mb-4">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          <Bot size={16} />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                        </div>
                      </div>
                    )}

                    {/* CASE SUMMARY DOSSIER CARD */}
                    {session?.summary && isSummaryMode && (
                      <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-amber-100/40 border border-amber-200/90 shadow-xs">
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2 text-amber-900">
                            <div className="w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center text-amber-700">
                              <Sparkles size={14} />
                            </div>
                            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">Case Summary Generated</h4>
                          </div>
                          <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-800 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            Action Needed
                          </span>
                        </div>

                        <div className="text-amber-950 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-white/95 p-4 rounded-xl border border-amber-200/80 mb-4 shadow-2xs font-normal">
                          {session.summary}
                        </div>
                        
                        {!isEditing && (
                          <div className="flex flex-wrap items-center gap-2.5">
                            <button 
                              onClick={() => handleConfirmSummary()} 
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                              <span>Confirm & Proceed</span>
                            </button>
                            <button 
                              onClick={() => setIsEditing(true)} 
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Edit3 size={13} />
                              <span>Change / Add Information</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* NEXT STEP SELECTION CARDS */}
                    {session?.nextActionRequired && session?.availableActions && (
                      <div className="mt-4 p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 shadow-xs">
                        <div className="flex items-center gap-2 mb-1.5 text-indigo-900">
                          <div className="w-6 h-6 rounded-md bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                            <Bot size={14} />
                          </div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900">Choose Your Next Step</h4>
                        </div>
                        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                          Would you like to connect with a verified advocate for direct consultation or continue with AI guidance only?
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleNextStep('CONNECT_LAWYER')} 
                            disabled={actionLoading}
                            className="group p-4 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-400 shadow-xs transition-all text-left flex flex-col justify-between cursor-pointer active:scale-98 disabled:opacity-50"
                          >
                            <div>
                              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2.5 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                                <UserCheck size={18} />
                              </div>
                              <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                Connect with Verified Advocate
                              </h5>
                              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                                Direct confidential consultation and representation from Bar Council verified lawyers.
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 mt-3 pt-2 border-t border-slate-100 w-full justify-between">
                              <span>Select Option</span>
                              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>

                          <button 
                            onClick={() => handleNextStep('AI_ONLY')} 
                            disabled={actionLoading}
                            className="group p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 shadow-xs transition-all text-left flex flex-col justify-between cursor-pointer active:scale-98 disabled:opacity-50"
                          >
                            <div>
                              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-2.5 group-hover:bg-slate-800 group-hover:text-white transition-all shadow-2xs">
                                <Bot size={18} />
                              </div>
                              <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                Continue with AI Guidance Only
                              </h5>
                              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                                Receive automated legal roadmaps, step-by-step procedural steps, and law citations.
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 mt-3 pt-2 border-t border-slate-100 w-full justify-between">
                              <span>Select Option</span>
                              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* MATCHING ADVOCATES DIRECTORY */}
                    {session?.suggestedLawyers?.length > 0 && !session?.matchedLawyer && (
                      <div className="mt-5 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <Scale size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight leading-tight">
                              Advocates Matching Your Matter
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Verified legal counsel specialized in your case requirements
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3.5">
                          {session.suggestedLawyers.map(lawyer => {
                            const practiceStr = Array.isArray(lawyer.practiceAreas)
                              ? lawyer.practiceAreas.map(p => typeof p === 'string' ? p.replace(/_/g, ' ') : p).join(', ')
                              : 'General Practice';
                            const langStr = Array.isArray(lawyer.languages)
                              ? lawyer.languages.join(', ')
                              : 'English, Hindi';
                            return (
                              <div 
                                key={lawyer.lawyerId} 
                                className="bg-slate-50/70 hover:bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all duration-200"
                              >
                                {/* Top row: avatar + name + badge */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center text-base font-bold shrink-0 shadow-2xs">
                                      {lawyer.fullName ? lawyer.fullName.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-slate-900 text-sm sm:text-base truncate">{lawyer.fullName}</span>
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                          <ShieldCheck size={11} /> Verified
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                                        <span className="text-amber-500 font-semibold flex items-center gap-1">
                                          <Star size={12} className="fill-amber-400" />
                                          {lawyer.rating ? lawyer.rating.toFixed(1) : '4.8'}
                                        </span>
                                        <span>•</span>
                                        <span>{lawyer.yearsOfExperience || 5}+ yrs exp</span>
                                        <span>•</span>
                                        <span>{lawyer.totalConsultations || 0} consultations</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <div className="font-bold text-emerald-700 text-base">₹{lawyer.consultationFee || 99}</div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">per session</div>
                                  </div>
                                </div>

                                {/* Details chips */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md text-[11px] text-slate-700 shadow-2xs">
                                    <MapPin size={11} className="text-indigo-600" />
                                    {lawyer.location || 'India'}
                                  </span>
                                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md text-[11px] text-slate-700 shadow-2xs">
                                    <Languages size={11} className="text-indigo-600" />
                                    {langStr}
                                  </span>
                                  {lawyer.education && (
                                    <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md text-[11px] text-slate-700 shadow-2xs">
                                      <GraduationCap size={11} className="text-indigo-600" />
                                      {lawyer.education}
                                    </span>
                                  )}
                                  {lawyer.barEnrollmentNumber && (
                                    <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md text-[11px] text-slate-700 shadow-2xs">
                                      <Award size={11} className="text-indigo-600" />
                                      Bar: {lawyer.barEnrollmentNumber}
                                    </span>
                                  )}
                                </div>

                                {/* Practice areas */}
                                <div className="mb-2 text-xs">
                                  <span className="font-semibold text-slate-700">Practice Areas: </span>
                                  <span className="text-slate-600">{practiceStr}</span>
                                </div>

                                {/* Bio */}
                                {lawyer.bio && (
                                  <p className="text-xs text-slate-600 mb-3.5 line-clamp-2 leading-relaxed">
                                    {lawyer.bio}
                                  </p>
                                )}

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => setSelectedLawyer(lawyer)}
                                    className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 font-semibold text-xs transition-all cursor-pointer active:scale-95 shadow-2xs"
                                  >
                                    View Profile
                                  </button>
                                  <button
                                    onClick={() => handleConsultLawyer(lawyer)}
                                    className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                                  >
                                    Consult Now
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
            </div>

            {/* DOCKED CHAT COMPOSER: Clears mobile bottom navigation with pb-20 */}
            <div className="p-3 sm:p-4 pb-20 lg:pb-4 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shrink-0 flex flex-col items-center shadow-sm">
              <div className="max-w-3xl w-full">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2 rounded-xl mb-2.5 text-center flex items-center justify-center gap-1.5 shadow-xs">
                    <HelpCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 p-2 pl-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-md shadow-slate-200/40 transition-all">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isEditing ? "Tell me what you'd like to change or add..." : (isReadOnly ? "This consultation is completed." : "Describe your legal matter or question (e.g., notice, property dispute)...")}
                    disabled={isTyping || actionLoading || isReadOnly}
                    className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none py-1.5 disabled:cursor-not-allowed font-medium"
                  />
                  
                  {inputValue && !isTyping && (
                    <button
                      type="button"
                      onClick={() => setInputValue('')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Clear input"
                    >
                      <X size={14} />
                    </button>
                  )}

                  <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping || actionLoading || isReadOnly}
                    className="h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/25 cursor-pointer shrink-0 active:scale-95 disabled:shadow-none"
                  >
                    {isTyping ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 mt-2.5 text-center">
                  <Scale size={11} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    Adalat AI provides procedural guidance under Indian Law. Critical decisions should be verified with registered counsel.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* LAWYER PROFILE MODAL */}
      {selectedLawyer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedLawyer(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative shadow-2xl text-slate-800 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setSelectedLawyer(null)} 
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Avatar + Name */}
            <div className="flex items-center gap-3.5 mb-5 pr-8">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md">
                {selectedLawyer.fullName ? selectedLawyer.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedLawyer.fullName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    <ShieldCheck size={11} /> Verified
                  </span>
                  {selectedLawyer.available && (
                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Available
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="text-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <div className="text-sm sm:text-base font-bold text-amber-500 flex items-center justify-center gap-1">
                  <Star size={13} className="fill-amber-400" />
                  {selectedLawyer.rating ? selectedLawyer.rating.toFixed(1) : '4.8'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5 font-semibold">Rating</div>
              </div>
              <div className="text-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {selectedLawyer.yearsOfExperience || 5}+
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5 font-semibold">Years Exp</div>
              </div>
              <div className="text-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {selectedLawyer.totalConsultations || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5 font-semibold">Consultations</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">📍 Location:</span>
                <span className="text-slate-800 font-semibold">{selectedLawyer.location || 'India'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">🎓 Education:</span>
                <span className="text-slate-800 font-semibold">{selectedLawyer.education || 'LLB'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">🗣️ Languages:</span>
                <span className="text-slate-800 font-semibold truncate max-w-[200px]">
                  {Array.isArray(selectedLawyer.languages) ? selectedLawyer.languages.join(', ') : 'English, Hindi'}
                </span>
              </div>
              {selectedLawyer.barEnrollmentNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">📋 Bar Number:</span>
                  <span className="text-slate-800 font-semibold">{selectedLawyer.barEnrollmentNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">💼 Practice:</span>
                <span className="text-slate-800 font-semibold truncate max-w-[200px]">
                  {Array.isArray(selectedLawyer.practiceAreas) ? selectedLawyer.practiceAreas.map(p => typeof p === 'string' ? p.replace(/_/g, ' ') : p).join(', ') : 'General'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">💰 Fee:</span>
                <span className="text-emerald-700 font-bold text-xs sm:text-sm">₹{selectedLawyer.consultationFee || 99} per consultation</span>
              </div>
            </div>

            {/* Bio */}
            {selectedLawyer.bio && (
              <div className="mb-4">
                <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider mb-1.5">About</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedLawyer.bio}
                </p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => { const l = selectedLawyer; setSelectedLawyer(null); handleConsultLawyer(l); }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Consult This Advocate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalAssistantPage;
