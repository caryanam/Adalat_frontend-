import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  UserCheck, 
  FileText, 
  MessageSquare,
  Users,
  Calendar,
  RefreshCcw,
  Loader2,
  Bell,
  Clock,
  Trash2
} from 'lucide-react';
import './LegalAssistantPage.css';

const LegalAssistantPage = () => {
  const { user } = useAuth();
  const [sessionsList, setSessionsList] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  
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
  const navigate = useNavigate();

  useEffect(() => {
    initializePage();
  }, []);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      } catch (err) {
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

  const getStatusBadge = (status) => {
    if (!status) return null;
    const s = status.toUpperCase();
    if (s === 'ACTIVE') return <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '1rem', background: '#eef2ff', color: '#4f46e5', fontWeight: 600 }}>Active</span>;
    if (s === 'SUMMARY_READY' || s === 'AWAITING_NEXT_STEP') return <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '1rem', background: '#fef3c7', color: '#d97706', fontWeight: 600 }}>Action Needed</span>;
    if (s === 'ASSIGNED' || s === 'AI_ONLY_COMPLETED' || s === 'CLOSED') return <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '1rem', background: '#ecfdf5', color: '#10b981', fontWeight: 600 }}>Closed</span>;
    return <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '1rem', background: '#f3f4f6', color: '#4b5563', fontWeight: 600 }}>{s}</span>;
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
  };

  const renderMessages = () => {
    return messages.map((msg, index) => {
      const isAI = msg.senderType === 'AI';
      if (isSummaryMode && !isEditing && isAI && msg.message && (msg.message.startsWith('Case Category:') || msg.message.includes('Based on your description, here are the key facts'))) {
        return null;
      }

      const wrapperStyle = {
        display: 'flex',
        width: '100%',
        marginBottom: '12px',
        justifyContent: isAI ? 'flex-start' : 'flex-end',
      };

      const bubbleStyle = {
        maxWidth: '70%',
        padding: '10px 15px',
        borderRadius: isAI ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
        fontSize: '0.95rem',
        lineHeight: '1.5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        background: isAI ? '#f1f3f4' : '#4f46e5',
        color: isAI ? '#1f2937' : '#ffffff',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'inherit',
      };

      return (
        <div key={msg.id || index} style={wrapperStyle}>
          <div style={bubbleStyle}>{msg.message}</div>
        </div>
      );
    });
  };

  return (
    <div className="portal-layout">
      <Sidebar portalType="customer" />

      <main className="portal-main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', padding: 0 }}>
        
        {/* HEADER */}
        <div className="portal-header-custom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Welcome, {user?.fullName || 'Customer'}
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem', marginTop: '0.15rem' }}>
              Your legal companion is assisting you.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', color: '#1e3a8a', cursor: 'pointer' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: -2, right: -2, background: '#ef4444', borderRadius: '50%', width: 8, height: 8 }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: '2rem', color: '#1e3a8a', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <div style={{ width: 24, height: 24, background: '#1e3a8a', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* TOP HISTORY BAR */}
        <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 2rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', gap: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <button 
               onClick={handleStartNew} 
               style={{ padding: '0.5rem 1rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', flexShrink: 0, fontSize: '0.875rem' }}
            >
              <RefreshCcw size={14} /> New Chat
            </button>
            <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 0.25rem', flexShrink: 0 }}></div>
            {sidebarLoading && sessionsList.length === 0 ? (
               <Loader2 className="animate-spin text-primary-600" size={18} />
            ) : sessionsList.length === 0 ? (
               <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>No previous chats</span>
            ) : (
               sessionsList.map(s => (
                  <div 
                    key={s.sessionId}
                    onClick={() => loadSession(s.sessionId)}
                    style={{ 
                      padding: '0.5rem 0.75rem 0.5rem 1rem', borderRadius: '2rem', border: '1px solid #e2e8f0', 
                      background: session?.sessionId === s.sessionId ? '#eef2ff' : 'white',
                      borderColor: session?.sessionId === s.sessionId ? '#c7d2fe' : '#e2e8f0',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0
                    }}
                  >
                     <div style={{ fontSize: '0.875rem', fontWeight: session?.sessionId === s.sessionId ? 700 : 600, color: session?.sessionId === s.sessionId ? '#4f46e5' : '#374151', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.summary ? s.summary.split('\n')[0] : 'Consultation'}
                     </div>
                     {getStatusBadge(s.status)}
                     <button
                        onClick={(e) => handleDeleteSession(e, s.sessionId)}
                        title="Delete chat"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.2s',
                          marginLeft: '0.25rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                     >
                        <Trash2 size={14} />
                     </button>
                  </div>
               ))
            )}
        </div>

        {/* MAIN CHAT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: 'white' }}>
          
          {/* CHAT/EMPTY STATE CONTAINER */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {(!session && messages.length === 0) ? (
              // EMPTY STATE
              <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
                
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div style={{ width: 120, height: 120, background: 'radial-gradient(circle, #e0e7ff 0%, #f8fafc 70%)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Bot size={64} style={{ color: '#4f46e5' }} />
                  </div>
                </div>
  
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '0.75rem', textAlign: 'center' }}>Adalat Legal Assistant</h2>
                <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '3rem', lineHeight: 1.6, fontSize: '1rem', maxWidth: '500px' }}>
                  Ask your legal questions, get step-by-step guidance, or connect with verified advocates.
                </p>
  
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%' }}>
                  {[
                    { icon: MessageSquare, label: 'I have a legal question' },
                    { icon: FileText, label: 'Guide me step by step' },
                    { icon: Users, label: 'Connect with a lawyer' },
                    { icon: Calendar, label: 'Book a consultation' }
                  ].map((item, idx) => (
                    <button key={idx} onClick={() => setInputValue(item.label)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', cursor: 'pointer', transition: 'all 0.2s', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }} className="hover:shadow-md hover:border-indigo-300">
                      <div style={{ color: '#4f46e5', background: '#eef2ff', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
                        <item.icon size={20} />
                      </div>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // CHAT VIEW
              <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '2rem' }}>
                <div className="chat-messages" style={{ display: 'flex', flexDirection: 'column' }}>
                  {messages.length === 0 && loading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="animate-spin text-primary-600" size={32} />
                    </div>
                  ) : (
                    renderMessages()
                  )}
                  {isTyping && (
                    <div className="chat-message message-ai">
                      <div className="message-bubble typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}

                  {session?.summary && isSummaryMode && (
                    <div className="summary-card bg-yellow-50 border-yellow-200 mt-4 p-4 rounded-lg">
                      <h4 className="font-bold text-yellow-900 mb-2">Case Summary Ready</h4>
                      <div className="text-yellow-800 text-sm whitespace-pre-wrap">{session.summary}</div>
                      
                      {!isEditing && (
                        <div className="mt-4 flex gap-3">
                          <button className="btn btn-primary" onClick={() => handleConfirmSummary()} disabled={actionLoading}>
                            {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Confirm & Proceed'}
                          </button>
                          <button className="btn btn-outline" onClick={() => setIsEditing(true)} disabled={actionLoading}>
                            Change / Add Information
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {session?.nextActionRequired && session?.availableActions && (
                    <div className="summary-card bg-indigo-50 border-indigo-200 mt-4 p-4 rounded-lg">
                      <h4 className="font-bold text-indigo-900 mb-2">Next Step Choice</h4>
                      <p className="text-indigo-800 text-sm mb-4">Would you like to connect with a verified advocate or use AI guidance only?</p>
                      <div className="flex gap-3">
                        <button className="btn btn-primary flex items-center gap-2" onClick={() => handleNextStep('CONNECT_LAWYER')} disabled={actionLoading}>
                          <UserCheck size={16} /> Connect with Advocate
                        </button>
                        <button className="btn btn-outline flex items-center gap-2" onClick={() => handleNextStep('AI_ONLY')} disabled={actionLoading}>
                          <Bot size={16} /> AI Guidance Only
                        </button>
                      </div>
                    </div>
                  )}

                  {session?.suggestedLawyers?.length > 0 && !session?.matchedLawyer && (
                      <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #bfdbfe' }}>
                        <h4 style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem', fontSize: '1rem' }}>🏛️ Advocates Matching Your Case</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {session.suggestedLawyers.map(lawyer => {
                            const practiceStr = Array.isArray(lawyer.practiceAreas)
                              ? lawyer.practiceAreas.map(p => typeof p === 'string' ? p.replace(/_/g, ' ') : p).join(', ')
                              : 'General Practice';
                            const langStr = Array.isArray(lawyer.languages)
                              ? lawyer.languages.join(', ')
                              : 'English, Hindi';
                            return (
                              <div key={lawyer.lawyerId} style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #dbeafe', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                {/* Top row: avatar + name + badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}>
                                    {lawyer.fullName ? lawyer.fullName.charAt(0).toUpperCase() : 'A'}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1rem' }}>{lawyer.fullName}</span>
                                      <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>✓ Verified</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.8rem', color: '#6b7280' }}>
                                      <span>⭐ {lawyer.rating ? lawyer.rating.toFixed(1) : '4.8'}</span>
                                      <span>•</span>
                                      <span>{lawyer.yearsOfExperience || 5}+ yrs exp</span>
                                      <span>•</span>
                                      <span>{lawyer.totalConsultations || 0} consultations</span>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontWeight: 700, color: '#059669', fontSize: '1.1rem' }}>₹{lawyer.consultationFee || 99}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>per consultation</div>
                                  </div>
                                </div>

                                {/* Details chips */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                  <span style={{ background: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: '1rem', fontSize: '0.75rem', color: '#334155' }}>📍 {lawyer.location || 'India'}</span>
                                  <span style={{ background: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: '1rem', fontSize: '0.75rem', color: '#334155' }}>🗣️ {langStr}</span>
                                  {lawyer.education && <span style={{ background: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: '1rem', fontSize: '0.75rem', color: '#334155' }}>🎓 {lawyer.education}</span>}
                                  {lawyer.barEnrollmentNumber && <span style={{ background: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: '1rem', fontSize: '0.75rem', color: '#334155' }}>Bar: {lawyer.barEnrollmentNumber}</span>}
                                </div>

                                {/* Practice areas */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Practice Areas: </span>
                                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{practiceStr}</span>
                                </div>

                                {/* Bio */}
                                {lawyer.bio && (
                                  <p style={{ fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                                    {lawyer.bio.length > 150 ? lawyer.bio.substring(0, 150) + '...' : lawyer.bio}
                                  </p>
                                )}

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                  <button
                                    onClick={() => setSelectedLawyer(lawyer)}
                                    style={{ flex: 1, padding: '0.6rem', background: 'white', color: '#4f46e5', border: '1.5px solid #4f46e5', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
                                  >
                                    View Profile
                                  </button>
                                  <button
                                    onClick={() => handleConsultLawyer(lawyer)}
                                    style={{ flex: 1, padding: '0.6rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
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

          {/* BOTTOM INPUT BAR */}
          <div style={{ padding: '1rem 2rem 1.5rem', background: 'white', display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginBottom: '0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '2rem', padding: '0.5rem', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isEditing ? "Tell me what you'd like to change or add..." : (isReadOnly ? "This consultation is completed." : "Type your legal question here...")}
                  disabled={isTyping || actionLoading || isReadOnly}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '0.5rem 1rem', background: 'transparent', color: '#111827', fontSize: '1rem' }}
                />
                
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping || actionLoading || isReadOnly}
                  style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: (!inputValue.trim() || isTyping || actionLoading || isReadOnly) ? 'not-allowed' : 'pointer', opacity: (!inputValue.trim() || isTyping || actionLoading || isReadOnly) ? 0.5 : 1, transition: 'all 0.2s' }}
                  className={(!inputValue.trim() || isTyping || actionLoading || isReadOnly) ? "" : "hover:bg-indigo-700"}
                >
                  {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} style={{ marginLeft: '2px' }} />}
                </button>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
                Adalat Legal Assistant can make mistakes. Consider verifying important legal information.
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* LAWYER PROFILE MODAL */}
      {selectedLawyer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedLawyer(null)}>
          <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button onClick={() => setSelectedLawyer(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✕</button>

            {/* Avatar + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
                {selectedLawyer.fullName ? selectedLawyer.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>{selectedLawyer.fullName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>✓ Verified</span>
                  {selectedLawyer.available && <span style={{ background: '#dbeafe', color: '#2563eb', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>🟢 Available</span>}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>⭐ {selectedLawyer.rating ? selectedLawyer.rating.toFixed(1) : '4.8'}</div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Rating</div>
              </div>
              <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>{selectedLawyer.yearsOfExperience || 5}+</div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Years Exp</div>
              </div>
              <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>{selectedLawyer.totalConsultations || 0}</div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Consultations</div>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#374151', minWidth: '120px', fontSize: '0.875rem' }}>📍 Location:</span>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{selectedLawyer.location || 'India'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#374151', minWidth: '120px', fontSize: '0.875rem' }}>🎓 Education:</span>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{selectedLawyer.education || 'LLB'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#374151', minWidth: '120px', fontSize: '0.875rem' }}>🗣️ Languages:</span>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{Array.isArray(selectedLawyer.languages) ? selectedLawyer.languages.join(', ') : 'English, Hindi'}</span>
              </div>
              {selectedLawyer.barEnrollmentNumber && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#374151', minWidth: '120px', fontSize: '0.875rem' }}>📋 Bar Number:</span>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{selectedLawyer.barEnrollmentNumber}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#374151', minWidth: '120px', fontSize: '0.875rem' }}>💼 Practice:</span>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{Array.isArray(selectedLawyer.practiceAreas) ? selectedLawyer.practiceAreas.map(p => typeof p === 'string' ? p.replace(/_/g, ' ') : p).join(', ') : 'General'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#374151', minWidth: '120px', fontSize: '0.875rem' }}>💰 Fee:</span>
                <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.875rem' }}>₹{selectedLawyer.consultationFee || 99} per consultation</span>
              </div>
            </div>

            {/* Bio */}
            {selectedLawyer.bio && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem', fontSize: '0.875rem' }}>About</h4>
                <p style={{ color: '#4b5563', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{selectedLawyer.bio}</p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => { const l = selectedLawyer; setSelectedLawyer(null); handleConsultLawyer(l); }}
              style={{ width: '100%', padding: '0.85rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
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
