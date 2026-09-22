import React from 'react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import { TrendingUp, Users, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';

const AdminReportsPage = () => {
  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="admin" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <AdminHeader 
          title="Analytics & Financial Reports"
          subtitle="Platform volume metrics, practice area demand, and growth analytics."
          badge={{
            text: "Telemetry Active",
            variant: "purple",
            icon: Sparkles
          }}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Customers</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">0</h3>
                <span className="text-[11px] font-semibold text-indigo-600">Registered</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                <Users size={22} />
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified Advocates</p>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-600 font-mono mt-1">0</h3>
                <span className="text-[11px] font-semibold text-amber-700">Enrolled Roster</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <ShieldCheck size={22} />
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Volume</p>
                <h3 className="text-2xl sm:text-3xl font-black text-teal-700 font-mono mt-1">₹0.00</h3>
                <span className="text-[11px] font-semibold text-teal-600">Settlements</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-2xs">
                <CreditCard size={22} />
              </div>
            </div>
          </div>

          {/* Processing Banner */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-4 shadow-xs">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Analytics Engine Active</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Historical growth trends and practice area legal demand analytics will generate automatically as consultation sessions increase.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReportsPage;

