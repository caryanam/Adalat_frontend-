// Rating Utility for Client Ratings & Reviews (Frontend Persistence & Backend Sync)
import apiClient from '../api/apiClient';

const STORAGE_KEY = 'adalat_lawyer_ratings_v1';

export const getLawyerRatingData = (lawyerId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const lId = String(lawyerId);
    
    if (data[lId]) {
      return data[lId];
    }
    
    // Default zero state for advocates with no reviews yet
    return {
      average: 0,
      count: 0,
      reviews: []
    };
  } catch (e) {
    return { average: 0, count: 0, reviews: [] };
  }
};

export const saveLawyerRating = async (lawyerId, rating, comment = '', customerName = 'Customer', consultationRequestId = null) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const lId = String(lawyerId);

    const existing = data[lId] || { average: 0, count: 0, reviews: [] };
    const newCount = existing.count + 1;
    const newAverage = Math.round(((existing.average * existing.count + rating) / newCount) * 10) / 10;

    const newReview = {
      id: Date.now(),
      name: customerName,
      rating,
      comment,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    data[lId] = {
      average: newAverage,
      count: newCount,
      reviews: [newReview, ...(existing.reviews || [])]
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Async backend database sync
    if (consultationRequestId) {
      apiClient.post(`/api/customer/consultations/${consultationRequestId}/rating`, {
        rating,
        comment,
        customerName
      }).catch(() => {});
    } else if (lawyerId) {
      apiClient.post(`/api/lawyers/${lawyerId}/ratings`, {
        rating,
        comment,
        customerName
      }).catch(() => {});
    }

    return data[lId];
  } catch (e) {
    return { average: rating, count: 1, reviews: [] };
  }
};
