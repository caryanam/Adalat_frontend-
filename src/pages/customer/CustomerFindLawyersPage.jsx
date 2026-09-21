import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Search, Filter, Users } from 'lucide-react';
import { lawyerApi } from '../../api/lawyerApi';
import LawyerCard from '../../components/LawyerCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import '../public/FindLawyerPage.css'; // Keep the styling for the grid/cards
import './CustomerDashboardPage.css';

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
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
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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

  const filteredLawyers = lawyers.filter(lawyer => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
                          lawyer.fullName?.toLowerCase().includes(searchLower) || 
                          lawyer.education?.toLowerCase().includes(searchLower) ||
                          lawyer.location?.toLowerCase().includes(searchLower) ||
                          (Array.isArray(lawyer.practiceAreas) && lawyer.practiceAreas.some(p => p.toLowerCase().includes(searchLower)));
    
    const matchesCategory = selectedCategory === 'ALL' || 
                            (Array.isArray(lawyer.practiceAreas) && lawyer.practiceAreas.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="portal-layout">
      <Sidebar portalType="customer" />

      <main className="portal-main-content">
        <div className="portal-header">
          <div className="card-header-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>Find Advocates</h1>
              <p>Search and connect with verified legal professionals across India.</p>
            </div>
          </div>
        </div>

        <div className="section-card card" style={{ padding: '1.5rem' }}>
          {/* Search and Filter Section */}
          <div className="search-container" style={{ margin: '0 0 2rem 0', maxWidth: '100%' }}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, specialization, court..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-wrapper">
              <Filter className="filter-icon" size={20} />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {loading ? (
            <LoadingState message="Finding the best lawyers for you..." />
          ) : filteredLawyers.length > 0 ? (
            <div className="lawyers-grid" style={{ padding: 0 }}>
              {filteredLawyers.map((lawyer, index) => (
                <div key={lawyer.lawyerId || lawyer.id || index} style={{ opacity: 1 }}>
                  <LawyerCard lawyer={lawyer} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Users}
              title="No Lawyers Found" 
              message="We couldn't find any lawyers matching your current criteria. Please try adjusting your search or category filter."
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerFindLawyersPage;
