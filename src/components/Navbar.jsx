import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  ArrowRight, 
  LayoutDashboard, 
  Bot, 
  Scale, 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  UserCheck, 
  Users 
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { user, token, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isUserLoggedIn = Boolean(token && user);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const activeRole = (role || user?.role || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('adalat_role')) || 'CUSTOMER').toUpperCase();
  const displayName = user?.fullName || user?.name || user?.lawyerName || (user?.email ? user.email.split('@')[0] : 'My Account');
  const displayEmail = user?.email || user?.mobileNumber || '';
  const userInitial = displayName.charAt(0).toUpperCase();

  const getRoleConfig = () => {
    if (activeRole === 'ADMIN') {
      return {
        roleLabel: 'Administrator',
        badgeText: '🛡️ Admin Console',
        badgeClasses: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
        avatarBg: 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white ring-2 ring-indigo-400/40',
        dashboardPath: '/admin/dashboard',
        dashboardLabel: 'Admin Dashboard',
        links: [
          { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { to: '/admin/verifications', label: 'Advocate Approvals', icon: UserCheck },
          { to: '/admin/lawyers', label: 'Lawyer Management', icon: ShieldCheck },
          { to: '/admin/customers', label: 'Customer Management', icon: Users },
          { to: '/admin/payments', label: 'Payment Audit', icon: CreditCard },
        ]
      };
    }
    if (activeRole === 'LAWYER') {
      return {
        roleLabel: 'Advocate',
        badgeText: '⚖️ Advocate Portal',
        badgeClasses: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        avatarBg: 'bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 ring-2 ring-amber-400/40 font-black',
        dashboardPath: '/lawyer/dashboard',
        dashboardLabel: 'Advocate Workspace',
        links: [
          { to: '/lawyer/dashboard', label: 'Advocate Dashboard', icon: LayoutDashboard },
          { to: '/lawyer/requests', label: 'Client Requests', icon: MessageSquare },
          { to: '/lawyer/appointments', label: 'Appointments & Schedule', icon: Calendar },
          { to: '/lawyer/earnings', label: 'Earnings & Payments', icon: CreditCard },
          { to: '/lawyer/profile', label: 'Advocate Profile', icon: User },
        ]
      };
    }
    return {
      roleLabel: 'Client',
      badgeText: '👤 Customer Portal',
      badgeClasses: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      avatarBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-2 ring-blue-400/40',
      dashboardPath: '/customer/legal-assistant',
      dashboardLabel: 'Client Dashboard',
      links: [
        { to: '/customer/legal-assistant', label: 'AI Legal Assistant', icon: Bot },
        { to: '/customer/find-lawyers', label: 'Find Advocates', icon: Scale },
        { to: '/customer/appointments', label: 'My Appointments', icon: Calendar },
        { to: '/customer/consultations', label: 'Consultations', icon: MessageSquare },
        { to: '/customer/profile', label: 'My Profile', icon: User },
      ]
    };
  };

  const roleConfig = getRoleConfig();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isNavActive = (path) => {
    return location.pathname === path;
  };

  const headerBgClass = scrolled 
    ? 'bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/80 shadow-md shadow-slate-950/20'
    : (isHomePage 
        ? 'bg-transparent border-none shadow-none' 
        : 'bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/80 shadow-md shadow-slate-950/20');

  const brandTitleColor = 'text-white';
  const brandTaglineColor = 'text-indigo-200/80';

  const navLinkActive = 'text-white bg-white/15 font-bold shadow-2xs';
  const navLinkInactive = 'text-slate-200 hover:text-white hover:bg-white/10 font-medium';

  const logoFilterClass = 'brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 font-['Outfit',sans-serif] ${headerBgClass}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
        scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-18'
      }`}>
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group transition-transform duration-200 hover:scale-[1.02]">
          <div className="relative">
            <img 
              src={logoImg} 
              alt="Adalat Logo" 
              className={`object-contain group-hover:scale-105 transition-all duration-300 ${logoFilterClass} ${
                scrolled ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-9 sm:h-9'
              }`} 
            />
          </div>
          <div className="flex flex-col">
            <span className={`font-bold tracking-wider font-['Cinzel',serif] leading-tight transition-all duration-300 ${
              scrolled ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
            } ${brandTitleColor}`}>
              ADALAT
            </span>
            <span className={`tracking-wider uppercase font-semibold transition-all duration-300 ${
              scrolled ? 'text-[8px]' : 'text-[9px]'
            } ${brandTaglineColor}`}>
              Justice • Guidance • Connection
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 p-0.5 rounded-full bg-slate-500/5 backdrop-blur-xs">
          {[
            { to: '/', label: 'Home' },
            { to: '/how-it-works', label: 'How It Works' },
            { to: '/legal-categories', label: 'Categories' },
            { to: '/about', label: 'About' },
          ].map((navItem, index) => {
            const active = isNavActive(navItem.to);
            return (
              <Link
                key={index}
                to={navItem.to}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                  active ? navLinkActive : navLinkInactive
                }`}
              >
                {navItem.label}
              </Link>
            );
          })}
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isUserLoggedIn ? (
            <div className="flex items-center gap-2 sm:gap-2.5" ref={dropdownRef}>
              
              {/* Quick Launch Dashboard CTA */}
              <Link 
                to={roleConfig.dashboardPath}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30"
              >
                <span>Dashboard</span>
                <ArrowRight size={13} className="animate-pulse" />
              </Link>

              {/* User Dropdown Pill */}
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-xs bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-white"
                  title="Account Menu"
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${roleConfig.avatarBg}`}>
                    {userInitial}
                  </div>
                  <div className="text-left hidden xl:block pr-0.5">
                    <div className="text-xs font-bold leading-tight truncate max-w-[110px]">
                      {displayName}
                    </div>
                    <div className="text-[9px] opacity-75 leading-tight capitalize font-medium">
                      {roleConfig.roleLabel}
                    </div>
                  </div>
                  <ChevronDown size={13} className={`transition-transform duration-200 opacity-70 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Popover */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Header Profile Card */}
                    <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white border-b border-slate-800 relative overflow-hidden">
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md ${roleConfig.avatarBg}`}>
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white truncate">
                            {displayName}
                          </div>
                          {displayEmail && (
                            <div className="text-xs text-slate-400 truncate mt-0.5">
                              {displayEmail}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5 relative z-10">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${roleConfig.badgeClasses}`}>
                          {roleConfig.badgeText}
                        </span>
                      </div>
                    </div>

                    {/* Role-Specific Navigation Links */}
                    <div className="py-1.5 px-1">
                      <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Portal Navigation
                      </div>
                      {roleConfig.links.map((item, idx) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={idx}
                            to={item.to}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all duration-150"
                          >
                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                              <IconComponent size={13} />
                            </div>
                            <span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 my-1"></div>

                    {/* Logout Button */}
                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link 
                to="/login" 
                className="px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm text-white hover:text-indigo-200 hover:bg-white/10 transition-all duration-200"
              >
                Sign In
              </Link>
              
              <Link 
                to="/register" 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-indigo-400/80 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/25 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs"
              >
                <span>Register</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-black">₹99</span>
              </Link>

              <Link 
                to="/lawyer/register" 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20"
              >
                <ShieldCheck size={14} />
                <span>Advocate Join</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button 
            className="lg:hidden p-1.5 rounded-xl transition-colors text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0f172a]/98 backdrop-blur-xl border-b border-slate-800 text-white px-4 py-4 shadow-2xl animate-in slide-in-from-top-4 duration-200 space-y-3">
          
          {/* If Logged In, Show User Card Banner */}
          {isUserLoggedIn ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${roleConfig.avatarBg}`}>
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate text-white">{displayName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{displayEmail || roleConfig.roleLabel}</div>
                </div>
              </div>
              
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${roleConfig.badgeClasses}`}>
                  {roleConfig.badgeText}
                </span>
                <Link 
                  to={roleConfig.dashboardPath}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <span>Dashboard</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ) : null}

          {/* Navigation Links */}
          <div className="flex flex-col space-y-0.5">
            {[
              { to: '/', label: 'Home' },
              { to: '/how-it-works', label: 'How It Works' },
              { to: '/legal-categories', label: 'Categories' },
              { to: '/about', label: 'About' },
            ].map((navItem, index) => {
              const active = isNavActive(navItem.to);
              return (
                <Link
                  key={index}
                  to={navItem.to}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    active ? 'bg-indigo-600/30 text-indigo-300 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {navItem.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-800 pt-2.5">
            {!isUserLoggedIn ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link 
                  to="/login" 
                  className="w-full py-2 rounded-xl text-center text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="w-full py-2 rounded-xl text-center text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  Register (₹99)
                </Link>
                <Link 
                  to="/lawyer/register" 
                  className="w-full py-2 rounded-xl text-center text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center justify-center gap-1"
                >
                  <ShieldCheck size={13} />
                  <span>Advocate Join</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-0.5 pt-1">
                <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Access
                </div>
                {roleConfig.links.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <Link 
                      key={idx}
                      to={item.to} 
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <IconComponent size={13} className="text-indigo-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 cursor-pointer mt-1"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </nav>
  );
};

export default Navbar;
