import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, ExternalLink, ShieldCheck, User } from 'lucide-react';
import { formatImageUrl } from '../utils/imageUrl';

/**
 * ImagePreviewModal
 * Displays a full-screen, responsive, rich lightbox modal for viewing advocate profile photos
 * in full resolution.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - imageUrl: string (or object containing photo url)
 * - title: string (e.g. advocate name)
 * - subtitle: string (e.g. bar registration, location)
 */
const ImagePreviewModal = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Advocate Profile Photo',
  subtitle = 'Verified Legal Professional'
}) => {
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const resolvedUrl = formatImageUrl(imageUrl);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setImageLoaded(false);
      setImageError(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, resolvedUrl]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleZoom = () => {
    setZoom((prev) => (prev === 1 ? 1.5 : 1));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-['Outfit',sans-serif]"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="relative bg-[#0d1322] border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-800/90 flex items-center justify-between bg-gradient-to-r from-[#0d1322] via-[#111827] to-[#1e1b4b] text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {resolvedUrl && !imageError && (
              <button
                type="button"
                onClick={toggleZoom}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-700/60"
                title={zoom === 1 ? 'Zoom In' : 'Reset Zoom'}
              >
                {zoom === 1 ? <ZoomIn size={16} /> : <ZoomOut size={16} />}
              </button>
            )}

            {resolvedUrl && !imageError && (
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-700/60"
                title="Open image in new tab"
              >
                <ExternalLink size={16} />
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-rose-500/20 hover:border-rose-500/30 rounded-xl transition-colors cursor-pointer border border-slate-700/60"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Center Photo Viewer */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center min-h-[280px] sm:min-h-[380px] bg-[#070b13]/60 relative select-none">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading high-resolution photo...</span>
            </div>
          )}

          {resolvedUrl && !imageError ? (
            <div
              className="transition-transform duration-200 flex items-center justify-center max-w-full max-h-[70vh]"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              <img
                src={resolvedUrl}
                alt={title}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageLoaded(true);
                  setImageError(true);
                }}
                className={`max-w-full max-h-[68vh] object-contain rounded-2xl shadow-2xl border border-slate-700/60 transition-opacity duration-200 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">
                <User size={32} />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                Profile photo not available
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                This advocate does not have a photo uploaded or the file could not be loaded from the server.
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer / Hint */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-[#090e18] flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Official Database Record
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
