import React from 'react';
import { ShieldCheck, Award, Sparkles, UserCheck, Menu, CreditCard, Shield, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const AdminHeader = ({ 
  title = 'Admin Command Center', 
  subtitle = '', 
  badge = null, 
  actions = null 
}) => {
  const { user } = useAuth();
  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A';
  const displayName = user?.fullName || 'Super Admin';

  const renderBadge = () => {
    if (!badge) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/90 shadow-2xs transition-colors shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
          <Shield size={11} className="shrink-0" />
          <span className="truncate leading-none">Super Administrator</span>
        </span>
      );
    }

    let text = '';
    let variant = 'purple';
    let IconComponent = null;

    if (typeof badge === 'string') {
      text = badge;
    } else if (typeof badge === 'object') {
      text = badge.text || '';
      variant = badge.variant || 'purple';
      IconComponent = badge.icon || null;
    }

    const badgeConfig = {
      purple: {
        wrapper: 'bg-purple-50 text-purple-700 border-purple-200/90',
        dot: 'bg-purple-600',
        defaultIcon: Shield
      },
      amber: {
        wrapper: 'bg-amber-50 text-amber-800 border-amber-200/90',
        dot: 'bg-amber-500',
        defaultIcon: Award
      },
      emerald: {
        wrapper: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
        dot: 'bg-emerald-500',
        defaultIcon: ShieldCheck
      },
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
      slate: {
        wrapper: 'bg-slate-100 text-slate-700 border-slate-200/90',
        dot: 'bg-slate-500',
        defaultIcon: Info
      }
    };

    const config = badgeConfig[variant] || badgeConfig.purple;
    const Icon = IconComponent || config.defaultIcon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border shadow-2xs transition-colors shrink-0 ${config.wrapper}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse shrink-0`} />
        {Icon && <Icon size={11} className="shrink-0" />}
        <span className="truncate leading-none">{text}</span>
      </span>
    );
  };

  return (
    <header className="w-full min-h-[4.25rem] bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4 sticky top-0 z-30 shadow-xs shrink-0 font-['Outfit',sans-serif] select-none">
      {/* Mobile Drawer Navigation Hamburger */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('toggle-portal-sidebar'))}
        className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
        title="Open Navigation Menu"
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Left: Title, Subtitle, and Dynamic Status Badge */}
      <div className="min-w-0 flex-1 flex flex-col justify-center py-1">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-wrap">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight truncate m-0 p-0 font-['Outfit',sans-serif]">
            {title}
          </h1>
          {renderBadge()}
        </div>
        {subtitle && (
          <p className="hidden sm:block text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 leading-tight truncate max-w-2xl m-0 p-0">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Actions, Quick Links, and Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}

        <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block shrink-0" />

        {/* Notifications Dropdown */}
        <NotificationDropdown role="ADMIN" defaultLink="/admin/verifications" />

        {/* Quick Link: Lawyer Verification Queue */}
        <Link 
          to="/admin/verifications" 
          title="Review Pending Lawyer Verifications"
          className="relative w-9 h-9 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:border-purple-300 active:scale-95 shrink-0"
        >
          <UserCheck size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </Link>

        {/* Quick Link: Payment Transactions Audit */}
        <Link 
          to="/admin/payments" 
          title="Payment Audit Log"
          className="relative w-9 h-9 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:border-purple-300 active:scale-95 shrink-0"
        >
          <CreditCard size={16} />
        </Link>

        {/* Admin Profile Pill */}
        <div 
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs shrink-0 select-none"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
            {initial}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
              {displayName}
            </span>
            <span className="text-[10px] text-purple-600 font-semibold leading-none mt-0.5">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
