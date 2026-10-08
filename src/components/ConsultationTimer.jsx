import React, { useState, useEffect } from 'react';
import { Clock, Lock, CheckCircle2 } from 'lucide-react';
import { getSharedTimerSeconds, getChatMessages } from '../utils/chatStore';
import './ConsultationTimer.css';

const ConsultationTimer = ({ 
  consultationId, 
  initialSeconds = 180, 
  chatStartedAt = null,
  paidChatStartedAt = null,
  paidDurationMinutes = null,
  isFreeChatOver = false,
  onTimerExpired, 
  isPaid = false, 
  isLawyer = false 
}) => {
  const parseBackendDate = (dateVal) => {
    if (!dateVal) return NaN;
    if (Array.isArray(dateVal)) {
      const [y, m, d, h=0, min=0, s=0] = dateVal;
      return new Date(y, m - 1, d, h, min, s).getTime();
    }
    return new Date(dateVal).getTime();
  };

  const calculateRemaining = () => {
    // If it's paid and we have backend timestamps, calculate based on that
    if (paidChatStartedAt && paidDurationMinutes) {
      const startTime = parseBackendDate(paidChatStartedAt);
      const paidDurationSec = paidDurationMinutes * 60;
      if (!isNaN(startTime)) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        return Math.max(0, paidDurationSec - elapsed);
      }
    }
    
    // Otherwise fallback to chat messages logic
    let paidMsg = null;
    let firstMsg = null;
    try {
      const msgs = getChatMessages(consultationId);
      paidMsg = msgs.slice().reverse().find(m => m.text && m.text.startsWith('[SYSTEM_PAYMENT_SUCCESS]'));
      firstMsg = msgs.length > 0 ? msgs[0] : null;
    } catch(e) {}

    if (paidMsg || isPaid) {
      const durationMatch = paidMsg ? paidMsg.text.match(/Duration: (\d+)/) : null;
      const paidDurationSec = durationMatch ? parseInt(durationMatch[1], 10) : (paidDurationMinutes ? paidDurationMinutes * 60 : 600);
      const startTime = paidMsg ? parseBackendDate(paidMsg.createdAt) : Date.now();
      if (!isNaN(startTime)) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        return Math.max(0, paidDurationSec - elapsed);
      }
    }

    if (isFreeChatOver && !isPaid) return 0;

    const freeDuration = 180; // 3 minutes
    if (firstMsg) {
      const startTime = parseBackendDate(firstMsg.createdAt);
      if (!isNaN(startTime)) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        return Math.max(0, freeDuration - elapsed);
      }
    }
    
    // Fallback if no messages yet
    if (chatStartedAt) {
      const startTime = parseBackendDate(chatStartedAt);
      if (!isNaN(startTime)) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        return Math.max(0, freeDuration - elapsed);
      }
    }
    return consultationId ? getSharedTimerSeconds(consultationId, freeDuration) : freeDuration;
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemaining);
  const [isExpired, setIsExpired] = useState(() => (!isPaid && isFreeChatOver) || calculateRemaining() <= 0);

  useEffect(() => {
    // If not paid and free chat is marked over by backend
    if (!isPaid && isFreeChatOver) {
      setIsExpired(true);
      setTimeLeft(0);
      if (onTimerExpired) onTimerExpired();
      return;
    }

    let hasFiredExpired = false;

    const updateTimer = () => {
      const remaining = calculateRemaining();
      if (remaining <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        if (onTimerExpired && !hasFiredExpired) {
          hasFiredExpired = true;
          onTimerExpired();
        }
      } else {
        setIsExpired(false);
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [consultationId, initialSeconds, chatStartedAt, paidChatStartedAt, paidDurationMinutes, isFreeChatOver, isPaid]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isActuallyPaid = isPaid || (paidChatStartedAt != null);

  return (
    <div 
      className={`timer-badge ${timeLeft < 30 ? 'urgent' : (isActuallyPaid ? 'paid' : 'normal')}`}
      title={
        isExpired 
          ? (isActuallyPaid ? 'Paid Consultation Expired' : (isLawyer ? 'Free 3m Expired - Awaiting Customer Extension' : 'Free 3m Expired - Pay to Unlock')) 
          : `${isActuallyPaid ? 'Paid' : '3m Free'} Consultation - ${formatTime(timeLeft)} remaining`
      }
    >
      {isExpired ? (
        <>
          <Lock size={13} className="shrink-0" />
          <span>{isActuallyPaid ? 'Time Up' : (isLawyer ? 'Expired' : 'Free Expired')}</span>
        </>
      ) : (
        <>
          {isActuallyPaid ? <CheckCircle2 size={13} className="shrink-0 text-emerald-600" /> : <Clock size={13} className="shrink-0" />}
          <span>{isActuallyPaid ? 'Paid' : 'Free'}: <strong className="font-mono tracking-tight font-bold">{formatTime(timeLeft)}</strong></span>
        </>
      )}
    </div>
  );
};

export default ConsultationTimer;

