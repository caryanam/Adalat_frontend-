import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, UserCheck, Calendar, MessageSquare, 
  CreditCard, User, LogOut, ShieldCheck,
  TrendingUp, Scale, Bot, FileText
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ portalType = 'customer' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const customerLinks = [
    { to: '/customer/legal-assistant', label: 'Legal Assistant', icon: Bot },
    { to: '/customer/find-lawyers', label: 'Find Advocates', icon: Scale },
    { to: '/customer/appointments', label: 'Appointments', icon: Calendar },
    { to: '/customer/consultations', label: 'Consultations', icon: MessageSquare },
    { to: '/customer/profile', label: 'My Profile', icon: User },
  ];

  const lawyerLinks = [
    { to: '/lawyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/lawyer/requests', label: 'Consultation Requests', icon: MessageSquare },
    { to: '/lawyer/earnings', label: 'Earnings & Payments', icon: CreditCard },
    { to: '/lawyer/documents', label: 'My Verification Docs', icon: FileText },
    { to: '/lawyer/profile', label: 'Lawyer Profile', icon: User },
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

  const getPortalTitle = () => {
    if (portalType === 'lawyer') return 'Advocate Portal';
    if (portalType === 'admin') return 'Admin Console';
    return 'Customer Portal';
  };

  return (
    <aside className="adalat-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <Scale size={20} className="sidebar-logo-icon" />
          <span className="sidebar-brand-name">ADALAT</span>
        </div>
        <span className="sidebar-portal-tag">{getPortalTitle()}</span>
      </div>

      <div className="sidebar-user-card">
        <div className="user-card-avatar">
          {user?.fullName ? user.fullName.charAt(0) : 'U'}
        </div>
        <div className="user-card-info">
          <p className="user-card-name">{user?.fullName || 'User Name'}</p>
          <p className="user-card-email">{user?.email || 'user@adalat.legal'}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {getLinks().map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="sidebar-icon" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
