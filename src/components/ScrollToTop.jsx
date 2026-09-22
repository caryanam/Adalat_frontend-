import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  const isPortal = pathname.startsWith('/customer') || pathname.startsWith('/lawyer') || pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (isPortal) return null;

  const buttonStyle = {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 99,
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#5C5C99', // accent-gold
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(92, 92, 153, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    pointerEvents: isVisible ? 'auto' : 'none',
  };

  return (
    <button
      onClick={scrollToTop}
      style={buttonStyle}
      aria-label="Scroll to top"
      onMouseOver={(e) => {
        if (isVisible) {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(92, 92, 153, 0.55)';
          e.currentTarget.style.backgroundColor = '#45457a';
        }
      }}
      onMouseOut={(e) => {
        if (isVisible) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(92, 92, 153, 0.3)';
          e.currentTarget.style.backgroundColor = '#5C5C99';
        }
      }}
    >
      <ChevronUp size={24} />
    </button>
  );
};

export default ScrollToTop;
