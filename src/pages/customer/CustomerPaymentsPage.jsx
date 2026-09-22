import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import CustomerHeader from '../../components/CustomerHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { CreditCard } from 'lucide-react';

const CustomerPaymentsPage = () => {
  const [payments] = useState([
    {
      id: 'PAY-REG-99',
      service: 'Adalat Customer Account Activation',
      amount: '₹99.00',
      date: new Date().toLocaleDateString(),
      status: 'PAID'
    }
  ]);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="customer" />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc] relative">
        <CustomerHeader 
          title="Payment History"
          subtitle="Audit log of account activation fees & extended advocate consultation payments."
          badge={{ text: "Verified Invoices", variant: "indigo" }}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
          {payments.length === 0 ? (
            <EmptyState 
              icon={CreditCard}
              title="No Payment History"
              message="Your payment history will appear here."
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payment Ref</th>
                    <th>Service Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td><code>{p.id}</code></td>
                      <td><strong>{p.service}</strong></td>
                      <td><strong>{p.amount}</strong></td>
                      <td>{p.date}</td>
                      <td><StatusBadge status={p.status} /></td>
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

export default CustomerPaymentsPage;
