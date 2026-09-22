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
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 overflow-x-hidden font-['Outfit',sans-serif]">
      <Sidebar portalType="customer" />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen relative">
        <CustomerHeader 
          title="Payment History"
          subtitle="Audit log of account activation fees & extended advocate consultation payments."
          badge={{ text: "Verified Invoices", variant: "indigo" }}
        />

        <div className="p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          <div className="section-card card">
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
