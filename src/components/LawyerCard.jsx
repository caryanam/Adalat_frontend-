import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Award, Languages, MessageSquare, Clock, Star, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { getLawyerRatingData } from '../utils/ratingUtils';
import apiClient from '../api/apiClient';
import './LawyerCard.css';

const LawyerCard = ({ lawyer }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const ratingInfo = getLawyerRatingData(lawyer.lawyerId || lawyer.id || 1);

  const practiceAreasStr = Array.isArray(lawyer.practiceAreas)
    ? lawyer.practiceAreas.map(p => typeof p === 'string' ? p.replace(/_/g, ' ') : p).join(' â€¢ ')
    : 'General Practice';

  const languagesStr = Array.isArray(lawyer.languages)
    ? lawyer.languages.join(', ')
    : 'English, Hindi';

  const rateAmount = lawyer.consultationRateAmount || 
                     (typeof lawyer.consultationRate === 'object' ? lawyer.consultationRate?.amount : null) || 
                     (typeof lawyer.consultationRate === 'string' ? lawyer.consultationRate.replace('RATE_', '') : '99');

  const rateDisplay = `â‚¹${rateAmount} / 10 min`;

  const primaryCategoryLabel = Array.isArray(lawyer.practiceAreas) && lawyer.practiceAreas.length > 0
    ? String(lawyer.practiceAreas[0]).replace(/_/g, ' ')
    : 'LEGAL SPECIALIST';

  const handleConsult = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.post('/api/customer/consultations', {
        lawyerId: lawyer.lawyerId || lawyer.id || 1,
        caseSummary: 'Consultation requested from lawyer directory'
      });
      navigate('/customer/consultations');
    } catch (err) {
      console.error('Failed to create consultation request:', err);
      navigate(`/customer/consultations?lawyerId=${lawyer.lawyerId || lawyer.id || 1}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-lawyer-card card">
      {/* Top Gold Accent Bar */}
      <div className="card-top-bar" />

      <div className="card-inner-padding">
        {/* Header Section */}
        <div className="lawyer-card-header">
          <div className="lawyer-avatar-container">
            <div className="lawyer-avatar">
              {lawyer.fullName ? lawyer.fullName.charAt(0) : 'A'}
            </div>
            <span className="online-status-dot" title="Available for Consultation" />
          </div>

          <div className="lawyer-header-details">
            <div className="name-and-verification">
              <h3 className="lawyer-name">{lawyer.fullName || 'Advocate'}</h3>
              <span className="verified-pill">
                <ShieldCheck size={13} className="shield-icon" /> Verified
              </span>
            </div>

            <div className="rating-and-bar-row">
              <div className="rating-tag">
                <Star size={13} fill={ratingInfo.count > 0 ? '#5C5C99' : 'none'} color="#5C5C99" />
                <span className="rating-score">{ratingInfo.count > 0 ? ratingInfo.average.toFixed(1) : '0.0'}</span>
                <span className="rating-reviews-count">({ratingInfo.count} {ratingInfo.count === 1 ? 'review' : 'reviews'})</span>
              </div>
              <span className="bar-number">Bar: {lawyer.barEnrollmentNumber || 'D/2491/2012'}</span>
            </div>

            <div className="category-badge-container">
              <span className="category-badge-pill">
                🏷️ Category: {primaryCategoryLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="lawyer-card-body">
          <div className="meta-chips-grid">
            <div className="meta-chip">
              <Award size={14} className="chip-icon" />
              <span>{lawyer.yearsOfExperience || lawyer.experience || 5}+ Yrs Exp</span>
            </div>
            <div className="meta-chip">
              <MapPin size={14} className="chip-icon" />
              <span>{lawyer.location || 'High Court'}</span>
            </div>
            <div className="meta-chip">
              <Languages size={14} className="chip-icon" />
              <span>{languagesStr}</span>
            </div>
          </div>

          <p className="lawyer-bio">
            {lawyer.bio 
              ? (lawyer.bio.length > 110 ? `${lawyer.bio.substring(0, 110)}...` : lawyer.bio) 
              : 'Senior legal advocate specializing in court litigation, advisory & fast-track dispute resolution.'}
          </p>

          <div className="specializations-row">
            <span className="spec-label">Practice:</span>
            <span className="spec-text">{practiceAreasStr}</span>
          </div>
        </div>

        {/* Footer Pricing & CTA Section */}
        <div className="lawyer-card-footer">
          <div className="pricing-info">
            <div className="price-value">{rateDisplay}</div>
            <div className="free-trial-tag">
              <CheckCircle2 size={12} /> 10m Free Chat Included
            </div>
          </div>

          <button 
            onClick={handleConsult}
            disabled={loading}
            className="btn btn-gold consult-now-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Consult Now'} 
            {!loading && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LawyerCard;
