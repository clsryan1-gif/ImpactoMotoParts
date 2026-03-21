'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: 'text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500 hover:text-white',
    warning: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500 hover:text-black',
    info: 'text-blue-500 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500 hover:text-white',
  };

  const btnColors = {
    danger: 'bg-red-600 hover:bg-red-500 shadow-red-600/20',
    warning: 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20',
    info: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 ${type === 'danger' ? 'bg-red-600' : 'bg-yellow-500'}`}></div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colors[type].split(' hover')[0]}`}>
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
              {title}
            </h3>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-medium">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3.5 rounded-2xl bg-zinc-800 text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 hover:text-white transition-all border border-zinc-700/50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg ${btnColors[type]}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
