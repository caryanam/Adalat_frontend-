import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.png';
import './PaymentModal.css';

// Brand Icons for UPI Apps
const GPayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#1A73E8" />
    <path d="M12.2 10.5v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9c1.5 0 2.6.6 3.2 1.2l2.5-2.4C16.3 4.7 14.5 4 12.2 4 7.7 4 4 7.7 4 12.2s3.7 8.2 8.2 8.2c4.7 0 7.8-3.3 7.8-7.9 0-.5-.1-1-.1-1.5h-7.7z" fill="#FFFFFF"/>
  </svg>
);

const PhonePeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#5F259F" />
    <path d="M15.5 8.5H12V6.5c0-.6-.4-1-1-1H9.5c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-4h2c2.5 0 4-1.5 4-4s-1.5-3-4-3zm-.5 4.5h-2.5V10.5H15c1 0 1.5.5 1.5 1.25s-.5 1.25-1.5 1.25z" fill="#FFFFFF"/>
  </svg>
);

const PaytmIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#00BAF2" />
    <path d="M6 8h2.5v8H6V8zm3.5 3.5h2v4.5h-2v-4.5zm0-3.5h2v2h-2V8zm4.5 0h4v2h-2v6h-2V8zm4 0h2v8h-2V8z" fill="#FFFFFF"/>
  </svg>
);

const BhimIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#FF9900" />
    <path d="M6 6h4c1.7 0 3 1.3 3 3 0 1-.5 1.8-1.2 2.3C12.6 11.8 13.5 12.8 13.5 14c0 1.7-1.3 3-3 3H6V6zm3 4.5h1c.6 0 1-.4 1-1s-.4-1-1-1H9v2zm0 4.5h1.2c.6 0 1.1-.5 1.1-1.1 0-.6-.5-1.1-1.1-1.1H9V15z" fill="#FFFFFF"/>
    <path d="M15 17l3-10h-2l-3 10h2z" fill="#00A859"/>
  </svg>
);

const CredIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#121212" />
    <path d="M7 6h10v12H7V6zm2 2v8h6V8H9zm2 2h2v4h-2v-4z" fill="#FFFFFF"/>
  </svg>
);

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  title = "Adalat Customer Activation Fee", 
  amount = "99.00", 
  lawyerName = "Adalat Platform Activation", 
  lawyerUpiId = "adalat@upi", 
  onPaymentSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('QR'); // 'QR' or 'SUCCESS'
  const [qrSrcIndex, setQrSrcIndex] = useState(0);

  const effectiveUpiId = (lawyerUpiId && typeof lawyerUpiId === 'string' && lawyerUpiId.trim()) 
    ? lawyerUpiId.trim() 
    : 'advocate@upi';
  const effectiveLawyerName = (lawyerName && typeof lawyerName === 'string' && lawyerName.trim()) 
    ? lawyerName.trim() 
    : 'Advocate';

  const baseNum = parseFloat(amount) || 99.00;
  const gstNum = Math.round((baseNum * 0.18) * 100) / 100;
  const totalNum = Math.round((baseNum + gstNum) * 100) / 100;

  const upiPayload = `upi://pay?pa=${effectiveUpiId}&pn=${encodeURIComponent(effectiveLawyerName)}&am=${totalNum.toFixed(2)}&cu=INR&tn=Consultation%20Fee`;
  const qrSources = [
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPayload)}`,
    `https://quickchart.io/qr?size=220&text=${encodeURIComponent(upiPayload)}`,
    `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(upiPayload)}`
  ];

  React.useEffect(() => {
    if (isOpen) {
      setStep('QR');
      setLoading(false);
      setQrSrcIndex(0);
    }
  }, [isOpen, lawyerUpiId, amount]);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setLoading(true);
    const paymentRef = {
      gatewayPaymentId: 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      amount: totalNum.toFixed(2),
      baseAmount: baseNum.toFixed(2),
      gstAmount: gstNum.toFixed(2),
      lawyerName: effectiveLawyerName
    };

    if (onPaymentSuccess) {
      try {
        await onPaymentSuccess(paymentRef);
      } catch (e) {
        console.error('Payment confirmation error:', e);
      }
    }

    setLoading(false);
    setStep('SUCCESS');
  };

  const handleFinishSuccess = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-card">
        {/* Close Button Top Right */}
        <button onClick={onClose} className="payment-modal-close-btn" title="Close">
          <X size={18} />
        </button>

        {step === 'QR' ? (
          <div className="payment-modal-split-body">
            {/* Left Sidebar */}
            <div className="payment-left-sidebar">
              <div className="payment-brand-header">
                <img src={logoImg} alt="Adalat Logo" className="payment-brand-logo" />
                <span className="payment-brand-title">ADALAT</span>
              </div>

              <h4 className="payment-modal-title">{title}</h4>

              <div className="payment-amount-card">
                <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Base Fee:</span>
                  <span style={{ fontWeight: 600, color: '#1C1C4A' }}>₹{baseNum.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>18% GST:</span>
                  <span style={{ fontWeight: 600, color: '#D97706' }}>+ ₹{gstNum.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="amount-payable-label" style={{ margin: 0 }}>Total Amount:</span>
                  <h2 className="amount-payable-value" style={{ margin: 0, color: '#10B981' }}>₹{totalNum.toFixed(2)}</h2>
                </div>
                <p className="amount-payout-text" style={{ marginTop: '10px' }}>
                  Direct settlement to:<br />
                  <strong>{effectiveLawyerName}</strong><br />
                  <span className="upi-handle">(UPI: {effectiveUpiId})</span>
                </p>
              </div>
            </div>

            {/* Right Main Section */}
            <div className="payment-right-content">
              <h4 className="scan-title">Scan & Pay with any UPI App</h4>

              <div className="qr-and-apps-row">
                <div className="qr-box">
                  <img 
                    src={qrSources[qrSrcIndex] || qrSources[0]}
                    alt="UPI QR Code"
                    className="qr-image" 
                    onError={() => {
                      if (qrSrcIndex < qrSources.length - 1) {
                        setQrSrcIndex(prev => prev + 1);
                      }
                    }}
                  />
                  {/* Center Emblem on QR Code */}
                  <div className="qr-center-emblem">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L12 7H9.5L4.5 17H7Z" fill="#FF9900"/>
                      <path d="M14.5 17L19.5 7H17L12 17H14.5Z" fill="#00A859"/>
                    </svg>
                  </div>
                </div>

                <div className="supported-apps-box">
                  <h5>Supported UPI Apps</h5>
                  <ul className="upi-apps-list">
                    <li><span>Google Pay</span></li>
                    <li><span>PhonePe</span></li>
                    <li><span>Paytm</span></li>
                    <li><span>BHIM</span></li>
                    <li><span>Cred UPI</span></li>
                  </ul>

                  {/* Circular UPI App Icons Row */}
                  <div className="upi-circles-row">
                    <div className="circle-app-icon gpay-circle" title="Google Pay">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="12" fill="#4285F4"/>
                        <path d="M12.2 10.5v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9c1.5 0 2.6.6 3.2 1.2l2.5-2.4C16.3 4.7 14.5 4 12.2 4 7.7 4 4 7.7 4 12.2s3.7 8.2 8.2 8.2c4.7 0 7.8-3.3 7.8-7.9 0-.5-.1-1-.1-1.5h-7.7z" fill="#FFFFFF"/>
                      </svg>
                    </div>

                    <div className="circle-app-icon phonepe-circle" title="PhonePe">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="12" fill="#5F259F"/>
                        <text x="12" y="16.5" fontSize="13" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">पे</text>
                      </svg>
                    </div>

                    <div className="circle-app-icon paytm-circle" title="Paytm">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="12" fill="#00BAF2"/>
                        <text x="12" y="15" fontSize="7.5" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">paytm</text>
                      </svg>
                    </div>

                    <div className="circle-app-icon bhim-circle" title="BHIM UPI">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="12" fill="#F8FAFC" stroke="#CBD5E1"/>
                        <path d="M8 16L12 8H10L6 16H8Z" fill="#FF9900"/>
                        <path d="M14 16L18 8H16L12 16H14Z" fill="#00A859"/>
                      </svg>
                    </div>

                    <div className="circle-app-icon cred-circle" title="Cred / Shield">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="12" fill="#18181B"/>
                        <path d="M12 6.5L16.5 8.8V12.8C16.5 15.8 14.2 18 12 19C9.8 18 7.5 15.8 7.5 12.8V8.8L12 6.5Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="payment-action-bottom">
                <button 
                  onClick={handleSimulatePayment}
                  className="btn-pay-confirm"
                  disabled={loading}
                >
                  {loading ? 'Confirming UPI Payment...' : 'I Have Paid — Continue Consultation'}
                </button>
                <div className="ssl-secure-text">
                  <ShieldCheck size={14} /> 256-Bit SSL Secured Direct UPI Settlement
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="payment-modal-split-body">
            {/* Left Sidebar with Shield Graphic */}
            <div className="payment-left-sidebar success-sidebar">
              <div className="payment-brand-header">
                <img src={logoImg} alt="Adalat Logo" className="payment-brand-logo" />
                <span className="payment-brand-title">ADALAT</span>
              </div>
              <div className="success-shield-wrapper">
                <div className="shield-circle">
                  <ShieldCheck size={64} className="shield-icon" />
                </div>
              </div>
            </div>

            {/* Right Confirmation Content */}
            <div className="payment-right-content success-content">
              <div className="success-check-badge">
                <CheckCircle2 size={68} className="check-icon-green" />
              </div>
              
              <h2 className="payment-confirmed-title">Payment Confirmed!</h2>
              
              <p className="payment-confirmed-sub">
                Your consultation with
              </p>
              <h4 className="payment-confirmed-target">{lawyerName}</h4>
              <p className="payment-confirmed-sub">
                has been successfully unlocked.
              </p>

              <button 
                onClick={handleFinishSuccess} 
                className="btn-go-dashboard"
              >
                Go to Dashboard <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
