import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { lawyerApi } from '../../api/lawyerApi';
import { User, ShieldCheck, RefreshCw, Scale } from 'lucide-react';

const AdminLawyersPage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLawyers = useCallback(() => {
    setLoading(true);
    lawyerApi.getApprovedLawyers()
      .then(res => {
        if (res && res.data && Array.isArray(res.data)) {
          setLawyers(res.data);
        } else {
          setLawyers([]);
        }
      })
      .catch(() => setLawyers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="admin" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <AdminHeader 
          title="Lawyer Directory Management"
          subtitle="Complete registry of verified advocates across India."
          badge={{
            text: `${lawyers.length} Verified Advocates`,
            variant: 'emerald',
            icon: ShieldCheck
          }}
          actions={
            <button
              type="button"
              onClick={fetchLawyers}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh directory"
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
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                  <Scale size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Verified Advocate Roster
                  </h3>
                  <p className="text-xs text-slate-400">
                    Directory of advocates with active status on the Adalat platform
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                {lawyers.length} Registered
              </span>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="py-12">
                  <LoadingState message="Fetching registered advocates directory..." />
                </div>
              ) : lawyers.length === 0 ? (
                <div className="py-8">
                  <EmptyState 
                    icon={User}
                    title="No Advocates Listed"
                    message="No verified advocates are currently listed in the system directory."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/80 font-bold">
                        <th className="py-3.5 px-5">Lawyer Name</th>
                        <th className="py-3.5 px-5">Bar Reg No</th>
                        <th className="py-3.5 px-5">Location</th>
                        <th className="py-3.5 px-5">Rate</th>
                        <th className="py-3.5 px-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lawyers.map(lawyer => (
                        <tr key={lawyer.lawyerId} className="hover:bg-slate-50/70 transition-colors duration-150">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-900 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                                {lawyer.fullName ? lawyer.fullName.charAt(0).toUpperCase() : 'L'}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate">
                                  {lawyer.fullName}
                                </span>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  {lawyer.email} • {lawyer.mobileNumber}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-mono text-slate-800 font-bold">
                            <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200/60">
                              {lawyer.barEnrollmentNumber || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-700 font-medium">
                            {lawyer.location || 'N/A'}
                          </td>
                          <td className="py-4 px-5 font-bold font-mono text-slate-800">
                            {lawyer.consultationRate ? lawyer.consultationRate.replace('RATE_', '₹') : '₹99'}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <StatusBadge status={lawyer.verificationStatus || 'APPROVED'} />
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

export default AdminLawyersPage;

