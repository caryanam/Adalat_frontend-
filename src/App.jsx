import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/public/HomePage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import FindLawyerPage from './pages/public/FindLawyerPage';
import LegalCategoriesPage from './pages/public/LegalCategoriesPage';
import AboutPage from './pages/public/AboutPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';
import RefundPolicyPage from './pages/public/RefundPolicyPage';

import LoginPage from './pages/auth/LoginPage';
import CustomerRegisterPage from './pages/auth/CustomerRegisterPage';
import LawyerSignupPage from './pages/auth/LawyerSignupPage';
import LawyerRegisterWizardPage from './pages/auth/LawyerRegisterWizardPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';

import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import LegalAssistantPage from './pages/customer/LegalAssistantPage';
import CustomerConsultationPage from './pages/customer/CustomerConsultationPage';
import CustomerAppointmentsPage from './pages/customer/CustomerAppointmentsPage';
import CustomerPaymentsPage from './pages/customer/CustomerPaymentsPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import CustomerFindLawyersPage from './pages/customer/CustomerFindLawyersPage';

import LawyerDashboardPage from './pages/lawyer/LawyerDashboardPage';
import LawyerRequestsPage from './pages/lawyer/LawyerRequestsPage';
import LawyerEarningsPage from './pages/lawyer/LawyerEarningsPage';
import LawyerDocumentsPage from './pages/lawyer/LawyerDocumentsPage';
import LawyerProfilePage from './pages/lawyer/LawyerProfilePage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminLawyersPage from './pages/admin/AdminLawyersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

const AppLayout = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/customer/') || 
                           location.pathname.startsWith('/lawyer/') || 
                           location.pathname.startsWith('/admin/');

  const isRegisterRoute = location.pathname === '/register' || 
                           location.pathname === '/lawyer/register' ||
                           location.pathname.startsWith('/register') ||
                           location.pathname === '/verify-email' ||
                           location.pathname === '/login';

  const hideNavbarFooter = isDashboardRoute || isRegisterRoute;

  return (
    <>
      <ScrollToTop />
      {!hideNavbarFooter && <Navbar />}
      <div className="page-wrapper" style={{ transition: 'opacity 0.3s ease-in-out' }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/find-lawyer" element={<FindLawyerPage />} />
          <Route path="/find-lawyers" element={<FindLawyerPage />} />
          <Route path="/lawyers" element={<FindLawyerPage />} />
          <Route path="/lawyers/:id" element={<FindLawyerPage />} />
          <Route path="/legal-categories" element={<LegalCategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<AboutPage />} />
          <Route path="/help" element={<AboutPage />} />
          <Route path="/faqs" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/ai-disclaimer" element={<TermsPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<CustomerRegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/lawyer/register" element={<LawyerSignupPage />} />
          <Route path="/lawyer/onboarding" element={<LawyerRegisterWizardPage />} />
          <Route path="/lawyer/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Customer */}
          <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
          <Route path="/customer/legal-assistant" element={<LegalAssistantPage />} />
          <Route path="/customer/find-lawyers" element={<CustomerFindLawyersPage />} />
          <Route path="/customer/appointments" element={<CustomerAppointmentsPage />} />
          <Route path="/customer/consultations" element={<CustomerConsultationPage />} />
          <Route path="/customer/payments" element={<CustomerPaymentsPage />} />
          <Route path="/customer/profile" element={<CustomerProfilePage />} />

          {/* Lawyer */}
          <Route path="/lawyer/dashboard" element={<LawyerDashboardPage />} />
          <Route path="/lawyer/requests" element={<LawyerRequestsPage />} />
          <Route path="/lawyer/earnings" element={<LawyerEarningsPage />} />
          <Route path="/lawyer/documents" element={<LawyerDocumentsPage />} />
          <Route path="/lawyer/profile" element={<LawyerProfilePage />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
          <Route path="/admin/lawyers" element={<AdminLawyersPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/appointments" element={<AdminDashboardPage />} />
          <Route path="/admin/consultations" element={<AdminDashboardPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Routes>
      </div>
      {!hideNavbarFooter && <Footer />}
    </>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 10,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
