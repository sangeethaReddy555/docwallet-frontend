// Reusable confirm dialog — used for delete actions (replaces window.confirm/alert).
import Modal from "./Modal.jsx";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Delete",
  confirmVariant = "danger" // "danger" | "warning" | "primary"
}) {
  // Button variants
  const getConfirmButtonClass = () => {
    switch (confirmVariant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30";
      case "warning":
        return "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30";
      case "primary":
      default:
        return "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30";
    }
  };

  // Icon based on variant
  const getIcon = () => {
    switch (confirmVariant) {
      case "danger":
        return <AlertTriangle className="w-6 h-6 text-rose-400" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      case "primary":
      default:
        return <AlertTriangle className="w-6 h-6 text-indigo-400" />;
    }
  };

  const getIconBg = () => {
    switch (confirmVariant) {
      case "danger":
        return "bg-rose-500/10 border-rose-400/20";
      case "warning":
        return "bg-amber-500/10 border-amber-400/20";
      case "primary":
      default:
        return "bg-indigo-500/10 border-indigo-400/20";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        {/* Icon */}
        <div className={`flex items-center justify-center w-14 h-14 rounded-xl border ${getIconBg()} mb-5 mx-auto`}>
          {getIcon()}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white text-center mb-2 tracking-tight">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-400 text-center leading-relaxed mb-6 max-w-sm mx-auto">
          {message}
        </p>

        {/* Buttons - Only these two, no duplicate close button */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/[0.04] text-slate-300 text-sm font-semibold border border-white/[0.06] hover:bg-white/[0.08] hover:text-white transition-all duration-200 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 order-1 sm:order-2 ${getConfirmButtonClass()}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}