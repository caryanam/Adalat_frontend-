import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import logoImg from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'LAWYER') return '/lawyer/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/customer/legal-assistant';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/find-lawyer' && (location.pathname === '/find-lawyers' || location.pathname.startsWith('/lawyers'))) {
      return 'active';
    }
    return location.pathname === path ? 'active' : '';
  };

  const navbarClasses = `navbar ${isHomePage ? (scrolled ? 'scrolled' : 'transparent-hero') : 'solid-blue'}`;

  return (
    <nav className={navbarClasses}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-container">
            <img src={logoImg} alt="Adalat Logo" className="navbar-logo-img" />
          </div>
          <div className="brand-text">
            <span className="brand-name">ADALAT</span>
            <span className="brand-tagline">Justice. Guidance. Connection.</span>
          </div>
        </Link>

        <div className="navbar-links-desktop">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/find-lawyer" className={`nav-link ${isActive('/find-lawyer')}`}>Find Lawyers</Link>
          <Link to="/how-it-works" className={`nav-link ${isActive('/how-it-works')}`}>How It Works</Link>
          <Link to="/legal-categories" className={`nav-link ${isActive('/legal-categories')}`}>Categories</Link>
          <Link to="/about" className={`nav-link ${isActive('/about')}`}>About</Link>
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user.name || 'User'}</span>
                <ChevronDown size={16} className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name || 'User'}</p>
                    <p className="dropdown-email">{user.email || ''}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to={getDashboardLink()} className="dropdown-item">
                    <User size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-signin">Sign In</Link>
              <Link to="/register" className="btn-register">
                Register <span className="price-badge">(₹99)</span>
              </Link>
              <Link to="/lawyer/register" className="btn-advocate">
                <ShieldCheck size={18} />
                Advocate Join
              </Link>
            </div>
          )}

          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          <Link to="/" className={`mobile-nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/find-lawyer" className={`mobile-nav-link ${isActive('/find-lawyer')}`}>Find Lawyers</Link>
          <Link to="/how-it-works" className={`mobile-nav-link ${isActive('/how-it-works')}`}>How It Works</Link>
          <Link to="/legal-categories" className={`mobile-nav-link ${isActive('/legal-categories')}`}>Categories</Link>
          <Link to="/about" className={`mobile-nav-link ${isActive('/about')}`}>About</Link>
          
          <div className="mobile-divider"></div>
          
          {!user ? (
            <div className="mobile-auth-links">
              <Link to="/login" className="mobile-btn-signin">Sign In</Link>
              <Link to="/register" className="mobile-btn-register">Register (₹99)</Link>
              <Link to="/lawyer/register" className="mobile-btn-advocate">Advocate Join</Link>
            </div>
          ) : (
            <div className="mobile-user-links">
              <Link to={getDashboardLink()} className="mobile-nav-link">Dashboard</Link>
              <button onClick={handleLogout} className="mobile-nav-link mobile-logout">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
