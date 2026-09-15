import React, { useState, useEffect, useRef } from 'react';
import { Bot, RefreshCcw, Send, Loader2, UserCheck, ArrowRight, MessageSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './LegalAssistantPage.css';

const LegalAssistantPage = () => {
  const [sessionsList, setSessionsList] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessionsList();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessionsList = async (autoLoadId = null) => {
    try {
      setSidebarLoading(true);
      const res = await apiClient.get('/api/customer/legal-assistance/sessions');
      const list = res.data;
      setSessionsList(list);
      
      if (list && list.length > 0) {
        if (autoLoadId) {
          loadSpecificSession(autoLoadId);
        } else if (!session) {
          // If no session is currently active, load the first active or newest one
          const activeOrLatest = list.find(s => ['ACTIVE', 'SUMMARY_READY', 'AWAITING_NEXT_STEP'].includes(s.status)) || list[0];
          loadSpecificSession(activeOrLatest.sessionId);
        }
      } else {
        // No sessions at all, stay on welcome state
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load session history.');
      setLoading(false);
    } finally {
      setSidebarLoading(false);
    }
  };

  const loadSpecificSession = async (sessionId) => {
    if (session?.sessionId === sessionId) return;
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
      setMessages([]);
      setSession(null);
      setIsEditing(false);
      
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
      
      // Refresh the sidebar to show the new session
      fetchSessionsList();
    } catch (err) {
      setError('Failed to start a new consultation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    // If we're on the welcome state and haven't created a session yet
    if (!session) {
      try {
        setLoading(true);
        const res = await apiClient.post('/api/customer/legal-assistance/sessions?forceNew=true');
        setSession(res.data);
        await fetchSessionsList(); // update sidebar
        setLoading(false);
        // Then proceed to send message below
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
      const res = await apiClient.post(`/api/customer/legal-assistance/sessions/${session.sessionId}/messages`, {
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
    switch(status) {
      case 'ACTIVE': return <span className="status-badge status-active">Active</span>;
      case 'SUMMARY_READY': return <span className="status-badge status-warning">Action Needed</span>;
      case 'AWAITING_NEXT_STEP': return <span className="status-badge status-warning">Select Next</span>;
      case 'ASSIGNED': return <span className="status-badge status-success">Assigned</span>;
      case 'AI_ONLY_COMPLETED': return <span className="status-badge status-success">Completed</span>;
      case 'CLOSED': return <span className="status-badge status-closed">Closed</span>;
      default: return <span className="status-badge status-default">{status}</span>;
    }
  };

  const renderMessages = () => {
    return messages.map((msg, index) => {
      const isAI = msg.senderType === 'AI';
      if (isSummaryMode && !isEditing && isAI && msg.message && (msg.message.startsWith('Case Category:') || msg.message.includes('Based on your description, here are the key facts'))) {
        return null;
      }
      return (
        <div key={msg.id || index} className={`chat-message ${isAI ? 'message-ai' : 'message-customer'}`}>
          <div className="message-bubble">
            <pre className="message-content">{msg.message}</pre>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="legal-assistant-page">
      <div className="legal-assistant-header">
        <div className="header-title">
          <Bot size={28} className="text-primary" />
          <h1>Adalat AI Legal Assistant</h1>
        </div>
        <p className="header-subtitle">
          Describe your legal issue. I'll ask only the important questions needed to prepare your case for an advocate.
        </p>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="legal-assistant-layout">
        {/* LEFT PANEL: SESSIONS SIDEBAR */}
        <div className="sessions-sidebar">
          <button className="btn btn-primary w-full flex items-center justify-center gap-2 mb-4 btn-start-new" onClick={handleStartNew}>
            <RefreshCcw size={16} /> Start New Consultation
          </button>
          
          <div className="sessions-list">
            <h3 className="sessions-list-title">Past Conversations</h3>
            {sidebarLoading ? (
              <div className="p-4 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" size={16}/>Loading...</div>
            ) : sessionsList.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No past conversations found.</div>
            ) : (
              sessionsList.map(s => (
                <div 
                  key={s.sessionId} 
                  className={`session-card ${session?.sessionId === s.sessionId ? 'active' : ''}`}
                  onClick={() => loadSpecificSession(s.sessionId)}
                >
                  <div className="session-card-header">
                    <span className="session-category">
                      <MessageSquare size={14} className="inline mr-1 text-gray-400" />
                      {s.categoryDisplay || 'General Inquiry'}
                    </span>
                    {getStatusBadge(s.status)}
                  </div>
                  <div className="session-card-date">
                    <Clock size={12} className="inline mr-1" />
                    {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                  {s.customerSummarySnippet && (
                    <div className="session-card-snippet">
                      {s.customerSummarySnippet}...
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CHAT AREA */}
        <div className="chat-container">
          {loading ? (
            <div className="chat-loading p-10 flex-col items-center justify-center text-gray-500">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Loading your legal session...</p>
            </div>
          ) : (
            <>
              {!session && messages.length === 0 ? (
                <div className="welcome-state">
                  <h2>Hello! I am your Adalat AI Legal Assistant.</h2>
                  <p>Start a new consultation from the left menu or select a past conversation.</p>
                </div>
              ) : (
                <div className="chat-history">
                  {renderMessages()}
                  
                  {isTyping && (
                    <div className="chat-message message-ai">
                      <div className="message-bubble typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}
                  
                  {/* CASE SUMMARY CONFIRMATION CARD */}
                  {isSummaryMode && !isEditing && (
                    <div className="summary-card">
                      <h3 className="text-lg font-bold text-blue-900 mb-4 border-b pb-2">CASE SUMMARY</h3>
                      <div className="summary-content text-blue-800 whitespace-pre-wrap mb-4">
                        {session.customerSummary}
                      </div>
                      <p className="font-semibold text-blue-900 mb-4">Is this information correct?</p>
                      <div className="summary-actions flex gap-3">
                        <button 
                          className="btn btn-primary" 
                          onClick={handleConfirmSummary} 
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Confirm & Proceed'}
                        </button>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => setIsEditing(true)}
                          disabled={actionLoading}
                        >
                          Change / Add Information
                        </button>
                      </div>
                    </div>
                  )}

                  {/* NEXT ACTION CHOICE BUTTONS */}
                  {session?.nextActionRequired && session?.availableActions && session.availableActions.length > 0 && (
                    <div className="summary-card bg-indigo-50 border-indigo-200 mt-4">
                      <h4 className="font-bold text-indigo-900 mb-2">Next Step Choice</h4>
                      <p className="text-indigo-800 text-sm mb-4">
                        Would you like to connect with a verified advocate for your case, or use AI Legal Assistant guidance only?
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        <button 
                          className="btn btn-primary flex items-center gap-2"
                          onClick={() => handleNextStep('CONNECT_LAWYER')}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <UserCheck size={16} />}
                          Connect with Advocate (वकील जोडा)
                        </button>
                        <button 
                          className="btn btn-outline flex items-center gap-2"
                          onClick={() => handleNextStep('AI_ONLY')}
                          disabled={actionLoading}
                        >
                          <Bot size={16} />
                          AI Guidance Only (फक्त AI मार्गदर्शन)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUGGESTED LAWYERS PANEL */}
                  {session?.suggestedLawyers?.length > 0 && !session?.matchedLawyer && (
                    <div className="summary-card bg-blue-50 border-blue-200 mt-4 suggested-lawyers-panel">
                      <h4 className="font-bold text-blue-900 mb-2">⚖️ Advocates Matching Your Case</h4>
                      <p className="text-blue-800 text-sm mb-4">
                        Based on your case details, these verified advocates are available:
                      </p>
                      <div className="lawyer-cards-grid">
                        {session.suggestedLawyers.map(lawyer => (
                          <div key={lawyer.lawyerId} className="lawyer-suggestion-card">
                            <div className="lawyer-card-name font-bold text-gray-800">{lawyer.fullName}</div>
                            {lawyer.location && <div className="lawyer-card-location text-sm text-gray-600">📍 {lawyer.location}</div>}
                            {lawyer.rating > 0 && <div className="lawyer-card-rating text-sm text-yellow-600 font-semibold">⭐ {lawyer.rating} / 5</div>}
                            {lawyer.consultationFee && <div className="lawyer-card-fee text-sm text-green-700">₹{lawyer.consultationFee} / consultation</div>}
                            {lawyer.practiceAreas && (
                              <div className="lawyer-card-areas flex flex-wrap gap-1 mt-2">
                                {[...lawyer.practiceAreas].slice(0, 2).map(area => (
                                  <span key={area} className="badge badge-sm bg-blue-100 text-blue-800">{area.replace(/_/g, ' ')}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-blue-800 text-sm mt-3">
                        After confirming your summary, click <strong>"Connect with Advocate"</strong> to get matched.
                      </p>
                    </div>
                  )}

                  {/* MATCHED ADVOCATE CARD */}
                  {session?.matchedLawyer && (
                    <div className="summary-card bg-green-50 border-green-200 mt-4">
                      <div className="flex items-center gap-2 text-green-900 font-bold text-lg mb-2">
                        <UserCheck className="text-green-600" size={24} />
                        <h3>Matched Advocate Assigned</h3>
                      </div>
                      <div className="text-green-800 text-sm space-y-1 mb-4">
                        <p><strong>Name:</strong> Advocate {session.matchedLawyer.fullName}</p>
                        {session.matchedLawyer.location && <p><strong>Location:</strong> {session.matchedLawyer.location}</p>}
                        {session.matchedLawyer.rating > 0 && <p><strong>Rating:</strong> ⭐ {session.matchedLawyer.rating} / 5</p>}
                        {session.matchedLawyer.consultationFee && <p><strong>Consultation Fee:</strong> ₹{session.matchedLawyer.consultationFee}</p>}
                      </div>
                      <button 
                        className="btn btn-primary flex items-center gap-2"
                        onClick={() => navigate('/customer/consultations')}
                      >
                        View Consultations <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* INPUT AREA (HIDDEN IF READ ONLY) */}
              {(!isReadOnly && (!isSummaryMode || isEditing)) && (
                <div className="chat-input-area">
                  {session && (
                    <div className="input-wrapper">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isEditing ? "Tell me what you'd like to change or add..." : "Type your legal issue... (Shift+Enter for newline)"}
                        className="chat-textarea"
                        disabled={isTyping || actionLoading}
                        rows={1}
                      />
                      <button 
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping || actionLoading}
                        className="btn-send"
                      >
                        {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                      </button>
                    </div>
                  )}
                  {!session && (
                    <div className="input-wrapper">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Start typing your legal issue to begin a new consultation..."
                        className="chat-textarea"
                        disabled={isTyping || actionLoading}
                        rows={1}
                      />
                      <button 
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping || actionLoading}
                        className="btn-send"
                      >
                        {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalAssistantPage;



