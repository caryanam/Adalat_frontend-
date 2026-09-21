import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldCheck, MessageSquare, Calendar, CreditCard, Star } from 'lucide-react';
import { getLawyerRatingData } from '../../utils/ratingUtils';
import { consultationApi } from '../../api/consultationApi';
import { lawyerApi } from '../../api/lawyerApi';
import './LawyerPortalPages.css';

const LawyerDashboardPage = () => {
  const { user } = useAuth();
  const isApproved = user?.verificationStatus === 'APPROVED' || user?.accountStatus === 'ACTIVE';
  const [requests, setRequests] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState('₹0.00');

  useEffect(() => {
    const lawyerId = user?.lawyerId || user?.id || 1;
    consultationApi.getLawyerRequests()
      .then(res => {
        const raw = res && res.data ? (res.data.data || res.data) : [];
        if (Array.isArray(raw)) {
          setRequests(raw);
        }
      })
      .catch(() => setRequests([]));

    lawyerApi.getEarnings(lawyerId)
      .then(res => {
        const data = res && res.data ? (res.data.data || res.data) : null;
        if (data) {
          if (data.totalEarningsNum !== undefined && data.totalEarningsNum !== null) {
            setTotalEarnings(`₹${Number(data.totalEarningsNum).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
          } else if (data.totalEarnings) {
            setTotalEarnings(data.totalEarnings);
          }
        }
      })
      .catch(() => {});
  }, [user]);

  const ratingInfo = getLawyerRatingData(user?.lawyerId || user?.id || 1);

  return (
    <div className="portal-layout">
      <Sidebar portalType="lawyer" />

      <main className="portal-main-content">
        <div className="portal-header">
          <div className="header-title-row">
            <h1>Welcome, {user?.fullName || 'Advocate'}</h1>
            <StatusBadge status={user?.verificationStatus || 'PENDING'} />
          </div>
          <p>Bar Reg: {user?.barEnrollmentNumber || 'Not Provided'} • Advocate Dashboard</p>
        </div>

        {!isApproved ? (
          <div className="verification-banner warning card">
            <div className="banner-content">
              <Clock size={28} className="banner-icon-warning" />
              <div>
                <h3>Verification Status: Pending Review</h3>
                <p>Your profile and uploaded documents are currently under manual review by Adalat Admins. <strong>Your profile will become visible to customers in lawyer listings after admin approval.</strong></p>
              </div>
            </div>
            <Link to="/lawyer/documents" className="btn btn-outline-gold btn-sm">View Documents</Link>
          </div>
        ) : (
          <div className="verification-banner success card">
            <div className="banner-content">
              <ShieldCheck size={28} className="banner-icon-success" />
              <div>
                <h3>Verification Status: Approved & Active</h3>
                <p>Your profile is fully verified and visible to customers across India.</p>
              </div>
            </div>
          </div>
        )}

        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="metric-card card" style={{ border: '1.5px solid #5C5C99' }}>
            <div className="metric-icon-box gold"><Star size={22} fill="#5C5C99" color="#5C5C99" /></div>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#102A43' }}>
                {ratingInfo.average} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>/ 5.0</span>
              </h3>
              <p>Client Rating ({ratingInfo.count} Reviews)</p>
            </div>
          </div>
          <div className="metric-card card">
            <div className="metric-icon-box gold"><MessageSquare size={22} /></div>
            <div>
              <h3>{requests.length}</h3>
              <p>Consultation Requests</p>
            </div>
          </div>
          <div className="metric-card card">
            <div className="metric-icon-box teal"><CreditCard size={22} /></div>
            <div>
              <h3 style={{ color: '#0D9488' }}>{totalEarnings}</h3>
              <p>Total Earnings</p>
            </div>
          </div>
        </div>

        {/* Client Ratings & Reviews Section */}
        {ratingInfo.reviews && ratingInfo.reviews.length > 0 && (
          <div className="section-card card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header-row" style={{ marginBottom: '0.85rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', color: '#102A43' }}>
                <Star size={18} fill="#5C5C99" color="#5C5C99" /> Client Ratings & Feedback Reviews ({ratingInfo.reviews.length})
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
              {ratingInfo.reviews.map((rev) => (
                <div key={rev.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#102A43' }}>{rev.name}</strong>
                    <span style={{ fontSize: '0.74rem', color: '#5C5C99', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      ⭐ {rev.rating} / 5
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>
                    "{rev.comment || 'Great legal consultation experience.'}"
                  </p>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{rev.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section-card card">
          <div className="card-header-row">
            <h3>Incoming Consultation Requests</h3>
            <Link to="/lawyer/requests" className="view-all-link">Manage Requests</Link>
          </div>
          {requests.length === 0 ? (
            <EmptyState 
              icon={MessageSquare}
              title="No Consultation Requests"
              message="New consultation booking requests from customers will appear here."
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Legal Category</th>
                    <th>Request Message</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td>{req.customerName}</td>
                      <td>{req.category}</td>
                      <td>"{req.message}"</td>
                      <td><StatusBadge status={req.status || 'REQUESTED'} /></td>
                      <td>
                        <Link to="/lawyer/requests" className="btn btn-gold btn-sm">
                          <Calendar size={13} /> Accept / Assign Time
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LawyerDashboardPage;
