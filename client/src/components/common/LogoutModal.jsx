import React from 'react';
import { LogOut, AlertCircle, X } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirm, isLoggingOut }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-slate-900 relative scale-100 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        {/* Close Icon Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-100">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 id="logout-modal-title" className="text-lg font-bold text-slate-900 font-display">
              Confirm Logout
            </h3>
            <p className="text-xs text-slate-500">
              Session termination
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-6 text-sm text-slate-700 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p>
            Are you sure you want to log out? You will need to sign in again to view your private Skill Passport dashboard and credentials.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md shadow-red-600/20 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
