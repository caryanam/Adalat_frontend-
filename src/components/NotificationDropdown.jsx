import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, CheckCheck, Clock, CreditCard, Scale, 
  ShieldCheck, UserCheck, MessageSquare, Star, Trash2, 
  Sparkles, Bot, AlertCircle, Info, ExternalLink, X
} from 'lucide-react';
import { notificationApi } from '../api/notificationApi';

const NotificationDropdown = ({ role = 'CUSTOMER', defaultLink = '/customer/consultations' }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const roleColors = {
    CUSTOMER: {
      bellActive: 'text-indigo-600 border-indigo-300 bg-indigo-50/50',
      badge: 'bg-rose-500 text-white',
      headerGradient: 'from-indigo-600 to-indigo-700',
      accent: 'text-indigo-600',
      hover: 'hover:border-indigo-200'
    },
    LAWYER: {
      bellActive: 'text-amber-600 border-amber-300 bg-amber-50/50',
      badge: 'bg-amber-500 text-slate-950 font-bold',
      headerGradient: 'from-amber-600 to-amber-700',
      accent: 'text-amber-600',
      hover: 'hover:border-amber-200'
    },
    ADMIN: {
      bellActive: 'text-purple-600 border-purple-300 bg-purple-50/50',
      badge: 'bg-purple-600 text-white',
      headerGradient: 'from-purple-600 to-indigo-700',
      accent: 'text-purple-600',
      hover: 'hover:border-purple-200'
    }
  };

  const theme = roleColors[role] || roleColors.CUSTOMER;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
      const unread = (data || []).filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // Ignore background count failure
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        // Continue navigation
      }
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    } else if (defaultLink) {
      navigate(defaultLink);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'CONSULTATION_ACCEPTED':
        return <Check className="text-emerald-600" size={16} />;
      case 'CONSULTATION_REJECTED':
        return <AlertCircle className="text-rose-600" size={16} />;
      case 'LAWYER_WAITING':
        return <Clock className="text-amber-500 animate-pulse" size={16} />;
      case 'NEW_CONSULTATION_REQUEST':
        return <Scale className="text-indigo-600" size={16} />;
      case 'CONSULTATION_PAID':
      case 'PAYMENT_CONFIRMED':
      case 'PLATFORM_FEE_PAID':
      case 'CONSULTATION_PAYMENT_LOGGED':
        return <CreditCard className="text-emerald-600" size={16} />;
      case 'LAWYER_APPROVED':
        return <ShieldCheck className="text-emerald-600" size={16} />;
      case 'LAWYER_REJECTED':
        return <AlertCircle className="text-rose-600" size={16} />;
      case 'NEW_CUSTOMER_REGISTERED':
      case 'NEW_LAWYER_REGISTERED':
        return <UserCheck className="text-purple-600" size={16} />;
      case 'NEW_REVIEW_RECEIVED':
        return <Star className="text-amber-500" size={16} />;
      case 'CONSULTATION_COMPLETED':
        return <CheckCheck className="text-indigo-600" size={16} />;
      default:
        return <Info className="text-slate-500" size={16} />;
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      if (diffInSeconds < 60) return 'Just now';
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications & Activity"
        aria-label="Toggle notifications menu"
        className={`relative w-9 h-9 rounded-xl border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
          isOpen ? theme.bellActive : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
        }`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white animate-bounce [animation-duration:3s] ${theme.badge}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden font-['Outfit',sans-serif] animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-amber-400" />
              <h3 className="text-xs font-bold tracking-wide uppercase">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
                Loading updates...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                  <Bell size={20} />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-0.5">No notifications yet</h4>
                <p className="text-[11px] text-slate-500">You're all caught up on case activities and updates.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3 sm:p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left hover:bg-slate-50/90 relative ${
                    !n.isRead ? 'bg-amber-50/25 font-medium' : 'bg-white text-slate-600'
                  }`}
                >
                  {/* Icon Indicator */}
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {getIcon(n.type)}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1.5 mb-0.5">
                      <h4 className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'} leading-tight truncate`}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatTimeAgo(n.createdAt)}
                      </span>
                      <div className="flex items-center gap-2 opacity-80 hover:opacity-100">
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(e, n.id)}
                            title="Mark as read"
                            className="hover:text-emerald-600 transition-colors p-0.5"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, n.id)}
                          title="Dismiss"
                          className="hover:text-rose-600 transition-colors p-0.5"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(defaultLink);
              }}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <span>View All Consultations & Activity</span>
              <ExternalLink size={12} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
