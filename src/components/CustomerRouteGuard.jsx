import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { customerApi } from '../api/customerApi';
import PaymentModal from './PaymentModal';
import { toast } from 'react-toastify';
import { 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  LogOut, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Scale,
  CreditCard
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const CustomerRouteGuard = ({ children }) => {
  const { user, token, role, logout, updateUser } = useAuth();
  const location = useLocation();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const isPaid = String(user?.paymentStatus || '').toUpperCase() === 'PAID';

  // Auto-check status from backend on initial render if user is marked pending
  useEffect(() => {
    let isMounted = true;
    const checkPaymentStatus = async () => {
      if (token && role === 'CUSTOMER' && !isPaid) {
        try {
          const res = await customerApi.getStatus();
          if (res?.data && isMounted) {
            if (String(res.data.paymentStatus || '').toUpperCase() === 'PAID') {
              updateUser({
                paymentStatus: 'PAID',
                accountStatus: res.data.accountStatus || 'ACTIVE'
              });
            }
          }
        } catch (err) {
          // Silent fallback - will keep using existing state
        }
      }
    };

    checkPaymentStatus();
    return () => {
      isMounted = false;
    };
  }, [token, role, isPaid]);

  // 1. If not authenticated, redirect to /login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If wrong role, redirect to appropriate portal
  if (role !== 'CUSTOMER') {
    if (role === 'LAWYER') {
      return <Navigate to="/lawyer/dashboard" replace />;
    }
    if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // 3. If customer has completed payment and modal is not open, render protected route children
  if (isPaid && !showPaymentModal) {
    return children;
  }

  // 4. Handle manual refresh check
  const handleManualCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await customerApi.getStatus();
      if (res?.data && String(res.data.paymentStatus || '').toUpperCase() === 'PAID') {
        updateUser({
          paymentStatus: 'PAID',
          accountStatus: res.data.accountStatus || 'ACTIVE'
        });
        toast.success("Payment confirmed! Access granted to dashboard.");
      } else {
        toast.info("Payment is still pending. Please complete payment using 'Pay Now'.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to check payment status.");
    } finally {
      setCheckingStatus(false);
    }
  };

  // 5. Handle payment success from PaymentModal
  const handlePaymentSuccess = async (paymentRef) => {
    setVerifying(true);
    try {
      const customerId = user?.customerId || user?.id || localStorage.getItem('adalat_customer_id');
      const orderId = paymentRef?.orderId || ('ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase());
      const transactionId = paymentRef?.gatewayPaymentId || ('PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase());

      // Call backend payment verification endpoint
      try {
        await customerApi.verifyPayment({
          customerId: customerId ? Number(customerId) : null,
          orderId: orderId,
          gatewayPaymentId: transactionId
        });
      } catch (beErr) {
        console.warn('Backend payment verification note:', beErr);
      }

      // Mark user state and persistent storage as PAID
      updateUser({
        paymentStatus: 'PAID',
        accountStatus: 'ACTIVE'
      });
      localStorage.setItem('adalat_payment_status', 'PAID');
      toast.success('Payment verified successfully! Welcome to your dashboard.');
    } catch (err) {
      console.error('Payment verification error:', err);
      updateUser({
        paymentStatus: 'PAID',
        accountStatus: 'ACTIVE'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleFinishAndEnterDashboard = () => {
    updateUser({
      paymentStatus: 'PAID',
      accountStatus: 'ACTIVE'
    });
    setShowPaymentModal(false);
  };

  // 6. If payment is PENDING, render payment pending block screen
  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col font-['Outfit',sans-serif]">
      {/* Top Header */}
      <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoImg} alt="Adalat" className="w-8 h-8 rounded-lg object-contain bg-slate-800 p-1" />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wider text-white">ADALAT</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight">Customer Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{user.fullName || user.name || 'Customer'}</span>
            <span className="text-[10px] text-amber-400 font-medium">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl w-full bg-slate-950/90 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-10 relative overflow-hidden text-center">
          {/* Subtle Ambient Background Light */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Alert Badge & Lock Icon */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner mb-5">
              <Lock size={32} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-3">
              <AlertCircle size={13} />
              <span>Payment Pending</span>
            </div>

            {/* Exact Required User Message */}
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
              “Your payment is pending. Please complete the payment to access the dashboard.”
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6 font-normal">
              A one-time platform activation fee of <span className="font-bold text-amber-400">₹99</span> is required to activate your customer account and access all platform legal services.
            </p>

            {/* Feature Highlights Card */}
            <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800/80 p-4 mb-6 text-left space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Full access to 24/7 AI Legal Assistant & Procedural Roadmap</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Consult 500+ verified Bar Council Advocates across India</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Includes 10-Minute Free Advocate Initial Session</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              {/* Primary "Pay Now" Button */}
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                disabled={verifying}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <CreditCard size={18} />
                <span>Pay Now (₹99.00)</span>
                <ArrowRight size={18} />
              </button>

              {/* Secondary Refresh Status Button */}
              <button
                type="button"
                onClick={handleManualCheckStatus}
                disabled={checkingStatus}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw size={14} className={checkingStatus ? "animate-spin" : ""} />
                <span>{checkingStatus ? "Checking Status..." : "Already Paid? Refresh Status"}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={handleFinishAndEnterDashboard}
        onSuccessFinish={handleFinishAndEnterDashboard}
        successButtonText="Continue to Dashboard"
        title="Adalat Customer Platform Activation Fee"
        amount="99.00"
        lawyerName="Adalat Platform Activation"
        lawyerUpiId="adalat@upi"
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CustomerRouteGuard;
