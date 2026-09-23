import React, { useState, useEffect } from 'react';
import { Clock, Lock, CheckCircle2 } from 'lucide-react';
import { getSharedTimerSeconds } from '../utils/chatStore';
import './ConsultationTimer.css';

const ConsultationTimer = ({ 
  consultationId, 
  initialSeconds = 120, 
  chatStartedAt = null,
  isFreeChatOver = false,
  onTimerExpired, 
  isPaid = false, 
  isLawyer = false 
}) => {
  const calculateRemaining = () => {
    if (isPaid) return 120;
    if (isFreeChatOver) return 0;
    if (chatStartedAt) {
      const startTime = new Date(chatStartedAt).getTime();
      if (!isNaN(startTime)) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        return Math.max(0, 120 - elapsed);
      }
    }
    return consultationId ? getSharedTimerSeconds(consultationId, initialSeconds) : initialSeconds;
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemaining);
  const [isExpired, setIsExpired] = useState(() => isFreeChatOver || calculateRemaining() <= 0);

  useEffect(() => {
    if (isPaid) return;

    if (isFreeChatOver) {
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
  }, [consultationId, initialSeconds, chatStartedAt, isFreeChatOver, isPaid]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isPaid) {
    return (
      <div className="timer-badge paid" title="Extended Consultation Unlocked">
        <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
        <span>Unlocked</span>
      </div>
    );
  }

  return (
    <div 
      className={`timer-badge ${timeLeft < 30 ? 'urgent' : 'normal'}`}
      title={
        isExpired 
          ? (isLawyer ? 'Free 2m Expired - Awaiting Customer Extension' : 'Free 2m Expired - Pay to Unlock') 
          : `2m Free Consultation - ${formatTime(timeLeft)} remaining`
      }
    >
      {isExpired ? (
        <>
          <Lock size={13} className="shrink-0" />
          <span>{isLawyer ? 'Expired' : 'Free Expired'}</span>
        </>
      ) : (
        <>
          <Clock size={13} className="shrink-0" />
          <span>Free: <strong className="font-mono tracking-tight font-bold">{formatTime(timeLeft)}</strong></span>
        </>
      )}
    </div>
  );
};

export default ConsultationTimer;
