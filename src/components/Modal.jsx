// Generic reusable modal. Slides down from the top of the screen on open,
// slides back up on close. Every "popup" in this app (confirm delete, edit
// name, etc.) is built on top of this one component.
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClosing(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !closing) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220); // matches slideUpFadeOut duration
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm px-4 pt-16 sm:pt-24"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-md bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-white/[0.06] p-6 sm:p-8 ${
          closing ? "animate-slideUpFadeOut" : "animate-slideDownFade"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/[0.06]">
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}