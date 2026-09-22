import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import CustomerHeader from '../../components/CustomerHeader';
import { 
  Search, 
  Filter, 
  Users, 
  Award, 
  ArrowUpDown, 
  X, 
  RotateCcw,
  Scale,
  ShieldCheck,
  Star,
  MapPin,
  Languages,
  GraduationCap,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { lawyerApi } from '../../api/lawyerApi';
import apiClient from '../../api/apiClient';
import LawyerCard from '../../components/LawyerCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { getLawyerRatingData } from '../../utils/ratingUtils';

const CATEGORIES = [
  { id: 'ALL', label: 'All Specializations' },
  { id: 'CRIMINAL_LAW', label: 'Criminal Law' },
  { id: 'FAMILY_LAW', label: 'Family Law' },
  { id: 'PROPERTY_LAW', label: 'Property Law' },
  { id: 'CIVIL_DISPUTES', label: 'Civil Disputes' },
  { id: 'CONSUMER_LAW', label: 'Consumer Law' },
  { id: 'CORPORATE_LAW', label: 'Corporate Law' },
  { id: 'CYBERCRIME', label: 'Cybercrime' },
  { id: 'EMPLOYMENT_LAW', label: 'Employment Law' }
];

const CustomerFindLawyersPage = () => {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [minExperience, setMinExperience] = useState('ALL');
  const [sortBy, setSortBy] = useState('FEATURED');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const response = await lawyerApi.getApprovedLawyers();
      const raw = response && response.data ? (response.data.data || response.data) : [];
      setLawyers(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  const getFeeAmount = (l) => {
    const amt = l.consultationRateAmount || 
                l.consultationFee || 
                (typeof l.consultationRate === 'object' ? l.consultationRate?.amount : null) || 
                (typeof l.consultationRate === 'string' ? l.consultationRate.replace('RATE_', '') : 99);
    return parseInt(amt, 10) || 99;
  };

  const filteredLawyers = useMemo(() => {
    return lawyers
      .filter(lawyer => {
        const searchLower = searchTerm.trim().toLowerCase();
        const matchesSearch = !searchLower || 
                              lawyer.fullName?.toLowerCase().includes(searchLower) || 
                              lawyer.education?.toLowerCase().includes(searchLower) ||
                              lawyer.location?.toLowerCase().includes(searchLower) ||
                              lawyer.bio?.toLowerCase().includes(searchLower) ||
                              lawyer.barEnrollmentNumber?.toLowerCase().includes(searchLower) ||
                              (Array.isArray(lawyer.practiceAreas) && lawyer.practiceAreas.some(p => p.toLowerCase().replace(/_/g, ' ').includes(searchLower)));
        
        const matchesCategory = selectedCategory === 'ALL' || 
                                (Array.isArray(lawyer.practiceAreas) && lawyer.practiceAreas.includes(selectedCategory));

        const exp = parseInt(lawyer.yearsOfExperience || lawyer.experience || 0, 10);
        const matchesExp = minExperience === 'ALL' || exp >= parseInt(minExperience, 10);

        return matchesSearch && matchesCategory && matchesExp;
      })
      .sort((a, b) => {
        if (sortBy === 'RATING_DESC') {
          const ratingA = a.rating || (getLawyerRatingData(a.lawyerId || a.id || 1).average) || 0;
          const ratingB = b.rating || (getLawyerRatingData(b.lawyerId || b.id || 1).average) || 0;
          return ratingB - ratingA;
        }
        if (sortBy === 'EXP_DESC') {
          const expA = parseInt(a.yearsOfExperience || a.experience || 0, 10);
          const expB = parseInt(b.yearsOfExperience || b.experience || 0, 10);
          return expB - expA;
        }
        if (sortBy === 'FEE_ASC') {
          return getFeeAmount(a) - getFeeAmount(b);
        }
        if (sortBy === 'FEE_DESC') {
          return getFeeAmount(b) - getFeeAmount(a);
        }
        return 0; // FEATURED
      });
  }, [lawyers, searchTerm, selectedCategory, minExperience, sortBy]);

  const hasActiveFilters = searchTerm || selectedCategory !== 'ALL' || minExperience !== 'ALL' || sortBy !== 'FEATURED';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setMinExperience('ALL');
    setSortBy('FEATURED');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const cleaned = name.replace(/^(adv(\.|\s+)|advocate\s+|dr(\.|\s+)|mr(\.|\s+)|ms(\.|\s+)|mrs(\.|\s+))/i, '').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return name.charAt(0).toUpperCase();
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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

  const handleConsult = async (lawyer) => {
    try {
      setModalLoading(true);
      await apiClient.post('/api/customer/consultations', {
        lawyerId: lawyer.lawyerId || lawyer.id || 1,
        caseSummary: 'Consultation requested from advocate directory'
      });
      navigate('/customer/consultations');
    } catch (err) {
      console.error('Failed to create consultation request:', err);
      navigate(`/customer/consultations?lawyerId=${lawyer.lawyerId || lawyer.id || 1}`);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="customer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <CustomerHeader 
          title="Find Advocates"
          subtitle="Search and connect with verified legal professionals across India."
          badge={{ text: "Verified Network", variant: "indigo" }}
        />

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-5 sm:space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* SEARCH & MULTI-FILTER TOOLBAR CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
            
            {/* 4-INPUT FILTER ROW: Search, Specialization Dropdown, Experience Dropdown, Sort Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              {/* 1. Search by Name / Court / Specialization */}
              <div className="relative sm:col-span-2 lg:col-span-4 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input 
                  type="text" 
                  placeholder="Search advocates, courts, city, keywords..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* 2. Specialization / Category Dropdown */}
              <div className="relative sm:col-span-1 lg:col-span-3 w-full">
                <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-2xs font-medium"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                  ▼
                </div>
              </div>
              
              {/* 3. Experience Multi-Filter Dropdown */}
              <div className="relative sm:col-span-1 lg:col-span-2 w-full">
                <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <select 
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-2xs font-medium"
                >
                  <option value="ALL">All Experience</option>
                  <option value="3">3+ Years</option>
                  <option value="5">5+ Years</option>
                  <option value="10">10+ Years</option>
                  <option value="15">15+ Years</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                  ▼
                </div>
              </div>

              {/* 4. Sort By Filter Dropdown */}
              <div className="relative sm:col-span-2 lg:col-span-3 w-full">
                <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-2xs font-medium"
                >
                  <option value="FEATURED">Recommended Advocates</option>
                  <option value="RATING_DESC">Highest Rated</option>
                  <option value="EXP_DESC">Most Experienced</option>
                  <option value="FEE_ASC">Fee: Low to High</option>
                  <option value="FEE_DESC">Fee: High to Low</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            {/* RESULTS SUMMARY + REMOVABLE ACTIVE FILTER CHIPS */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500">
                  Showing <strong className="text-slate-800 font-bold">{filteredLawyers.length}</strong> verified legal advocate{filteredLawyers.length === 1 ? '' : 's'}
                </span>

                {/* Active Category Tag */}
                {selectedCategory !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                    Category: {CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory}
                    <button 
                      onClick={() => setSelectedCategory('ALL')} 
                      title="Remove filter"
                      className="hover:text-indigo-950 cursor-pointer ml-0.5 p-0.5"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}

                {/* Active Experience Tag */}
                {minExperience !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                    Min Exp: {minExperience}+ Yrs
                    <button 
                      onClick={() => setMinExperience('ALL')} 
                      title="Remove filter"
                      className="hover:text-indigo-950 cursor-pointer ml-0.5 p-0.5"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}

                {/* Active Sort Tag */}
                {sortBy !== 'FEATURED' && (
                  <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                    Sort: {
                      sortBy === 'RATING_DESC' ? 'Highest Rated' :
                      sortBy === 'EXP_DESC' ? 'Most Experienced' :
                      sortBy === 'FEE_ASC' ? 'Lowest Fee' : 'Highest Fee'
                    }
                    <button 
                      onClick={() => setSortBy('FEATURED')} 
                      title="Remove filter"
                      className="hover:text-indigo-950 cursor-pointer ml-0.5 p-0.5"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}

                {/* Active Search Term Tag */}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                    "{searchTerm}"
                    <button 
                      onClick={() => setSearchTerm('')} 
                      title="Remove search filter"
                      className="hover:text-indigo-950 cursor-pointer ml-0.5 p-0.5"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* ADVOCATES GRID SECTION */}
          {loading ? (
            <div className="py-12">
              <LoadingState message="Finding the best verified advocates for you..." />
            </div>
          ) : filteredLawyers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredLawyers.map((lawyer, index) => (
                <div key={lawyer.lawyerId || lawyer.id || index} className="transition-all duration-200 hover:-translate-y-0.5 h-full">
                  <LawyerCard 
                    lawyer={lawyer} 
                    onViewProfile={(l) => setSelectedLawyer(l)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs text-center">
              <EmptyState 
                icon={Users}
                title="No Advocates Found" 
                message="We couldn't find any verified advocates matching your active filters. Try clearing your filters or broadening your search criteria."
              />
              {hasActiveFilters && (
                <div className="mt-4">
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <RotateCcw size={13} />
                    <span>Clear All Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* DETAILED LAWYER PROFILE MODAL (EXPANDED WIDTH: max-w-2xl sm:max-w-3xl) */}
      {/* DETAILED LAWYER PROFILE MODAL (EXPANDED WIDTH: max-w-4xl lg:max-w-5xl) */}
      {selectedLawyer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedLawyer(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl text-slate-800 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full font-['Outfit',sans-serif]"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setSelectedLawyer(null)} 
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer z-10"
              title="Close modal"
            >
              <X size={16} />
            </button>

            {/* Top Identity Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 pr-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0 shadow-md">
                  {getInitials(selectedLawyer.fullName)}
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="truncate">{formatName(selectedLawyer.fullName)}</span>
                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" title="Bar Council Verified" />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      <ShieldCheck size={12} /> Bar Council Verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available for Consultation
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Fee Card Highlight on Header */}
              <div className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl flex sm:flex-col items-center sm:items-end justify-between gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Consultation Fee</span>
                <span className="text-emerald-700 font-bold text-base sm:text-lg">₹{getFeeAmount(selectedLawyer)} <span className="text-xs text-slate-500 font-normal">/ session</span></span>
              </div>
            </div>

            {/* Stats Row: 4 Metric Cards across the expanded width */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="text-center bg-slate-50 border border-slate-200/80 p-3 sm:p-3.5 rounded-2xl">
                <div className="text-base sm:text-lg font-bold text-amber-500 flex items-center justify-center gap-1">
                  <Star size={15} className="fill-amber-400" />
                  {selectedLawyer.rating ? selectedLawyer.rating.toFixed(1) : '4.8'}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 mt-1 font-semibold">Client Rating</div>
              </div>
              <div className="text-center bg-slate-50 border border-slate-200/80 p-3 sm:p-3.5 rounded-2xl">
                <div className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedLawyer.yearsOfExperience || selectedLawyer.experience || 5}+ Years
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 mt-1 font-semibold">Legal Experience</div>
              </div>
              <div className="text-center bg-slate-50 border border-slate-200/80 p-3 sm:p-3.5 rounded-2xl">
                <div className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedLawyer.totalConsultations || 14}+ Cases
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 mt-1 font-semibold">Consultations Done</div>
              </div>
              <div className="text-center bg-slate-50 border border-slate-200/80 p-3 sm:p-3.5 rounded-2xl">
                <div className="text-base sm:text-lg font-bold text-indigo-600 flex items-center justify-center gap-1">
                  <ShieldCheck size={16} /> 100%
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 mt-1 font-semibold">Verified Identity</div>
              </div>
            </div>

            {/* 2-COLUMN CONTENT SECTION (Side by side on medium and large screens) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              
              {/* LEFT COLUMN: Professional Info & Practice Areas (Span 6) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-['Outfit',sans-serif]">
                    Professional Details
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                      <span className="text-slate-500 text-xs block mb-0.5 flex items-center gap-1">
                        <MapPin size={13} className="text-indigo-600" /> Jurisdiction
                      </span>
                      <span className="text-slate-900 font-semibold">{selectedLawyer.location || 'High Court'}</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                      <span className="text-slate-500 text-xs block mb-0.5 flex items-center gap-1">
                        <GraduationCap size={13} className="text-indigo-600" /> Education
                      </span>
                      <span className="text-slate-900 font-semibold">{selectedLawyer.education || 'LLB / LLM'}</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                      <span className="text-slate-500 text-xs block mb-0.5 flex items-center gap-1">
                        <Languages size={13} className="text-indigo-600" /> Languages
                      </span>
                      <span className="text-slate-900 font-semibold truncate block">
                        {Array.isArray(selectedLawyer.languages) ? selectedLawyer.languages.join(', ') : (selectedLawyer.languages || 'English, Hindi')}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                      <span className="text-slate-500 text-xs block mb-0.5 flex items-center gap-1">
                        <Award size={13} className="text-indigo-600" /> Bar Registration
                      </span>
                      <span className="text-slate-900 font-mono font-semibold truncate block">
                        {selectedLawyer.barEnrollmentNumber || 'Verified Advocate'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Practice Areas */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 font-['Outfit',sans-serif]">
                    Practice Areas & Specializations
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(selectedLawyer.practiceAreas) && selectedLawyer.practiceAreas.length > 0 ? (
                      selectedLawyer.practiceAreas.map((p, idx) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-3 py-1 rounded-lg">
                          {typeof p === 'string' ? p.replace(/_/g, ' ') : p}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-700 font-semibold text-xs">General Civil & Criminal Litigation</span>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Professional Bio & Security Guarantee (Span 6) */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex-1 flex flex-col">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-['Outfit',sans-serif]">
                    About The Advocate
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
                    {selectedLawyer.bio || `${formatName(selectedLawyer.fullName)} is an experienced legal advocate specializing in ${Array.isArray(selectedLawyer.practiceAreas) && selectedLawyer.practiceAreas.length > 0 ? selectedLawyer.practiceAreas.map(p => typeof p === 'string' ? p.replace(/_/g, ' ') : p).join(', ') : 'legal disputes and client advisory'}. With extensive courtroom and arbitration practice, they provide dedicated legal counsel and representation.`}
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                  <span>
                    <strong>Confidential & Protected:</strong> All communications and consultation materials are strictly privileged and encrypted.
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLawyer(null)}
                className="w-full sm:w-32 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer order-2 sm:order-1"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => { const l = selectedLawyer; setSelectedLawyer(null); handleConsult(l); }}
                disabled={modalLoading}
                className="w-full sm:flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
              >
                {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>Book Consultation (₹{getFeeAmount(selectedLawyer)})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFindLawyersPage;
