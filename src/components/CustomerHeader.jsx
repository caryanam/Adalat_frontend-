import React from 'react';
import { Bell, ShieldCheck, Sparkles, AlertCircle, Info, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CustomerHeader = ({ 
  title = 'Customer Portal', 
  subtitle = '', 
  badge = null, 
  actions = null 
}) => {
  const { user } = useAuth();
  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'C';

  const renderBadge = () => {
    if (!badge) return null;

    let text = '';
    let variant = 'indigo';
    let IconComponent = null;

    if (typeof badge === 'string') {
      text = badge;
    } else if (typeof badge === 'object') {
      text = badge.text || '';
      variant = badge.variant || 'indigo';
      IconComponent = badge.icon || null;
    }

    const badgeConfig = {
      success: {
        wrapper: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
        dot: 'bg-emerald-500',
        defaultIcon: ShieldCheck
      },
      indigo: {
        wrapper: 'bg-indigo-50 text-indigo-700 border-indigo-200/90',
        dot: 'bg-indigo-600',
        defaultIcon: Sparkles
      },
      amber: {
        wrapper: 'bg-amber-50 text-amber-800 border-amber-200/90',
        dot: 'bg-amber-500',
        defaultIcon: AlertCircle
      },
      slate: {
        wrapper: 'bg-slate-100 text-slate-700 border-slate-200/90',
        dot: 'bg-slate-500',
        defaultIcon: Info
      }
    };

    const config = badgeConfig[variant] || badgeConfig.indigo;
    const Icon = IconComponent || config.defaultIcon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border shadow-2xs transition-colors shrink-0 ${config.wrapper}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse shrink-0`} />
        {Icon && <Icon size={11} className="shrink-0" />}
        <span className="truncate leading-none">{text}</span>
      </span>
    );
  };

  return (
    <header className="w-full min-h-[4.25rem] bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4 sticky top-0 z-30 shadow-xs shrink-0 font-['Outfit',sans-serif] select-none">
      {/* Mobile Hamburger Drawer Trigger */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('toggle-portal-sidebar'))}
        className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
        title="Open Navigation Menu"
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Left: Clean Title, Subtitle, and Badge */}
      <div className="min-w-0 flex-1 flex flex-col justify-center py-1">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <h1 
            style={{ 
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.125rem',
              margin: 0,
              padding: 0,
              lineHeight: 1.25,
              textTransform: 'none'
            }}
            className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight truncate m-0 p-0 text-slate-900"
          >
            {title}
          </h1>
          {renderBadge()}
        </div>
        {subtitle && (
          <p 
            style={{ margin: 0, padding: 0 }}
            className="hidden sm:block text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 leading-tight truncate max-w-2xl m-0 p-0"
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}

        <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block shrink-0" />

        {/* Notifications Button */}
        <Link 
          to="/customer/consultations" 
          title="Notifications & Activity"
          className="relative w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:border-indigo-200 active:scale-95 shrink-0"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </Link>

        {/* Customer Profile Pill */}
        <Link 
          to="/customer/profile" 
          title="View Customer Profile"
          className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 py-1.5 pl-1.5 pr-3 rounded-xl cursor-pointer transition-all shadow-xs hover:border-indigo-200 group shrink-0 active:scale-95"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-transform shrink-0">
            {initial}
          </div>
          <div className="hidden md:flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[120px]">
              {user?.fullName || 'Customer'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px] mt-1">
              {user?.email || 'Verified Account'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default CustomerHeader;
