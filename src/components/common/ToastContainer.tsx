import React from 'react';
import { useToast, ToastType } from '../../context/ToastContext';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 dark:border-emerald-500/20';
      case 'warning':
        return 'border-amber-500/30 dark:border-amber-500/20';
      case 'error':
        return 'border-rose-500/30 dark:border-rose-500/20';
      case 'info':
      default:
        return 'border-sky-500/30 dark:border-sky-500/20';
    }
  };

  return (
    <div 
      aria-live="polite"
      aria-label="System notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg bg-white dark:bg-slate-900 border ${getBorderColor(
            toast.type
          )} shadow-lg dark:shadow-slate-950/50 transition-all transform translate-y-0 text-xs text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200`}
        >
          <div className="mt-0.5">{getIcon(toast.type)}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
                {toast.title}
              </span>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                {toast.timestamp}
              </span>
            </div>
            {toast.message && (
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed break-words">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors -mr-1 -mt-0.5"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
