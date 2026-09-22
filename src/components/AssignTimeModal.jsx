import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle } from 'lucide-react';

const AssignTimeModal = ({ isOpen, onClose, consultation, onAssignSuccess }) => {
  const [assignedDate, setAssignedDate] = useState('');
  const [assignedTime, setAssignedTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !consultation) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assignedDate || !assignedTime) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onAssignSuccess) {
        onAssignSuccess(consultation.id, assignedDate, assignedTime);
      }
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 font-['Outfit',sans-serif]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Calendar size={16} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Accept & Assign Appointment Time</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-4 space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Customer:</span>
            <span className="font-bold text-slate-900">{consultation.customerName || consultation.fullName || 'Client'}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Matter Category:</span>
            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {consultation.categoryDisplayName || consultation.category || 'General Legal Matter'}
            </span>
          </div>
          {(consultation.caseSummary || consultation.summary || consultation.requestMessage) && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-700 text-xs leading-relaxed max-h-40 overflow-y-auto">
              <div className="font-bold text-indigo-700 mb-1 flex items-center gap-1">
                <span>📌 Shared AI Case Brief:</span>
              </div>
              <p className="whitespace-pre-line text-slate-600 font-normal">
                {consultation.caseSummary || consultation.summary || consultation.requestMessage}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Meeting Date <span className="text-rose-500">*</span>
            </label>
            <input 
              type="date" 
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium transition-all"
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Meeting Time <span className="text-rose-500">*</span>
            </label>
            <input 
              type="time" 
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium transition-all"
              value={assignedTime}
              onChange={(e) => setAssignedTime(e.target.value)}
              required 
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button 
              type="button" 
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-sm shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer" 
              disabled={loading}
            >
              {loading ? 'Assigning...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTimeModal;
