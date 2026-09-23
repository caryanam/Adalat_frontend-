import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="w-full bg-[#060911] text-white font-['Outfit',sans-serif] relative overflow-hidden border-t border-slate-800/80">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Mission (5 cols) */}
          <div className="md:col-span-5 space-y-4 text-left">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img 
                src={logoImg} 
                alt="Adalat Logo" 
                className="w-9 h-9 object-contain brightness-0 invert drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform" 
              />
              <div className="flex flex-col">
                <span className="font-['Cinzel',serif] text-2xl font-bold tracking-widest text-white">
                  ADALAT
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-indigo-400 font-medium">
                  Legal Consultation Platform
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering citizens with trusted, verified advocates and transparent online legal guidance across India.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-400 pt-1">
              <a 
                href="mailto:support@adalat.legal" 
                className="inline-flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
              >
                <Mail size={14} className="text-indigo-400" />
                <span>support@adalat.legal</span>
              </a>
              <span className="text-slate-700">•</span>
              <a 
                href="tel:+919898989898" 
                className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
              >
                <Phone size={14} className="text-emerald-400" />
                <span>+91 9898989898</span>
              </a>
              <span className="text-slate-700">•</span>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <MapPin size={14} className="text-amber-400" />
                <span>Pune, India</span>
              </span>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-['Cinzel',serif]">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Find Advocate
                </Link>
              </li>
              <li>
                <Link to="/legal-categories" className="hover:text-white transition-colors">
                  Practice Areas
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Adalat
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-['Cinzel',serif]">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-['Cinzel',serif]">
              Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">
                  Client Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">
                  Advocate Login
                </Link>
              </li>
              <li>
                <Link to="/lawyer/register" className="hover:text-indigo-400 transition-colors">
                  Join as Advocate
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; 2026 Adalat. All rights reserved by Caryanamindia Pvt Ltd.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Developed by</span>
            <span className="font-semibold text-slate-200 hover:text-indigo-300 transition-colors">
              Caryanamindia Pvt Ltd
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
