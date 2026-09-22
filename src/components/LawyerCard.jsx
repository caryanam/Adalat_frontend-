import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Star, 
  MapPin, 
  Award, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { getLawyerRatingData } from '../utils/ratingUtils';
import apiClient from '../api/apiClient';

const LawyerCard = ({ lawyer, onViewProfile }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const ratingInfo = getLawyerRatingData(lawyer.lawyerId || lawyer.id || 1);

  const practiceAreasList = Array.isArray(lawyer.practiceAreas)
    ? lawyer.practiceAreas.map(p => typeof p === 'string' ? p.replace(/_/g, ' ') : p)
    : ['General Practice'];

  const rateAmount = lawyer.consultationRateAmount || 
                     lawyer.consultationFee ||
                     (typeof lawyer.consultationRate === 'object' ? lawyer.consultationRate?.amount : null) || 
                     (typeof lawyer.consultationRate === 'string' ? lawyer.consultationRate.replace('RATE_', '') : '99');

  const rawCategory = practiceAreasList.length > 0 ? practiceAreasList[0] : 'Legal Specialist';
  const categoryLabel = rawCategory
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());

  // Smart advocate initials calculation (e.g. "Adv. Virat Kohli" -> "VK")
  const getInitials = (name) => {
    if (!name) return 'A';
    const cleaned = name.replace(/^(adv(\.|\s+)|advocate\s+|dr(\.|\s+)|mr(\.|\s+)|ms(\.|\s+)|mrs(\.|\s+))/i, '').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return name.charAt(0).toUpperCase();
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Gracefully format ALL-CAPS names (e.g. "ADV. VIRAT KOHLI" -> "Adv. Virat Kohli")
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

  const handleConsult = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await apiClient.post('/api/customer/consultations', {
        lawyerId: lawyer.lawyerId || lawyer.id || 1,
        caseSummary: 'Consultation requested from advocate directory'
      });
      navigate('/customer/consultations');
    } catch (err) {
      console.error('Failed to create consultation request:', err);
      navigate(`/customer/consultations?lawyerId=${lawyer.lawyerId || lawyer.id || 1}`);
    } finally {
      setLoading(false);
    }
  };

  const ratingScore = ratingInfo.count > 0 ? ratingInfo.average.toFixed(1) : (lawyer.rating ? lawyer.rating.toFixed(1) : '4.8');
  const yearsExp = lawyer.yearsOfExperience || lawyer.experience || 5;
  const initials = getInitials(lawyer.fullName);
  const displayName = formatName(lawyer.fullName);

  return (
    <div 
      onClick={() => onViewProfile && onViewProfile(lawyer)}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between h-full group cursor-pointer font-['Outfit',sans-serif]"
    >
      {/* Top Header Row: Avatar + Name + Specialization */}
      <div>
        <div className="flex items-start gap-3.5">
          {/* Avatar with smart initials & online dot */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title="Online" />
          </div>

          {/* Name & Specialization */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-['Outfit',sans-serif] font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors truncate">
                {displayName}
              </span>
              <CheckCircle2 size={15} className="text-emerald-500 fill-emerald-50 shrink-0" title="Verified Advocate" />
            </div>

            <p className="font-['Outfit',sans-serif] text-xs font-semibold text-indigo-600 truncate mt-1">
              {categoryLabel}
            </p>
          </div>
        </div>

        {/* Clean Metadata Strip with Proper Icons & Spacing */}
        <div className="flex items-center justify-between text-xs text-slate-600 py-2.5 px-3 bg-slate-50 border border-slate-100/90 rounded-xl mt-3.5">
          {/* Star Rating */}
          <div className="inline-flex items-center gap-1 font-bold text-slate-800">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span>{ratingScore}</span>
          </div>

          <span className="text-slate-300">•</span>

          {/* Location with MapPin Icon */}
          <div className="inline-flex items-center gap-1 text-slate-600 truncate max-w-[120px]">
            <MapPin size={12} className="text-indigo-500 shrink-0" />
            <span className="truncate">{lawyer.location || 'High Court'}</span>
          </div>

          <span className="text-slate-300">•</span>

          {/* Experience with Award Icon */}
          <div className="inline-flex items-center gap-1 text-slate-600 shrink-0">
            <Award size={12} className="text-indigo-500 shrink-0" />
            <span>{yearsExp}+ yrs exp</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Price + Clean Actions */}
      <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block leading-none">Consultation</span>
          <div className="font-['Outfit',sans-serif] font-bold text-slate-900 text-base mt-1 leading-none">
            ₹{rateAmount} <span className="text-xs font-normal text-slate-400">/ session</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onViewProfile && onViewProfile(lawyer); }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            Details
          </button>
          <button 
            type="button"
            onClick={handleConsult}
            disabled={loading}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <span>Consult</span>}
            {!loading && <ArrowRight size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LawyerCard;
