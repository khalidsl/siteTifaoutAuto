import { createContext, useContext, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  notify: (message: string, type?: ToastType) => void;
  dismiss: (id: number) => void;
  toasts: ToastItem[];
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = (id: number) => {
    setToasts(current => current.filter(item => item.id !== id));
  };

  const notify = (message: string, type: ToastType = 'info') => {
    const item: ToastItem = {
      id: Date.now() + Math.random(),
      message,
      type,
    };

    setToasts(current => [...current, item]);
    window.setTimeout(() => dismiss(item.id), 2600);
  };

  const value = useMemo(() => ({ notify, dismiss, toasts }), [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed right-5 top-24 z-[90] flex max-w-sm flex-col gap-3">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
            >
              <div
                className={`flex items-center gap-3 ${
                  toast.type === 'success'
                    ? 'text-green-700'
                    : toast.type === 'error'
                      ? 'text-red-700'
                      : 'text-slate-700'
                }`}
              >
                <span
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    toast.type === 'success'
                      ? 'bg-green-500'
                      : toast.type === 'error'
                        ? 'bg-red-500'
                        : 'bg-slate-500'
                  }`}
                />
                <span className="text-sm font-semibold">{toast.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
