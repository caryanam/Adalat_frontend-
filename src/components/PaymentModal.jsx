import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  Lock, 
  Sparkles, 
  RefreshCw,
  CreditCard,
  QrCode
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import './PaymentModal.css';

// Brand SVGs for UPI Apps
const GPayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rounded-full shadow-2xs">
    <rect width="24" height="24" rx="12" fill="#FFFFFF" />
    <path d="M12.2 10.5v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9c1.5 0 2.6.6 3.2 1.2l2.5-2.4C16.3 4.7 14.5 4 12.2 4 7.7 4 4 7.7 4 12.2s3.7 8.2 8.2 8.2c4.7 0 7.8-3.3 7.8-7.9 0-.5-.1-1-.1-1.5h-7.7z" fill="#4285F4"/>
  </svg>
);

const PhonePeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rounded-full shadow-2xs">
    <rect width="24" height="24" rx="12" fill="#5F259F" />
    <text x="12" y="16.5" fontSize="13" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="'Outfit', sans-serif">पे</text>
  </svg>
);

const PaytmIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rounded-full shadow-2xs">
    <rect width="24" height="24" rx="12" fill="#00BAF2" />
    <text x="12" y="15" fontSize="7" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="'Outfit', sans-serif">paytm</text>
  </svg>
);

const BhimIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rounded-full shadow-2xs">
    <rect width="24" height="24" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
    <path d="M8 16L12 8H10L6 16H8Z" fill="#FF9900"/>
    <path d="M14 16L18 8H16L12 16H14Z" fill="#00A859"/>
  </svg>
);

const CredIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rounded-full shadow-2xs">
    <rect width="24" height="24" rx="12" fill="#18181B" />
    <path d="M12 6.5L16.5 8.8V12.8C16.5 15.8 14.2 18 12 19C9.8 18 7.5 15.8 7.5 12.8V8.8L12 6.5Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
  </svg>
);

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  title = "Consultation Extension Fee", 
  amount = "99.00", 
  lawyerName = "Adalat Platform Activation", 
  lawyerUpiId = "adalat@upi", 
  onPaymentSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('QR'); // 'QR' or 'SUCCESS'
  const [qrSrcIndex, setQrSrcIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [confirmedPaymentRef, setConfirmedPaymentRef] = useState(null);

  const effectiveUpiId = (lawyerUpiId && typeof lawyerUpiId === 'string' && lawyerUpiId.trim()) 
    ? lawyerUpiId.trim() 
    : 'advocate@upi';
  const effectiveLawyerName = (lawyerName && typeof lawyerName === 'string' && lawyerName.trim()) 
    ? lawyerName.trim() 
    : 'Advocate';

  const baseNum = parseFloat(amount) || 99.00;
  const gstNum = Math.round((baseNum * 0.18) * 100) / 100;
  const totalNum = Math.round((baseNum + gstNum) * 100) / 100;

  const upiPayload = `upi://pay?pa=${effectiveUpiId}&pn=${encodeURIComponent(effectiveLawyerName)}&am=${totalNum.toFixed(2)}&cu=INR&tn=${encodeURIComponent(title || 'Legal Consultation')}`;
  
  const qrSources = [
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiPayload)}&margin=4`,
    `https://quickchart.io/qr?size=240&text=${encodeURIComponent(upiPayload)}&margin=1`,
    `https://chart.googleapis.com/chart?chs=240x240&cht=qr&chl=${encodeURIComponent(upiPayload)}`
  ];

  useEffect(() => {
    if (isOpen) {
      setStep('QR');
      setLoading(false);
      setQrSrcIndex(0);
      setCopied(false);
      setConfirmedPaymentRef(null);
    }
  }, [isOpen, lawyerUpiId, amount]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(effectiveUpiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    const paymentRef = {
      gatewayPaymentId: 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      amount: totalNum.toFixed(2),
      baseAmount: baseNum.toFixed(2),
      gstAmount: gstNum.toFixed(2),
      lawyerName: effectiveLawyerName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConfirmedPaymentRef(paymentRef);

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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-['Outfit',sans-serif]">
      
      {/* Modal Container Card */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 overflow-hidden relative animate-in zoom-in-95 duration-200 my-auto text-slate-800">
        
        {/* Close Button Top Right */}
        <button 
          onClick={onClose} 
          disabled={loading}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          title="Close dialog"
        >
          <X size={16} />
        </button>

        {step === 'QR' ? (
          <div className="flex flex-col md:flex-row min-h-[460px]">
            
            {/* Left Column: Order Summary & Amount Breakdown */}
            <div className="md:w-5/12 bg-slate-50/90 p-5 sm:p-6 border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col justify-between">
              <div>
                {/* Brand Logo & Security Header */}
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src={logoImg} 
                    alt="Adalat" 
                    className="w-7 h-7 object-contain" 
                    style={{ width: '28px', height: '28px', minWidth: '28px', minHeight: '28px' }}
                  />
                  <span className="font-extrabold text-slate-900 tracking-tight text-sm font-['Outfit',sans-serif]">
                    ADALAT
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ml-auto">
                    <ShieldCheck size={11} className="text-emerald-600 shrink-0" />
                    Verified
                  </span>
                </div>

                {/* Consultation Title */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Direct client-advocate settlement for consultation room extension.
                </p>

                {/* Beneficiary Card */}
                <div className="mt-4 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Beneficiary Advocate:
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                      {effectiveLawyerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                        <span className="truncate">{effectiveLawyerName}</span>
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block font-medium">
                        Direct P2P Escrow
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown Card */}
                <div className="mt-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Base Fee</span>
                    <span className="font-semibold text-slate-800 font-mono">₹{baseNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>GST (18% Statutory)</span>
                    <span className="font-semibold text-amber-600 font-mono">+ ₹{gstNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Platform Fee</span>
                    <span className="text-[11px] font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-800">Total Payable:</span>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-emerald-600 tracking-tight font-mono">
                        ₹{totalNum.toFixed(2)}
                      </span>
                      <span className="block text-[9px] text-slate-400 font-medium">Inclusive of all taxes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Tagline */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <Lock size={12} className="text-slate-400 shrink-0" />
                <span>Instant confirmation via UPI verification callback</span>
              </div>
            </div>

            {/* Right Column: Scan QR & Payment Action */}
            <div className="md:w-7/12 p-5 sm:p-6 flex flex-col justify-between items-center text-center bg-white">
              
              <div className="w-full flex flex-col items-center">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold mb-2 shadow-2xs">
                  <QrCode size={12} className="text-indigo-600" />
                  <span>Scan with any UPI App</span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Instant QR Settlement
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Scan the QR code below using your mobile payment application
                </p>

                {/* QR Code Presentation Frame with Scanner Corners */}
                <div className="relative mt-3 p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-md group transition-all duration-200">
                  
                  {/* Decorative Scan Corner Guides */}
                  <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-600 rounded-tl-md" />
                  <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-600 rounded-tr-md" />
                  <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-600 rounded-bl-md" />
                  <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-600 rounded-br-md" />

                  {/* QR Image */}
                  <img 
                    src={qrSources[qrSrcIndex] || qrSources[0]}
                    alt="UPI Payment QR Code"
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg block"
                    onError={() => {
                      if (qrSrcIndex < qrSources.length - 1) {
                        setQrSrcIndex(prev => prev + 1);
                      }
                    }}
                  />

                  {/* Centered UPI Emblem */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-slate-200/90 shadow-md flex items-center justify-center pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M7 17L12 7H9.5L4.5 17H7Z" fill="#FF9900"/>
                      <path d="M14 17L19.5 7H17L12 17H14Z" fill="#00A859"/>
                    </svg>
                  </div>
                </div>

                {/* Copy UPI ID Pill */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs max-w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400">UPI ID:</span>
                  <span className="font-mono font-semibold text-slate-800 truncate max-w-[160px] sm:max-w-[200px]">
                    {effectiveUpiId}
                  </span>
                  <button 
                    type="button" 
                    onClick={handleCopyUpi} 
                    className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer ml-0.5 flex items-center gap-1 text-[11px] font-semibold"
                    title="Copy UPI address"
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span className={copied ? "text-emerald-600" : ""}>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Supported Apps Row */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div title="Google Pay" className="hover:scale-110 transition-transform cursor-pointer">
                    <GPayIcon />
                  </div>
                  <div title="PhonePe" className="hover:scale-110 transition-transform cursor-pointer">
                    <PhonePeIcon />
                  </div>
                  <div title="Paytm" className="hover:scale-110 transition-transform cursor-pointer">
                    <PaytmIcon />
                  </div>
                  <div title="BHIM UPI" className="hover:scale-110 transition-transform cursor-pointer">
                    <BhimIcon />
                  </div>
                  <div title="CRED" className="hover:scale-110 transition-transform cursor-pointer">
                    <CredIcon />
                  </div>
                </div>
              </div>

              {/* Payment Confirmation Action */}
              <div className="w-full mt-4 space-y-2">
                <button 
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin text-white" />
                      <span>Verifying Settlement with Bank...</span>
                    </>
                  ) : (
                    <>
                      <span>I Have Completed Payment</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                  <span>256-Bit SSL Encrypted • NPCI Verified UPI Channel</span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Step 2: Payment Confirmed Success Screen */
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center">
            
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 border-4 border-emerald-50 shadow-inner animate-in zoom-in-75 duration-200">
              <CheckCircle2 size={46} className="text-emerald-600" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Payment Confirmed!
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
              Your consultation session with <strong>{effectiveLawyerName}</strong> has been successfully unlocked and verified.
            </p>

            {/* Receipt Summary Box */}
            <div className="w-full max-w-sm mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Amount Paid:</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">₹{totalNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Beneficiary:</span>
                <span className="font-semibold text-slate-800">{effectiveLawyerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Payment ID:</span>
                <span className="font-mono text-slate-700 font-medium text-[11px]">
                  {confirmedPaymentRef?.gatewayPaymentId || 'PAY-SUCCESS'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check size={11} /> Completed
                </span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleFinishSuccess} 
              className="mt-6 w-full max-w-sm py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Consultation Room</span>
              <ArrowRight size={15} />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentModal;
