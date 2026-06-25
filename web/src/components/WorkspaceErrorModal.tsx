import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, 
  WifiOff, 
  Settings, 
  Play, 
  X, 
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";

interface WorkspaceErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
  onSimulate: () => void;
}

export const WorkspaceErrorModal: React.FC<WorkspaceErrorModalProps> = ({
  isOpen,
  onClose,
  errorMessage,
  onSimulate,
}) => {
  // Infer exact error type to show specific, helpful recommendations
  const isNetworkError = errorMessage.toLowerCase().includes("network error") || errorMessage.toLowerCase().includes("dns");
  const isDomainError = errorMessage.toLowerCase().includes("unauthorized-domain") || errorMessage.toLowerCase().includes("domain is not authorized");
  const isPopupError = errorMessage.toLowerCase().includes("popup") || errorMessage.toLowerCase().includes("pop-up");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className="relative w-full max-w-lg bg-white/95 border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col"
          >
            {/* Ambient Top Decorative Gradient */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500" />

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                  {isNetworkError ? (
                    <WifiOff className="w-5 h-5 text-amber-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">
                    Workspace Link Interrupted
                  </h3>
                  <p className="text-[11px] text-text-muted font-mono tracking-wide mt-0.5">
                    GOOGLE INTEGRATION GATEWAY
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors duration-150 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Error Console Report */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                  Reported Error Trace
                </span>
                <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl font-mono text-[11px] text-slate-700 leading-relaxed break-words relative overflow-hidden">
                  <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {errorMessage}
                </div>
              </div>

              {/* Trouble-shooting Guidelines */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                  Why this happens & How to resolve
                </span>

                <div className="space-y-2.5">
                  {isNetworkError && (
                    <div className="flex items-start space-x-3 p-3.5 bg-slate-50 border border-slate-100/70 rounded-2xl">
                      <WifiOff className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">Local Sandbox Connection Failure</h4>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          Firebase authentication pop-ups require direct server lookup and callback connections. This error often triggers if Google Auth servers are blocked by local firewalls, VPN rules, or corporate proxy systems.
                        </p>
                      </div>
                    </div>
                  )}

                  {isDomainError && (
                    <div className="flex items-start space-x-3 p-3.5 bg-slate-50 border border-slate-100/70 rounded-2xl">
                      <Settings className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">Host Domain Unregistered</h4>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          To securely sign in, this website domain ({window.location.hostname}) must be added to your Authorized Domains list in the Google/Firebase Console configuration.
                        </p>
                      </div>
                    </div>
                  )}

                  {isPopupError && (
                    <div className="flex items-start space-x-3 p-3.5 bg-slate-50 border border-slate-100/70 rounded-2xl">
                      <HelpCircle className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">Browser Popup Blocker</h4>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          Your browser has blocked the login interface. Please authorize popups from localhost in your URL address bar to continue.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Standard Troubleshooting Step */}
                  <div className="flex items-start space-x-3 p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-2xl">
                    <Layers className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-700">Developer Environment Notice</h4>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        If you are developing inside an offline or isolated virtual environment, standard Google authentication may not resolve. We support mock Workspace synchronization for evaluation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all duration-150 cursor-pointer text-center"
              >
                Close & Retry
              </button>

              <button
                onClick={() => {
                  onSimulate();
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-[11px] font-bold text-white hover:bg-slate-800 transition-all duration-150 shadow-sm flex items-center justify-center space-x-2 cursor-pointer btn-interactive group"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Simulate Demo Connection</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
