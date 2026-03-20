'use client';

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Detectar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handler = (e: any) => {
      // Prevenir o prompt automático para controlar o timing
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar após 3 segundos para não ser intrusivo
      setTimeout(() => {
        if (!isDismissed) setIsVisible(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isDismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1001] w-[90%] max-w-[320px] md:hidden"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-impacto-red to-impacto-orange rounded-2xl blur opacity-30"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center p-1">
                  <img src="/icon-pwa-192.png?v=4" alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-tighter">Impacto Moto Parts</h4>
                  <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Acelere com o App!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleInstallClick}
                  className="bg-white text-black text-[9px] font-black py-2 px-4 rounded-lg hover:bg-impacto-orange transition-colors uppercase"
                >
                  INSTALAR
                </button>
                <button onClick={handleDismiss} className="text-zinc-500 hover:text-white transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
