import React, { useState, useEffect } from 'react';
import { X, AlertCircle, XCircle, Send, Clock, ShieldAlert } from 'lucide-react';

const PRESET_REASONS = [
  "I am not available for 5 days due to an emergency",
  "Schedule conflict / Fully booked for this timeframe",
  "Outside my primary legal practice specialization",
  "Unable to take on new advisory matters at this time"
];

const RejectRequestModal = ({ isOpen, onClose, consultation, onRejectSuccess }) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState(PRESET_REASONS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(PRESET_REASONS[0]);
      setCustomReason(PRESET_REASONS[0]);
      setLoading(false);
    }
  }, [isOpen, consultation]);

  if (!isOpen || !consultation) return null;

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCustomReason(preset);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reasonToSend = customReason.trim() || selectedPreset;
    if (!reasonToSend) return;

    setLoading(true);
    const consultationId = consultation.id || consultation.requestId;

    try {
      if (onRejectSuccess) {
        await onRejectSuccess(consultationId, reasonToSend);
      }
      onClose();
    } catch (err) {
      console.error('Rejection submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const customerName = consultation.customerName || consultation.fullName || 'Client';
  const category = consultation.categoryDisplayName || consultation.category || 'General Legal Matter';
  const consultationId = consultation.id || consultation.requestId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 font-['Outfit',sans-serif] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <XCircle size={17} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">Decline Consultation Request</h3>
              <p className="text-[11px] text-slate-400">Notify the client with your reason</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Client & Matter Details */}
        <div className="my-3.5 space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 font-medium">Customer:</span>
            <span className="font-bold text-slate-900">{customerName}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 font-medium">Matter Category:</span>
            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {category}
            </span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 font-medium">Reference:</span>
            <span className="font-mono text-slate-600">#{consultationId}</span>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-1.5 mb-3">
          <label className="block text-xs font-semibold text-slate-700">
            Quick Reason Presets:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_REASONS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedPreset === preset
                    ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message to Client <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                setSelectedPreset('');
              }}
              placeholder="Explain why you are unable to take this request..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 font-medium transition-all resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              This message will be sent in a high-priority notification to {customerName}.
            </p>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button 
              type="button" 
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer" 
              onClick={onClose}
              disabled={loading}
            >
              Keep Request
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer" 
              disabled={loading || !customReason.trim()}
            >
              <XCircle size={14} />
              <span>{loading ? 'Declining...' : 'Decline & Notify'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectRequestModal;
