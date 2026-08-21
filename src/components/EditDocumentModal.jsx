// Reusable rename dialog for a document.
import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import { validateRenameForm } from "../utils/validators.js";
import { FileText, Save, X, AlertCircle } from "lucide-react";

export default function EditDocumentModal({ isOpen, onClose, onSave, initialName }) {
  const [name, setName] = useState(initialName || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName || "");
      setError("");
    }
  }, [isOpen, initialName]);

  const handleSave = async () => {
    const validationError = validateRenameForm(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      await onSave(name.trim());
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !saving) {
      handleSave();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Document">
      <div className="space-y-5">
        {/* Icon and description */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-400/20">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-slate-300">Enter a new name for your document</p>
            <p className="text-xs text-slate-500 mt-0.5">The file extension will be preserved</p>
          </div>
        </div>

        {/* Input field */}
        <div>
          <label className="block mb-1.5 text-sm font-semibold text-slate-300">
            File name
          </label>
          <div className="relative">
            <input
              className={`w-full px-4 py-3 bg-white/[0.04] border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                error ? "border-rose-500/50 focus:ring-rose-500" : "border-white/[0.08]"
              }`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="Enter document name"
            />
            {error && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>
            )}
          </div>
          {error && (
            <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}
          {!error && (
            <p className="mt-1.5 text-xs text-slate-500">
              Press <kbd className="px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[10px] font-mono text-slate-400">Enter</kbd> to save
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/[0.04] text-slate-300 text-sm font-semibold border border-white/[0.06] hover:bg-white/[0.08] hover:text-white transition-all duration-200 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 order-1 sm:order-2 ${
              saving || !name.trim()
                ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/[0.06]"
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}