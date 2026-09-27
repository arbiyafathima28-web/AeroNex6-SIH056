import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  durationMs?: number;
  timestamp: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (title: string, message?: string, type?: ToastType, durationMs?: number) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message?: string, type: ToastType = 'info', durationMs: number = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newToast: ToastItem = {
      id,
      title,
      message,
      type,
      durationMs,
      timestamp: now,
    };

    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // Keep max 5 visible toasts

    if (durationMs > 0) {
      setTimeout(() => {
        removeToast(id);
      }, durationMs);
    }

    return id;
  }, [removeToast]);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
