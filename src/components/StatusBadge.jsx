import React from 'react';

const StatusBadge = ({ status = 'PENDING' }) => {
  const getBadgeConfig = (st) => {
    switch (st?.toUpperCase()) {
      case 'APPROVED':
      case 'ACTIVE':
      case 'SUCCESS':
      case 'PAID':
      case 'ACCEPTED':
        return {
          tailwind: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 ring-1 ring-emerald-500/20',
          dot: 'bg-emerald-500',
          label: st,
        };
      case 'PENDING':
      case 'DRAFT':
      case 'SUBMITTED':
      case 'REQUESTED':
      case 'ACTIVE_FREE':
        return {
          tailwind: 'bg-amber-50 text-amber-800 border-amber-200/90 ring-1 ring-amber-500/20',
          dot: 'bg-amber-500 animate-pulse',
          label: st,
        };
      case 'REJECTED':
      case 'FAILED':
      case 'CANCELLED':
        return {
          tailwind: 'bg-rose-50 text-rose-700 border-rose-200/90 ring-1 ring-rose-500/20',
          dot: 'bg-rose-500',
          label: st,
        };
      default:
        return {
          tailwind: 'bg-slate-100 text-slate-700 border-slate-200/90 ring-1 ring-slate-400/20',
          dot: 'bg-slate-400',
          label: st || 'UNKNOWN',
        };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border shadow-2xs transition-all ${config.tailwind}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label.replace('_', ' ')}</span>
    </span>
  );
};

export default StatusBadge;
