'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => {
      // Limit to 3 toasts to avoid cluttering the screen
      const next = [...prev, { id, message, type }];
      if (next.length > 3) return next.slice(1);
      return next;
    });
    
    // Auto remove after 0.7 seconds (as requested by Ryan)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 700);
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, clearToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-md px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.15 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl border backdrop-blur-xl w-full
                ${toast.type === 'success' ? 'bg-zinc-900/90 border-green-500/30' : 
                  toast.type === 'error' ? 'bg-zinc-900/90 border-red-500/30' : 
                  'bg-zinc-900/90 border-blue-500/30'}
              `}>
                <div className={`
                  p-2 rounded-full
                  ${toast.type === 'success' ? 'bg-green-500/10 text-green-500' : 
                    toast.type === 'error' ? 'bg-red-500/10 text-red-500' : 
                    'bg-zinc-500/10 text-zinc-400'}
                `}>
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'info' && <Info className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
                    {toast.type === 'success' ? 'Sistema / Sucesso' : 
                     toast.type === 'error' ? 'Sistema / Erro' : 
                     'Sistema / Info'}
                  </h4>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/5 rounded-lg text-zinc-600 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
