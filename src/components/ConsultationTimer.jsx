import React, { useState, useEffect } from 'react';
import { Clock, Lock, CheckCircle2 } from 'lucide-react';
import { getSharedTimerSeconds } from '../utils/chatStore';
import './ConsultationTimer.css';

const ConsultationTimer = ({ consultationId, initialSeconds = 120, onTimerExpired, isPaid = false, isLawyer = false }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    return consultationId ? getSharedTimerSeconds(consultationId, initialSeconds) : initialSeconds;
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isPaid) return;

    let hasFiredExpired = false;

    const updateTimer = () => {
      const remaining = consultationId ? getSharedTimerSeconds(consultationId, initialSeconds) : (timeLeft > 0 ? timeLeft - 1 : 0);
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
  }, [consultationId, initialSeconds, isPaid]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isPaid) {
    return (
      <div className="timer-badge paid">
        <CheckCircle2 size={16} /> <span>Extended Consultation Unlocked</span>
      </div>
    );
  }

  return (
    <div className={`timer-badge ${timeLeft < 30 ? 'urgent' : 'normal'}`}>
      {isExpired ? (
        <>
          <Lock size={16} /> <span>{isLawyer ? 'Free 2m Expired - Awaiting Customer Extension' : 'Free 2m Expired - Pay to Unlock'}</span>
        </>
      ) : (
        <>
          <Clock size={16} /> <span>2m Free Chat: <strong>{formatTime(timeLeft)}</strong></span>
        </>
      )}
    </div>
  );
};

export default ConsultationTimer;
