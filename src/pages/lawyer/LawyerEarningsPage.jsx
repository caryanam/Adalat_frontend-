import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import LawyerHeader from '../../components/LawyerHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { lawyerApi } from '../../api/lawyerApi';
import { CreditCard, TrendingUp, CheckCircle, RefreshCw, IndianRupee, User, ShieldCheck } from 'lucide-react';

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
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="lawyer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <LawyerHeader 
          title="Earnings & UPI Payouts"
          subtitle="Track direct customer consultation payments received to your registered UPI ID."
          badge={{ 
            text: "Direct Settlement", 
            variant: "emerald",
            icon: ShieldCheck 
          }}
          actions={
            <button 
              onClick={() => fetchEarnings(true)} 
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh payout transactions"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Payouts'}</span>
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* UPI Settlement Payout Account Info Banner */}
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-4 sm:p-5 shadow-sm flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-emerald-900 leading-tight">
                Direct UPI Instant Settlement Account
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800/90 mt-0.5 font-normal">
                Customer fees are paid directly to your registered UPI handle: <strong className="font-semibold text-emerald-950 font-mono">{earnings.lawyerUpiId || 'advocate@upi'}</strong> (Registered Name: <strong className="font-semibold text-emerald-950">{earnings.lawyerName}</strong>).
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* Metric 1: Total Earnings */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total Earnings
                </p>
                <div className="text-2xl font-bold text-teal-700 tracking-tight font-['Outfit',sans-serif]">
                  {loading ? '...' : formatRupees(earnings.totalEarningsNum, earnings.totalEarnings)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-medium pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span>Cumulative consultation fees</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-xs shrink-0">
                <IndianRupee size={22} />
              </div>
            </div>

            {/* Metric 2: Today's Earnings */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Today's Earnings
                </p>
                <div className="text-2xl font-bold text-amber-600 tracking-tight font-['Outfit',sans-serif]">
                  {loading ? '...' : formatRupees(earnings.todayEarningsNum, earnings.todayEarnings)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Settled in past 24 hours</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
                <TrendingUp size={22} />
              </div>
            </div>

            {/* Metric 3: Completed Consultations */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Completed Consultations
                </p>
                <div className="text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  {loading ? '...' : earnings.completedConsultations}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium pt-0.5">
                  <CheckCircle size={12} className="text-indigo-600" />
                  <span>Delivered sessions</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
                <CreditCard size={22} />
              </div>
            </div>
          </div>

          {/* Transaction History Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  Transaction History ({earnings.transactions.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Records of direct customer fees credited to your UPI VPA
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12">
                <RefreshCw size={24} className="animate-spin mx-auto text-indigo-600 mb-2" />
                <p className="text-center text-xs text-slate-500">Loading consultation payout transactions...</p>
              </div>
            ) : earnings.transactions.length === 0 ? (
              <div className="py-12 px-4">
                <EmptyState 
                  icon={CreditCard}
                  title="No Earnings Received Yet"
                  message="When customers book and pay for legal consultations with you, payment transaction receipts will appear in this history."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-3.5 px-5">Ref ID</th>
                      <th className="py-3.5 px-4">Customer Name</th>
                      <th className="py-3.5 px-4">Legal Category</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-5 text-right">Payout Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {earnings.transactions.map((tx, idx) => (
                      <tr key={tx.id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-slate-500 text-[11px]">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {tx.id}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex flex-col">
                            <span>{tx.customerName || 'Registered Client'}</span>
                            {tx.customerEmail && (
                              <span className="text-[11px] text-slate-400 font-normal">{tx.customerEmail}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {tx.category ? tx.category.replace(/_/g, ' ') : 'Legal Consultation'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700 text-sm">
                          {formatRupees(tx.amountNum, tx.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {tx.date}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <StatusBadge status={tx.status || 'PAID'} />
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

export default LawyerEarningsPage;
