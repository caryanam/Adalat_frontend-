import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import SessionExpiredModal from './components/SessionExpiredModal';
import CustomerRouteGuard from './components/CustomerRouteGuard';

// Public pages (Lazy loaded)
const HomePage = lazy(() => import('./pages/public/HomePage'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage'));
const FindLawyerPage = lazy(() => import('./pages/public/FindLawyerPage'));
const LegalCategoriesPage = lazy(() => import('./pages/public/LegalCategoriesPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const TermsPage = lazy(() => import('./pages/public/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage'));
const RefundPolicyPage = lazy(() => import('./pages/public/RefundPolicyPage'));

// Auth pages (Lazy loaded)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const CustomerRegisterPage = lazy(() => import('./pages/auth/CustomerRegisterPage'));
const LawyerSignupPage = lazy(() => import('./pages/auth/LawyerSignupPage'));
const LawyerRegisterWizardPage = lazy(() => import('./pages/auth/LawyerRegisterWizardPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));

// Customer pages (Lazy loaded)
const CustomerDashboardPage = lazy(() => import('./pages/customer/CustomerDashboardPage'));
const LegalAssistantPage = lazy(() => import('./pages/customer/LegalAssistantPage'));
const CustomerConsultationPage = lazy(() => import('./pages/customer/CustomerConsultationPage'));
const CustomerAppointmentsPage = lazy(() => import('./pages/customer/CustomerAppointmentsPage'));
const CustomerPaymentsPage = lazy(() => import('./pages/customer/CustomerPaymentsPage'));
const CustomerProfilePage = lazy(() => import('./pages/customer/CustomerProfilePage'));
const CustomerFindLawyersPage = lazy(() => import('./pages/customer/CustomerFindLawyersPage'));

// Lawyer pages (Lazy loaded)
const LawyerDashboardPage = lazy(() => import('./pages/lawyer/LawyerDashboardPage'));
const LawyerRequestsPage = lazy(() => import('./pages/lawyer/LawyerRequestsPage'));
const LawyerConsultationsPage = lazy(() => import('./pages/lawyer/LawyerConsultationsPage'));
const LawyerEarningsPage = lazy(() => import('./pages/lawyer/LawyerEarningsPage'));
const LawyerDocumentsPage = lazy(() => import('./pages/lawyer/LawyerDocumentsPage'));
const LawyerProfilePage = lazy(() => import('./pages/lawyer/LawyerProfilePage'));

// Admin pages (Lazy loaded)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminVerificationsPage = lazy(() => import('./pages/admin/AdminVerificationsPage'));
const AdminLawyersPage = lazy(() => import('./pages/admin/AdminLawyersPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] w-full">
    <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
  </div>
);

const AppLayout = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/customer/') || 
                           location.pathname.startsWith('/lawyer/') || 
                           location.pathname.startsWith('/admin/');

  const isRegisterRoute = location.pathname === '/register' || 
                           location.pathname === '/lawyer/register' ||
                           location.pathname.startsWith('/register') ||
                           location.pathname === '/verify-email' ||
                           location.pathname === '/login' ||
                           location.pathname === '/forgot-password';

  const hideNavbarFooter = isDashboardRoute || isRegisterRoute;

  return (
    <>
      <ScrollToTop />
      <SessionExpiredModal />
      {!hideNavbarFooter && <Navbar />}
      <div className="page-wrapper" style={{ transition: 'opacity 0.3s ease-in-out' }}>
        <Suspense fallback={<PageLoader />}>
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
          <Route path="/forgot-password" element={<LoginPage />} />
          <Route path="/register" element={<CustomerRegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/lawyer/register" element={<LawyerSignupPage />} />
          <Route path="/lawyer/onboarding" element={<LawyerRegisterWizardPage />} />
          <Route path="/lawyer/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Customer */}
          <Route path="/customer/dashboard" element={<CustomerRouteGuard><CustomerDashboardPage /></CustomerRouteGuard>} />
          <Route path="/customer/legal-assistant" element={<CustomerRouteGuard><LegalAssistantPage /></CustomerRouteGuard>} />
          <Route path="/customer/find-lawyers" element={<CustomerRouteGuard><CustomerFindLawyersPage /></CustomerRouteGuard>} />
          <Route path="/customer/appointments" element={<CustomerRouteGuard><CustomerAppointmentsPage /></CustomerRouteGuard>} />
          <Route path="/customer/consultations" element={<CustomerRouteGuard><CustomerConsultationPage /></CustomerRouteGuard>} />
          <Route path="/customer/payments" element={<CustomerRouteGuard><CustomerPaymentsPage /></CustomerRouteGuard>} />
          <Route path="/customer/profile" element={<CustomerRouteGuard><CustomerProfilePage /></CustomerRouteGuard>} />

          {/* Lawyer */}
          <Route path="/lawyer/dashboard" element={<LawyerDashboardPage />} />
          <Route path="/lawyer/requests" element={<LawyerRequestsPage />} />
          <Route path="/lawyer/appointments" element={<LawyerConsultationsPage />} />
          <Route path="/lawyer/consultations" element={<LawyerConsultationsPage />} />
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
        </Suspense>
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
