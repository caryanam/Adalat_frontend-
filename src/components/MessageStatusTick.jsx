import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

/**
 * MessageStatusTick Component
 * Displays real-time message status ticks for both Customer and Lawyer:
 * - 1 tick (✓)       -> SENT: Message saved on server
 * - 2 grey ticks (✓✓) -> DELIVERED: Message delivered to recipient
 * - 2 blue ticks (✓✓) -> SEEN: Recipient has opened chat and seen/read message
 */
const MessageStatusTick = ({ status = 'SENT', isLawyer = false, className = '' }) => {
  const normalizedStatus = String(status || 'SENT').toUpperCase();

  // 2 blue ticks (✓✓) -> SEEN
  if (normalizedStatus === 'SEEN') {
    return (
      <span 
        title="Seen / Read (2 blue ticks)" 
        className={`inline-flex items-center text-[#38bdf8] ${className}`}
      >
        <CheckCheck size={14} className="stroke-[2.5]" />
      </span>
    );
  }

  // 2 grey ticks (✓✓) -> DELIVERED
  if (normalizedStatus === 'DELIVERED') {
    return (
      <span 
        title="Delivered (2 grey ticks)" 
        className={`inline-flex items-center ${isLawyer ? 'text-slate-400' : 'text-slate-300'} ${className}`}
      >
        <CheckCheck size={14} className="stroke-[2]" />
      </span>
    );
  }

  // 1 tick (✓) -> SENT (Default)
  return (
    <span 
      title="Sent (1 tick)" 
      className={`inline-flex items-center ${isLawyer ? 'text-slate-400' : 'text-indigo-200/80'} ${className}`}
    >
      <Check size={13} className="stroke-[2]" />
    </span>
  );
};

export default MessageStatusTick;
