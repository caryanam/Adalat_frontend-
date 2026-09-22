import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import apiClient from '../../api/apiClient';
import { Users, RefreshCw, CheckCircle2 } from 'lucide-react';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    apiClient.get('/api/admin/customers')
      .then(res => {
        if (res && res.data && Array.isArray(res.data)) {
          setCustomers(res.data);
        } else {
          setCustomers([]);
        }
      })
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="admin" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <AdminHeader 
          title="Customer Management"
          subtitle="Registered customer directory and activation fee statuses."
          badge={{
            text: `${customers.length} Active Clients`,
            variant: 'indigo',
            icon: Users
          }}
          actions={
            <button
              type="button"
              onClick={fetchCustomers}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh customers"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Customer Account Directory
                  </h3>
                  <p className="text-xs text-slate-400">
                    Registered users and platform activation verification
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                {customers.length} Clients
              </span>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="py-12">
                  <LoadingState message="Fetching registered customers from database..." />
                </div>
              ) : customers.length === 0 ? (
                <div className="py-8">
                  <EmptyState 
                    icon={Users}
                    title="No Registered Customers Yet"
                    message="New customers will appear here after registering and completing their ₹99 activation payment."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/80 font-bold">
                        <th className="py-3.5 px-5">Customer Name</th>
                        <th className="py-3.5 px-5">Email Address</th>
                        <th className="py-3.5 px-5">Mobile Number</th>
                        <th className="py-3.5 px-5">Activation Fee</th>
                        <th className="py-3.5 px-5 text-right">Account Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.map(c => (
                        <tr key={c.customerId || c.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-800 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                                {c.fullName ? c.fullName.charAt(0).toUpperCase() : 'C'}
                              </div>
                              <span className="font-bold text-slate-900 block truncate">
                                {c.fullName}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-medium">
                            {c.email}
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-mono">
                            {c.mobileNumber || 'N/A'}
                          </td>
                          <td className="py-4 px-5 font-medium">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold font-mono text-[11px]">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span>₹99.00 ({c.paymentStatus || 'PAID'})</span>
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <StatusBadge status={c.accountStatus || 'ACTIVE'} />
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

export default AdminCustomersPage;

