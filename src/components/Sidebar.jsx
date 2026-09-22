import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, UserCheck, Calendar, MessageSquare, 
  CreditCard, User, LogOut, ShieldCheck,
  TrendingUp, Scale, Bot, FileText, ChevronRight, Sparkles, X
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const Sidebar = ({ portalType = 'customer' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileDrawerOpen(prev => !prev);
    const handleOpen = () => setIsMobileDrawerOpen(true);
    const handleClose = () => setIsMobileDrawerOpen(false);

    window.addEventListener('toggle-portal-sidebar', handleToggle);
    window.addEventListener('open-portal-sidebar', handleOpen);
    window.addEventListener('close-portal-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-portal-sidebar', handleToggle);
      window.removeEventListener('open-portal-sidebar', handleOpen);
      window.removeEventListener('close-portal-sidebar', handleClose);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileDrawerOpen(false);
    navigate('/');
  };

  const customerLinks = [
    { to: '/customer/legal-assistant', label: 'Legal Assistant', icon: Bot, badge: 'AI', shortLabel: 'AI Guide' },
    { to: '/customer/find-lawyers', label: 'Find Advocates', icon: Scale, shortLabel: 'Advocates' },
    { to: '/customer/appointments', label: 'Appointments', icon: Calendar, shortLabel: 'Bookings' },
    { to: '/customer/consultations', label: 'Consultations', icon: MessageSquare, shortLabel: 'Consult' },
    { to: '/customer/profile', label: 'My Profile', icon: User, shortLabel: 'Profile' },
  ];

  const lawyerLinks = [
    { to: '/lawyer/dashboard', label: 'Dashboard', icon: LayoutDashboard, shortLabel: 'Dashboard' },
    { to: '/lawyer/requests', label: 'Consultation Requests', icon: MessageSquare, shortLabel: 'Requests' },
    { to: '/lawyer/appointments', label: 'Appointments', icon: Calendar, shortLabel: 'Bookings' },
    { to: '/lawyer/consultations', label: 'Active Consultations', icon: MessageSquare, shortLabel: 'Chat' },
    { to: '/lawyer/earnings', label: 'Earnings & Payments', icon: CreditCard, shortLabel: 'Earnings' },
    { to: '/lawyer/documents', label: 'Verification Docs', icon: FileText, shortLabel: 'Docs' },
    { to: '/lawyer/profile', label: 'Lawyer Profile', icon: User, shortLabel: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/verifications', label: 'Lawyer Approvals', icon: UserCheck },
    { to: '/admin/lawyers', label: 'Lawyer Management', icon: ShieldCheck },
    { to: '/admin/customers', label: 'Customer Management', icon: Users },
    { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { to: '/admin/consultations', label: 'Consultation History', icon: MessageSquare },
    { to: '/admin/payments', label: 'Payment Audit', icon: CreditCard },
    { to: '/admin/reports', label: 'Analytics & Reports', icon: TrendingUp },
  ];

  const getLinks = () => {
    if (portalType === 'lawyer') return lawyerLinks;
    if (portalType === 'admin') return adminLinks;
    return customerLinks;
  };

  const getPortalInfo = () => {
    if (portalType === 'lawyer') {
      return {
        title: 'Advocate Workspace',
        badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
      };
    }
    if (portalType === 'admin') {
      return {
        title: 'Admin Console',
        badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
      };
    }
    return {
      title: 'Customer Portal',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
    };
  };

  const portalInfo = getPortalInfo();

  // Content for both Desktop and Mobile Drawer Navigation
  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Top Section: Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-[#0d1322]/50 flex items-center justify-between">
        <Link 
          to="/" 
          onClick={() => isMobile && setIsMobileDrawerOpen(false)}
          className="flex items-center gap-3 group min-w-0"
        >
          {/* Adalat Official Brand Logo */}
          <div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#172033] to-[#0f172a] border border-slate-700/80 p-1.5 flex items-center justify-center shadow-lg shadow-black/40 group-hover:border-indigo-500/60 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all shrink-0"
            style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', overflow: 'hidden' }}
          >
            {logoError ? (
              <Scale size={22} className="text-amber-400 group-hover:text-amber-300 transition-colors" />
            ) : (
              <img 
                src={logoImg} 
                alt="Adalat" 
                onError={() => setLogoError(true)}
                className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105" 
                style={{ 
                  width: '100%',
                  height: '100%',
                  maxWidth: '28px',
                  maxHeight: '28px',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1) drop-shadow(0 0 4px rgba(165, 180, 252, 0.45))' 
                }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-['Cinzel'] tracking-widest text-lg font-bold text-white block leading-tight truncate group-hover:text-indigo-300 transition-colors">
              ADALAT
            </span>
            <span className="text-[10px] tracking-wider uppercase text-indigo-400 font-semibold block mt-0.5">
              Legal Platform
            </span>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0 cursor-pointer"
            title="Close navigation drawer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Middle Section: Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation Menu
        </div>
        {getLinks().map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => isMobile && setIsMobileDrawerOpen(false)}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 border ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30 border-indigo-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors duration-150 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-indigo-400'
                      }`}
                    />
                    <span className="truncate">{link.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {link.badge && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-amber-950 shadow-md shadow-amber-500/30 border border-yellow-200">
                        <Sparkles size={11} className="text-amber-950 fill-amber-950/25 shrink-0" />
                        <span>{link.badge}</span>
                      </span>
                    )}
                    {isActive ? (
                      <ChevronRight size={14} className="text-indigo-200" />
                    ) : null}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section: Unified Account Card & Actions */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md">
        <div className="p-3 rounded-2xl bg-[#111726] border border-slate-800/90 shadow-xl">
          
          {/* Top Bar: Portal Name & Live Status */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              {portalInfo.title}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span>Live</span>
            </span>
          </div>

          {/* User Details */}
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-md border border-indigo-400/20">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#111726] shadow-[0_0_4px_#34d399]" />
            </div>

            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight capitalize">
                {user?.fullName || 'User Name'}
              </p>
              <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5 font-normal">
                {user?.email || 'user@adalat.legal'}
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
          >
            <LogOut size={14} className="text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT SIDEBAR: Hidden on mobile (<1024px) */}
      <aside className="hidden lg:flex flex-col justify-between w-64 min-w-[16rem] max-w-[16rem] h-screen sticky top-0 bg-[#0b0f19] text-slate-200 border-r border-slate-800/80 shadow-2xl z-30 select-none shrink-0 font-['Outfit',sans-serif]">
        {renderSidebarContent(false)}
      </aside>

      {/* 2. MOBILE SLIDE-OVER DRAWER (<1024px) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#0b0f19] text-slate-200 z-50 flex flex-col justify-between shadow-2xl border-r border-slate-800/90 font-['Outfit',sans-serif] animate-in slide-in-from-left duration-250">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}

      {/* 3. MOBILE APP BOTTOM NAVIGATION BAR (App view for Customer Portal) */}
      {portalType === 'customer' && (
        <nav 
          aria-label="Mobile App Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around font-['Outfit',sans-serif] safe-area-pb"
        >
          {customerLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[58px] ${
                    isActive 
                      ? 'text-indigo-600 font-bold' 
                      : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`relative p-1 rounded-xl transition-all ${
                      isActive ? 'bg-indigo-50 text-indigo-600 shadow-2xs' : 'text-slate-500'
                    }`}>
                      <Icon size={19} className={isActive ? 'text-indigo-600' : 'text-slate-500'} />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
                      )}
                    </div>
                    <span className="text-[10px] leading-tight mt-0.5 tracking-tight truncate max-w-[62px]">
                      {item.shortLabel || item.label}
                    </span>
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      )}
    </>
  );
};

export default Sidebar;
