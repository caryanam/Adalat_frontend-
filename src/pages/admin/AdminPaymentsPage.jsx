import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import apiClient from '../../api/apiClient';
import { CreditCard, DollarSign, UserCheck, ShieldCheck, RefreshCw } from 'lucide-react';

const AdminPaymentsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'REGISTRATION', 'CONSULTATION'

  const fetchRealTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/admin/payments');
      if (res && res.data && Array.isArray(res.data)) {
        setTransactions(res.data);
      } else {
        setTransactions([]);
      }
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealTransactions();
  }, [fetchRealTransactions]);

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter === 'REGISTRATION') return tx.type === 'CUSTOMER_REGISTRATION';
    if (activeFilter === 'CONSULTATION') return tx.type === 'LAWYER_CONSULTATION';
    return true;
  });

  // Calculate real totals
  const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amountNum || 0), 0);
  const regRevenue = transactions
    .filter(tx => tx.type === 'CUSTOMER_REGISTRATION')
    .reduce((sum, tx) => sum + (tx.amountNum || 99), 0);
  const lawyerPayouts = transactions
    .filter(tx => tx.type === 'LAWYER_CONSULTATION')
    .reduce((sum, tx) => sum + (tx.amountNum || 0), 0);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="admin" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <AdminHeader 
          title="Payment Transaction Audit"
          subtitle="Real-time financial audit log of customer activations and advocate settlements."
          badge={{
            text: `₹${totalVolume.toFixed(2)} Audited`,
            variant: "emerald",
            icon: CreditCard
          }}
          actions={
            <button
              type="button"
              onClick={fetchRealTransactions}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh transactions"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Financial Metrics Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Audited Volume</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">₹{totalVolume.toFixed(2)}</h3>
                <span className="text-[11px] font-semibold text-indigo-600">Platform Gross</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                <DollarSign size={22} />
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Registrations</p>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-600 font-mono mt-1">₹{regRevenue.toFixed(2)}</h3>
                <span className="text-[11px] font-semibold text-amber-700">₹99 Platform Pool</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <ShieldCheck size={22} />
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Advocate Direct Payouts</p>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono mt-1">₹{lawyerPayouts.toFixed(2)}</h3>
                <span className="text-[11px] font-semibold text-emerald-700">Consultation Settlements</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
                <UserCheck size={22} />
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Audited Records</p>
                <h3 className="text-2xl sm:text-3xl font-black text-purple-700 font-mono mt-1">{transactions.length}</h3>
                <span className="text-[11px] font-semibold text-purple-600">Database Transactions</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
                <CreditCard size={22} />
              </div>
            </div>
          </div>

          {/* Section Card with Filter Tabs */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Financial Audit Records
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time transaction log verified across platform accounts
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
                <button 
                  type="button"
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({transactions.length})
                </button>

                <button 
                  type="button"
                  onClick={() => setActiveFilter('REGISTRATION')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'REGISTRATION' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Registration ({transactions.filter(t => t.type === 'CUSTOMER_REGISTRATION').length})
                </button>

                <button 
                  type="button"
                  onClick={() => setActiveFilter('CONSULTATION')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'CONSULTATION' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Consultation ({transactions.filter(t => t.type === 'LAWYER_CONSULTATION').length})
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="py-12">
                  <LoadingState message="Fetching payment audit records from database..." />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-8">
                  <EmptyState 
                    icon={CreditCard}
                    title="No Transactions Found"
                    message="Customer registration payments and advocate consultation transactions will appear here automatically."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
                  <table className="w-full text-left text-xs min-w-[880px]">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/80 font-bold">
                        <th className="py-3.5 px-5">Transaction ID</th>
                        <th className="py-3.5 px-5">Customer</th>
                        <th className="py-3.5 px-5">Receiver</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Category</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Amount</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Method</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Date</th>
                        <th className="py-3.5 px-5 text-right whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                          <td className="py-4 px-5 font-mono text-slate-700 font-bold text-[11px] whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60">
                              {tx.id}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-bold text-slate-900 block truncate">
                              {tx.customer}
                            </span>
                            {tx.customerEmail && (
                              <span className="text-[11px] text-slate-400 block truncate">
                                {tx.customerEmail}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-bold text-slate-900 block truncate">
                              {tx.lawyer}
                            </span>
                            {tx.payoutReceiver && tx.payoutReceiver !== tx.lawyer && (
                              <span className="text-[11px] text-emerald-600 font-bold font-mono block truncate">
                                UPI: {tx.payoutReceiver}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border shadow-2xs ${
                              tx.type === 'CUSTOMER_REGISTRATION'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                                : 'bg-amber-50 text-amber-800 border-amber-200/80'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                tx.type === 'CUSTOMER_REGISTRATION' ? 'bg-indigo-500' : 'bg-amber-500'
                              }`} />
                              {tx.type === 'CUSTOMER_REGISTRATION' ? (
                                <ShieldCheck size={12} className="text-indigo-600 shrink-0" />
                              ) : (
                                <UserCheck size={12} className="text-amber-600 shrink-0" />
                              )}
                              <span className="whitespace-nowrap">
                                {tx.typeLabel || (tx.type === 'CUSTOMER_REGISTRATION' ? 'Customer Reg Fee' : 'Advocate Consultation')}
                              </span>
                            </span>
                          </td>
                          <td className="py-4 px-5 font-mono font-black text-emerald-700 text-sm whitespace-nowrap">
                            {tx.amountNum !== undefined && tx.amountNum !== null
                              ? `₹${Number(tx.amountNum).toFixed(2)}`
                              : (typeof tx.amount === 'string' && tx.amount.includes('₹')
                                  ? tx.amount
                                  : `₹${tx.amount?.toString().replace(/[^\d.]/g, '') || '0.00'}`)}
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-medium">
                            {tx.method || 'UPI (Instant)'}
                          </td>
                          <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <StatusBadge status={tx.status || 'COMPLETED'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPaymentsPage;

