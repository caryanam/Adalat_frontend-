import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import useBotpressUser from '../../hooks/useBotpressUser';
import { Bot, RefreshCcw } from 'lucide-react';
import './LegalAssistantPage.css';

const LegalAssistantPage = () => {
  const { role } = useAuth();
  useBotpressUser(); // Ensure user data is synced

  useEffect(() => {
    // 1. Initialize Botpress natively if not already initialized
    if (window.botpress && !window.botpress.isInitialized) {
      window.botpress.init({
        "botId": "6151cd49-5d4d-489d-ad35-f797fc866cfd",
        "configuration": {
          "version": "v2",
          "botName": "Adalat Legal Assistant",
          "feedbackEnabled": true,
          "allowFileUpload": true,
          "soundEnabled": true,
          "conversationHistory": true,
          "homePageEnabled": false,
          "citationsEnabled": true,
          "agentPresenceEnabled": true
        },
        "clientId": "71c7dd7f-3e8d-4c58-8576-3da6e452e979",
        "hideWidget": true,
        "disableAnimations": true,
        "theme": "prism",
        "themeColor": "#2563eb",
        "containerWidth": "100%",
        "layoutWidth": "100%"
      });
      window.botpress.isInitialized = true;
    }

    // 2. Move the Botpress DOM element inside our container so it's not an overlay
    const moveBotpressToContainer = () => {
      const bpRoot = document.getElementById('bp-webchat');
      const embedContainer = document.getElementById('botpress-embedded-container');
      if (bpRoot && embedContainer && bpRoot.parentElement !== embedContainer) {
        embedContainer.appendChild(bpRoot);
      }
    };

    // 3. Open the chat
    const openChat = () => {
      if (window.botpress) {
        if (typeof window.botpress.open === 'function') {
          window.botpress.open();
        } else if (typeof window.botpress.sendEvent === 'function') {
          window.botpress.sendEvent({ type: 'show' });
        }
      }
    };

    // Wait slightly for Botpress to create its DOM nodes
    setTimeout(() => {
      moveBotpressToContainer();
      openChat();
    }, 500);

    // Try again just in case network is slow
    const intervalId = setInterval(moveBotpressToContainer, 1000);

    // Hide it when navigating away
    return () => {
      clearInterval(intervalId);
      const bpRoot = document.getElementById('bp-webchat');
      if (bpRoot) {
        document.body.appendChild(bpRoot); // Move it back to body to save it from React unmount
      }
      
      if (window.botpress) {
        if (typeof window.botpress.close === 'function') {
          window.botpress.close();
        } else if (typeof window.botpress.sendEvent === 'function') {
          window.botpress.sendEvent({ type: 'hide' });
        }
      }
    };
  }, []);

  const handleStartNewConsultation = () => {
    if (window.botpress && typeof window.botpress.restartConversation === 'function') {
      window.botpress.restartConversation();
      if (typeof window.botpress.open === 'function') {
        window.botpress.open();
      }
    } else {
      console.warn("Botpress Webchat is not fully initialized or restartConversation API is unavailable.");
    }
  };

  if (role !== 'CUSTOMER') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="legal-assistant-wrapper">
      <div className="legal-assistant-header">
        <div className="header-title">
          <Bot size={28} className="assistant-icon-small" />
          <h1>Legal AI Assistant</h1>
        </div>
        <button onClick={handleStartNewConsultation} className="reset-conversation-btn-small">
          <RefreshCcw size={16} />
          Start New Consultation
        </button>
      </div>
      
      {/* This is the div where Botpress will be embedded */}
      <div id="botpress-embedded-container" className="botpress-embedded-container">
        {/* The chat UI will be mounted here */}
      </div>
    </div>
  );
};

export default LegalAssistantPage;

