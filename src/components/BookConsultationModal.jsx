import React, { useState, useEffect } from 'react';
import { X, Scale, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'CRIMINAL_LAW', label: 'Criminal Law' },
  { id: 'FAMILY_LAW', label: 'Family Law' },
  { id: 'PROPERTY_LAW', label: 'Property Law' },
  { id: 'CIVIL_DISPUTES', label: 'Civil Disputes' },
  { id: 'CONSUMER_LAW', label: 'Consumer Law' },
  { id: 'CORPORATE_LAW', label: 'Corporate Law' },
  { id: 'CYBERCRIME', label: 'Cybercrime' },
  { id: 'EMPLOYMENT_LAW', label: 'Employment Law' }
];

const BookConsultationModal = ({ isOpen, onClose, lawyer, onSuccess, initialCaseSummary = '', initialCategory = null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Ensure the default category exactly matches a backend ENUM value
  const getDefaultCategory = () => {
    if (initialCategory) {
      const exists = CATEGORIES.find(c => c.id === initialCategory);
      if (exists) return initialCategory;
    }
    if (lawyer?.practiceAreas && lawyer.practiceAreas.length > 0) {
      const pa = String(lawyer.practiceAreas[0]).toUpperCase().replace(/ /g, '_');
      const exists = CATEGORIES.find(c => c.id === pa);
      if (exists) return pa;
    }
    return 'CIVIL_DISPUTES';
  };

  const [category, setCategory] = useState(getDefaultCategory());
  const [caseSummary, setCaseSummary] = useState(initialCaseSummary);

  // Update state when props change
  useEffect(() => {
    if (isOpen) {
      if (initialCaseSummary) setCaseSummary(initialCaseSummary);
      setCategory(getDefaultCategory());
    }
  }, [isOpen, initialCaseSummary, initialCategory, lawyer]);

  if (!isOpen || !lawyer) return null;

  const getFeeAmount = (l) => {
    const amt = l.consultationRateAmount || 
                l.consultationFee || 
                (typeof l.consultationRate === 'object' ? l.consultationRate?.amount : null) || 
                (typeof l.consultationRate === 'string' ? l.consultationRate.replace('RATE_', '') : 99);
    return parseInt(amt, 10) || 99;
  };

  const formatName = (name) => {
    if (!name) return 'Advocate';
    if (name === name.toUpperCase()) {
      return name
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return name;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseSummary.trim()) {
      toast.error('Please provide a brief summary of your case.');
      return;
    }

    setLoading(true);
    try {
      const getLegalCategory = (paId) => {
        const mapping = {
          'CRIMINAL_LAW': 'CRIMINAL',
          'FAMILY_LAW': 'FAMILY',
          'PROPERTY_LAW': 'PROPERTY',
          'CIVIL_DISPUTES': 'CIVIL',
          'CONSUMER_LAW': 'CONSUMER',
          'CORPORATE_LAW': 'BUSINESS_COMMERCIAL',
          'CYBERCRIME': 'CYBERCRIME',
          'EMPLOYMENT_LAW': 'EMPLOYMENT'
        };
        return mapping[paId] || 'OTHER_LEGAL';
      };

      await apiClient.post('/api/customer/consultations', {
        lawyerId: lawyer.lawyerId || lawyer.id || 1,
        category: getLegalCategory(category),
        practiceArea: category,
        caseSummary: caseSummary.trim()
      });
      
      toast.success('Consultation request sent successfully!');
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/customer/consultations');
      }
    } catch (err) {
      console.error('Failed to create consultation request:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
      toast.error(`Failed to send consultation request: ${msg}`);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden font-['Outfit',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Book Consultation
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mb-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {formatName(lawyer.fullName)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Bar Verified Advocate
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-emerald-700">₹{getFeeAmount(lawyer)}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600/70">Per Session</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Scale size={14} className="text-indigo-600" /> Legal Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <FileText size={14} className="text-indigo-600" /> Case Summary
              </label>
              <textarea
                value={caseSummary}
                onChange={(e) => setCaseSummary(e.target.value)}
                placeholder="Briefly describe your legal issue, the parties involved, and what outcome you are looking for..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-400"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                This will help the advocate prepare for your consultation.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !caseSummary.trim()}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>Send Consultation Request</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookConsultationModal;
