'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Terminal, X, ChevronUp, ChevronDown, Trash2, Zap, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

export type ActivityLog = {
  id: string;
  user: string;
  role?: string;
  type: 'click' | 'input' | 'navigation' | 'system' | 'error' | 'success';
  detail: string;
  metadata?: string;
  timestamp: string;
};

// Instância global do canal para sincronização entre abas
const actsChannel = typeof window !== 'undefined' ? new BroadcastChannel('impacto-acts-v1') : null;

export default function ActivityLogger() {
  const { data: session } = useSession();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user && (session.user as any)?.role === 'ADMIN';
  const userRole = (session?.user as any)?.role || 'USER';

  const formatSessionTime = () => {
    if (!startTime) return "0:00";
    const diff = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const addLog = async (type: ActivityLog['type'], detail: string, metadata?: string) => {
    const userName = session?.user?.name || 'Visitante';
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      user: userName,
      role: userRole,
      type,
      detail,
      metadata,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
    };
    
    // Envia o log para outras abas (incluindo a página dedicada)
    actsChannel?.postMessage(newLog);
    
    // Persiste no Banco de Dados (sem travar a UI)
    if (isAdmin) {
      fetch('/api/admin/acts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userName,
          role: userRole,
          type,
          detail,
          metadata
        })
      }).catch(err => console.error('Erro ao salvar ato:', err));
    }
    
    setLogs(prev => [...prev.slice(-99), newLog]); // Aumentado para 100 logs
  };

  // Escuta logs de outras abas
  useEffect(() => {
    if (!isAdmin || !actsChannel) return;

    const handleMessage = (event: MessageEvent<ActivityLog>) => {
      setLogs(prev => [...prev.slice(-99), event.data]);
    };

    actsChannel.addEventListener('message', handleMessage);
    return () => actsChannel.removeEventListener('message', handleMessage);
  }, [isAdmin]);

  // Captura cliques globais inteligentes
  useEffect(() => {
    if (!isAdmin) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.activity-logger-container')) return;

      // Busca o elemento pai mais relevante (botão, link, ou card)
      const clickable = target.closest('button, a, [role="button"]');
      const element = clickable || target;
      
      let label = element.textContent?.trim() || 
                  element.getAttribute('aria-label') || 
                  element.getAttribute('title') || 
                  (element as any).value ||
                  element.tagName;

      if (label.length > 40) label = label.substring(0, 40) + '...';
      
      const context = clickable ? `[${clickable.tagName.toLowerCase()}]` : `(${target.tagName.toLowerCase()})`;
      addLog('click', `Interação: "${label}"`, context);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isAdmin]);

  // Captura mudanças de rota detalhadas
  useEffect(() => {
    if (!isAdmin) return;
    addLog('navigation', `Acessou: ${pathname}`, 'ROTA');
  }, [pathname, isAdmin]);

  // Captura de inputs refinada
  useEffect(() => {
    if (!isAdmin) return;
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.closest('.activity-logger-container')) return;
      
      const fieldName = target.getAttribute('name') || target.getAttribute('placeholder') || target.id || 'campo';
      if (fieldName) {
        // Debounce simples para não inundar de logs de escrita
        const throttleKey = `input-${fieldName}`;
        if ((window as any)[throttleKey]) clearTimeout((window as any)[throttleKey]);
        (window as any)[throttleKey] = setTimeout(() => {
          addLog('input', `Editando: ${fieldName}`, 'FORM');
        }, 1000);
      }
    };

    window.addEventListener('input', handleInput);
    return () => window.removeEventListener('input', handleInput);
  }, [isAdmin]);

  // Log de sistema inicial
  useEffect(() => {
    setStartTime(new Date());
    if (isAdmin) {
      addLog('system', 'Console Elite Inicializado', 'SYSTEM');
    }
  }, [isAdmin]);

  // Scroll automático para o final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isMinimized]);

  // Só renderiza se for ADMIN
  if (!isAdmin) return null;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] w-full max-w-md activity-logger-container">
      <motion.div 
        initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        className="bg-zinc-950/85 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* SCANLINES OVERLAY */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />

        {/* HEADER */}
        <div className="bg-zinc-900/80 p-4 border-b border-white/10 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="w-5 h-5 text-impacto-yellow drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] animation-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black animate-ping" />
            </div>
            <div>
              <h3 className="text-[12px] font-black text-white uppercase tracking-tighter italic">Console de Atos Elite</h3>
              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Status: Live Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.open('/admin/acts', '_blank')} 
              className="p-1.5 text-zinc-500 hover:text-impacto-yellow transition-all hover:scale-110 active:scale-90" 
              title="Abrir Dashboard Monitor"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button onClick={() => setLogs([])} className="p-1.5 text-zinc-500 hover:text-impacto-red transition-all hover:scale-110 active:scale-90" title="Purge Sequence">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 text-zinc-500 hover:text-impacto-yellow transition-all hover:scale-110 active:scale-90">
              {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOGS LIST */}
        <AnimatePresence mode="wait">
          {!isMinimized && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 400, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="overflow-hidden relative z-20"
            >
              <div 
                ref={scrollRef}
                className="h-full overflow-y-auto p-4 space-y-3 font-mono text-[10px] scrollbar-hide"
              >
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-2 opacity-50">
                    <Terminal className="w-8 h-8 animate-pulse text-zinc-800" />
                    <span className="italic font-bold tracking-widest text-[8px] uppercase">Esperando atividade na pista...</span>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <motion.div 
                      key={log.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.01 }}
                      className="flex gap-3 group relative border-l border-white/5 pl-3 py-1 hover:bg-white/5 transition-colors rounded-r-lg"
                    >
                      <span className="text-zinc-700 shrink-0 font-bold opacity-70">[{log.timestamp}]</span>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-impacto-yellow font-black text-[9px] uppercase tracking-tighter truncate max-w-[80px]">
                            {log.user}
                          </span>
                          {log.metadata && (
                            <span className="text-[7px] px-1 bg-white/10 text-zinc-400 rounded-sm font-black tracking-widest">
                              {log.metadata}
                            </span>
                          )}
                        </div>
                        <span className={`
                          font-bold leading-tight
                          ${log.type === 'click' ? 'text-zinc-100' : ''}
                          ${log.type === 'navigation' ? 'text-impacto-orange' : ''}
                          ${log.type === 'input' ? 'text-impacto-red' : ''}
                          ${log.type === 'system' ? 'text-blue-400 italic' : ''}
                          ${log.type === 'error' ? 'text-red-500' : ''}
                          ${log.type === 'success' ? 'text-green-400' : ''}
                        `}>
                          {log.detail}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER (ELITE STATUS) */}
        <div className="bg-zinc-900/50 p-3 px-5 border-t border-white/10 flex justify-between items-center relative z-20">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest">Atos</span>
              <span className="text-[10px] text-impacto-yellow font-black tabular-nums">{logs.length}</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest">Sessão</span>
              <span className="text-[10px] text-white font-black tabular-nums">{formatSessionTime()}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
             <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest">Nível de Log</span>
             <span className="text-[10px] text-impacto-red font-black tracking-tighter italic shadow-impacto-red">ELITE_OVERDRIVE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
