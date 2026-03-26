'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileText, Tag, ReceiptText } from 'lucide-react';

interface PrintOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (type: 'thermal' | 'a4' | 'label') => void;
  orderId: string;
}

export default function PrintOptionsModal({
  isOpen,
  onClose,
  onPrint,
  orderId
}: PrintOptionsModalProps) {
  // Bloquear scroll do corpo quando aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/80 backdrop-blur-[4px] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden mt-10 md:mt-20 mb-10"
          >
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px]"></div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <Printer className="w-7 h-7 text-blue-500" />
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
              Opções de Impressão
            </h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-8">
              Pedido #{orderId.substring(0, 8)} • Escolha o formato ideal
            </p>

            <div className="space-y-3">
              <button
                onClick={() => { onPrint('thermal'); onClose(); }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-impacto-yellow group transition-all text-left"
              >
                <div className="p-3 rounded-xl bg-zinc-900 group-hover:bg-impacto-yellow/10 transition-colors">
                  <ReceiptText className="w-5 h-5 text-zinc-500 group-hover:text-impacto-yellow" />
                </div>
                <div>
                  <div className="text-sm font-black text-zinc-100 group-hover:text-impacto-yellow transition-colors">CUPOM TÉRMICO (80mm)</div>
                  <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">Ideal para Motoboys e Bluetooth</div>
                </div>
              </button>

              <button
                onClick={() => { onPrint('a4'); onClose(); }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-blue-500 group transition-all text-left"
              >
                <div className="p-3 rounded-xl bg-zinc-900 group-hover:bg-blue-500/10 transition-colors">
                  <FileText className="w-5 h-5 text-zinc-500 group-hover:text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-black text-zinc-100 group-hover:text-blue-500 transition-colors">RELATÓRIO A4 (PADRÃO)</div>
                  <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">Papel comum / Arquivo interno</div>
                </div>
              </button>

              <button
                onClick={() => { onPrint('label'); onClose(); }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-100 group transition-all text-left opacity-60 hover:opacity-100"
              >
                <div className="p-3 rounded-xl bg-zinc-900 group-hover:bg-zinc-100/10 transition-colors">
                  <Tag className="w-5 h-5 text-zinc-500 group-hover:text-zinc-100" />
                </div>
                <div>
                  <div className="text-sm font-black text-zinc-100 group-hover:text-zinc-100 transition-colors">ETIQUETA DE ENVIO</div>
                  <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">Apenas dados de entrega</div>
                </div>
              </button>
            </div>

            <p className="mt-8 text-center text-[10px] text-zinc-600 font-black uppercase tracking-widest bg-zinc-950/50 py-3 rounded-xl border border-zinc-800/30">
              Impacto Moto Parts • Sistema PDV
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
