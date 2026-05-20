'use client';

import { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg, 8000),
    warning: (msg: string) => addToast('warning', msg, 6000),
    info: (msg: string) => addToast('info', msg),
  };

  return { toasts, toast, removeToast };
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-emerald-50 border-emerald-200/60 text-emerald-800',
  error: 'bg-red-50 border-red-200/60 text-red-800',
  warning: 'bg-amber-50 border-amber-200/60 text-amber-800',
  info: 'bg-blue-50 border-blue-200/60 text-blue-800',
};

const iconStyles = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const Icon = icons[t.type];
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl shadow-slate-900/5 backdrop-blur-sm transition-all duration-300 ${styles[t.type]} ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      }`}
    >
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconStyles[t.type]}`} />
      <p className="text-[13px] font-medium flex-1">{t.message}</p>
      <button onClick={() => onRemove(t.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
