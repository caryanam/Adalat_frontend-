import React, { useState, useEffect, useRef } from 'react';
import { Bot, RefreshCcw, Send, Loader2, UserCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './LegalAssistantPage.css';

const LegalAssistantPage = () => {
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
    loadSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSession = async (forceNew = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = forceNew ? '/api/customer/legal-assistance/sessions?forceNew=true' : '/api/customer/legal-assistance/sessions';
      const res = await apiClient.post(url);
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
        setError('Failed to connect to the legal assistant server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = async () => {
    setMessages([]);
    setSession(null);
    setIsEditing(false);
    await loadSession(true);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
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

  const renderMessages = () => {
    return messages.map((msg, index) => {
      const isAI = msg.senderType === 'AI';
      // Double summary fix: if summary card is shown below, avoid duplicate full summary bubble
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

      <div className="legal-assistant-actions">
        <button className="btn btn-outline btn-compact" onClick={handleStartNew}>
          <RefreshCcw size={16} />
          Start New Consultation
        </button>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

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
                <p>Describe your legal problem in your own words and I’ll help organize the important details for an advocate.</p>
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

                {/* NEXT ACTION CHOICE BUTTONS (CONNECT_LAWYER / AI_ONLY) */}
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

            {(!isSummaryMode || isEditing) && (
              <div className="chat-input-area">
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LegalAssistantPage;
