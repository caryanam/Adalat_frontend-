import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { MessageSquare, Calendar, CreditCard, Scale, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CustomerDashboardPage.css';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);

  return (
    <div className="portal-layout">
      <Sidebar portalType="customer" />

      <main className="portal-main-content">
        <div className="portal-header">
          <span className="badge badge-success"><ShieldCheck size={12} /> Account Active (₹99 Paid)</span>
          <h1>Welcome, {user?.fullName || 'Customer'}</h1>
          <p>Manage your active legal consultations, booked appointments, and payment history.</p>
        </div>

        {/* Overview Metric Cards */}
        <div className="metrics-grid">
          <div className="metric-card card">
            <div className="metric-icon-box navy"><MessageSquare size={22} /></div>
            <div>
              <h3>{consultations.length} Active</h3>
              <p>Consultations</p>
            </div>
          </div>
          <div className="metric-card card">
            <div className="metric-icon-box gold"><Calendar size={22} /></div>
            <div>
              <h3>0 Upcoming</h3>
              <p>Appointments</p>
            </div>
          </div>
          <div className="metric-card card">
            <div className="metric-icon-box teal"><CreditCard size={22} /></div>
            <div>
              <h3>₹99.00</h3>
              <p>Registration Paid</p>
            </div>
          </div>
          <div className="metric-card card">
            <div className="metric-icon-box navy"><Scale size={22} /></div>
            <div>
              <h3>Verified</h3>
              <p>Top Advocates</p>
            </div>
          </div>
        </div>

        {/* Quick Action Prompt */}
        <div className="ai-prompt-banner card">
          <div className="prompt-content">
            <Scale size={28} className="prompt-bot-icon" />
            <div>
              <h3>Need Legal Advice Right Now?</h3>
              <p>Connect with top verified advocates across India for court litigation, legal advisory, and consultation.</p>
            </div>
          </div>
          <Link to="/find-lawyers" className="btn btn-gold">
            Find Advocates <ArrowRight size={16} />
          </Link>
        </div>

        {/* Recent Consultations & Appointments Table */}
        <div className="dashboard-content-grid">
          <div className="section-card card">
            <div className="card-header-row">
              <h3>Active & Recent Consultations</h3>
              <Link to="/customer/consultations" className="view-all-link">View All</Link>
            </div>
            {consultations.length === 0 ? (
              <EmptyState 
                icon={MessageSquare}
                title="No Active Consultations"
                message="Visit the Find Advocates tab to book your direct consultation."
              />
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Advocate</th>
                      <th>Category</th>
                      <th>Rate</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.lawyerName}</strong></td>
                        <td>{c.category}</td>
                        <td>{c.rate}</td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>
                          <Link to={`/customer/consultations?lawyerId=${c.lawyerId}`} className="btn btn-gold btn-sm">
                            <MessageSquare size={13} /> Chat (10m Free)
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboardPage;
