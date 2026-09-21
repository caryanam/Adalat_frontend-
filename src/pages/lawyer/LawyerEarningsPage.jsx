import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { lawyerApi } from '../../api/lawyerApi';
import { CreditCard, TrendingUp, CheckCircle, RefreshCw, IndianRupee, User, ShieldCheck } from 'lucide-react';
import './LawyerPortalPages.css';

const LawyerEarningsPage = () => {
  const { user } = useAuth();
  const lawyerId = user?.lawyerId || user?.id || 1;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState({
    totalEarnings: '₹0.00',
    todayEarnings: '₹0.00',
    completedConsultations: 0,
    lawyerUpiId: user?.upiId || 'advocate@upi',
    lawyerName: user?.fullName || 'Advocate',
    transactions: []
  });

  const fetchEarnings = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await lawyerApi.getEarnings(lawyerId);
      const data = res && res.data ? (res.data.data || res.data) : null;
      if (data) {
        setEarnings({
          totalEarnings: data.totalEarnings || '₹0.00',
          todayEarnings: data.todayEarnings || '₹0.00',
          completedConsultations: data.completedConsultations || 0,
          lawyerUpiId: data.lawyerUpiId || user?.upiId || 'advocate@upi',
          lawyerName: data.lawyerName || user?.fullName || 'Advocate',
          transactions: Array.isArray(data.transactions) ? data.transactions : []
        });
      }
    } catch (err) {
      console.error('Failed to load lawyer earnings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [lawyerId]);

  const formatRupees = (amountNum, amountStr) => {
    if (amountNum !== undefined && amountNum !== null && !isNaN(amountNum)) {
      return `₹${Number(amountNum).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (amountStr && typeof amountStr === 'string' && !amountStr.includes('?')) {
      return amountStr;
    }
    return '₹0.00';
  };

  return (
    <div className="portal-layout">
      <Sidebar portalType="lawyer" />

      <main className="portal-main-content">
        <div className="portal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Earnings & UPI Payouts</h1>
            <p>Track direct customer consultation payments received to your registered UPI ID.</p>
          </div>
          <button 
            className="btn btn-outline-gold btn-sm" 
            onClick={() => fetchEarnings(true)} 
            disabled={loading || refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Payouts'}
          </button>
        </div>

        {/* UPI Settlement Payout Account Info Banner */}
        <div className="verification-banner success card" style={{ marginBottom: '1.5rem', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div className="banner-content">
            <ShieldCheck size={28} style={{ color: '#16A34A', flexShrink: 0 }} />
            <div>
              <h3 style={{ color: '#15803D', margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>
                Direct UPI Instant Settlement Account
              </h3>
              <p style={{ color: '#166534', margin: 0, fontSize: '0.84rem' }}>
                Customer fees are paid directly to your UPI handle: <strong>{earnings.lawyerUpiId || 'advocate@upi'}</strong> (Registered Name: <strong>{earnings.lawyerName}</strong>).
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card card">
            <div className="metric-icon-box teal"><IndianRupee size={22} /></div>
            <div>
              <h3 style={{ color: '#0D9488' }}>
                {loading ? '...' : formatRupees(earnings.totalEarningsNum, earnings.totalEarnings)}
              </h3>
              <p>Total Earnings</p>
            </div>
          </div>
          <div className="metric-card card">
            <div className="metric-icon-box gold"><TrendingUp size={22} /></div>
            <div>
              <h3 style={{ color: '#D97706' }}>
                {loading ? '...' : formatRupees(earnings.todayEarningsNum, earnings.todayEarnings)}
              </h3>
              <p>Today's Earnings</p>
            </div>
          </div>
          <div className="metric-card card">
            <div className="metric-icon-box navy"><CreditCard size={22} /></div>
            <div>
              <h3 style={{ color: '#1E293B' }}>{loading ? '...' : earnings.completedConsultations}</h3>
              <p>Completed Consultations</p>
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="section-card card">
          <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#102A43' }}>
              Transaction History ({earnings.transactions.length})
            </h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.75rem auto', display: 'block', color: '#5C5C99' }} />
              <p>Loading consultation payout transactions...</p>
            </div>
          ) : earnings.transactions.length === 0 ? (
            <div style={{ marginTop: '0.5rem' }}>
              <EmptyState 
                icon={CreditCard}
                title="No Earnings Received Yet"
                message="When customers book and pay for legal consultations with you, payment transaction receipts will appear in this history."
              />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Customer Name</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date & Time</th>
                    <th>Payout Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.transactions.map((tx, idx) => (
                    <tr key={tx.id || idx}>
                      <td>
                        <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem', color: '#334155' }}>
                          {tx.id}
                        </code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ color: '#1E293B', fontSize: '0.88rem' }}>{tx.customerName || 'Registered Client'}</strong>
                          {tx.customerEmail && (
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{tx.customerEmail}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                          {tx.category ? tx.category.replace(/_/g, ' ') : 'Legal Consultation'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#059669', fontSize: '0.92rem', fontWeight: 700 }}>
                          {formatRupees(tx.amountNum, tx.amount)}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                          {tx.date}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={tx.status || 'PAID'} />
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

export default LawyerEarningsPage;
