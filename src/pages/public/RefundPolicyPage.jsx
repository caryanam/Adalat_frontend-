import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Phone 
} from 'lucide-react';

const RefundPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const policies = [
    {
      id: 'reg-fee',
      icon: AlertCircle,
      title: '1. Registration & Verification Fee (₹99)',
      badge: 'Non-Refundable',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      content: (
        <p className="text-slate-600">
          The one-time client registration fee of <strong>₹99 (inclusive of taxes)</strong> is strictly <strong>non-refundable</strong> under all circumstances. This fee covers automated identity checks, phone OTP verification SMS gateways, and administrative maintenance to guarantee a vetted, spam-free legal ecosystem.
        </p>
      )
    },
    {
      id: 'consultation-refunds',
      icon: RotateCcw,
      title: '2. Consultation Fee Cancellation Rules',
      badge: 'Tiered Policy',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      content: (
        <div className="space-y-3">
          <p className="text-slate-600">
            Payments made for scheduled paid consultations are held securely in escrow until the consultation is successfully concluded. Cancellation rules apply as follows:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-300 text-xs">
              <div className="font-bold text-emerald-700 mb-1 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Cancelled ≥ 24 Hours Prior</span>
              </div>
              <p className="text-slate-600">
                <strong>100% Full Refund</strong> will be automatically credited back to your original payment method.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-red-300 text-xs">
              <div className="font-bold text-red-700 mb-1 flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>Cancelled &lt; 24 Hours Prior</span>
              </div>
              <p className="text-slate-600">
                <strong>Non-refundable</strong> as the advocate's exclusive calendar slot has been reserved.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'no-show',
      icon: ShieldCheck,
      title: '3. Advocate No-Show & Technical Failure Guarantee',
      badge: '100% Protected',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      content: (
        <p className="text-slate-600">
          If a confirmed advocate fails to attend the scheduled video/audio consultation or is unresponsive during the session window, or if verified platform server failures interrupt your consultation, you will receive a <strong>100% immediate full refund</strong> or a complimentary reschedule with another verified advocate of your choice.
        </p>
      )
    },
    {
      id: 'timelines',
      icon: Clock,
      title: '4. Refund Processing & Bank Timelines',
      badge: '5-7 Working Days',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      content: (
        <p className="text-slate-600">
          Once approved by our billing support desk, refunds are initiated immediately to your originating bank, UPI account, or debit/credit card. Bank processing typically takes <strong>5 to 7 business days</strong> to reflect in your account statement.
        </p>
      )
    },
    {
      id: 'dispute',
      icon: Mail,
      title: '5. Dispute Escalation & Billing Support',
      badge: '48h Window',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      content: (
        <div className="space-y-3">
          <p className="text-slate-600">
            If you encounter any discrepancy in billed charges or wish to dispute an incomplete consultation, please contact our support desk within <strong>48 hours</strong> of the scheduled session:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
            <div className="font-semibold text-slate-900">Billing & Grievance Desk — Caryanamindia Pvt Ltd</div>
            <div>Email: <a href="mailto:support@adalat.legal" className="text-indigo-600 font-medium hover:underline">support@adalat.legal</a></div>
            <div>Phone: <a href="tel:+919898989898" className="text-emerald-600 font-medium hover:underline">+91 9898989898</a></div>
            <div>Location: Pune, Maharashtra, India</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Outfit',sans-serif] selection:bg-amber-500 selection:text-slate-950">
      
      {/* Hero Header */}
      <section className="relative pt-20 pb-14 md:pt-28 md:pb-20 overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-slate-50 border-b border-slate-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-bold tracking-wider uppercase text-amber-800 shadow-xs mb-5">
            <Sparkles size={13} className="text-amber-600" />
            <span>Fair & Transparent Billing</span>
          </div>

          <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Refund & Cancellation Policy
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Clear guidelines on fee protections, cancellation timelines, and escrow-backed payments.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-14 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="space-y-6">
          {policies.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                      <Icon size={18} />
                    </div>
                    <h2 className="font-['Cinzel',serif] text-lg sm:text-xl font-bold text-slate-900">
                      {item.title}
                    </h2>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-0 sm:pl-12">
                  {item.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Home / Portal links */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <Link to="/" className="text-amber-700 hover:text-amber-800 font-bold inline-flex items-center gap-1.5">
            <span>← Return to Home</span>
          </Link>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
          </div>
        </div>

      </section>

    </div>
  );
};

export default RefundPolicyPage;
