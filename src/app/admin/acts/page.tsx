'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Terminal, Zap, Trash2, LayoutDashboard, Database, Activity, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivityLog } from '@/components/ActivityLogger';

import { supabase } from '@/lib/supabase';

export default function ActsMonitorPage() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [startTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Proteção de Rota
  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') redirect('/');
  }, [status, session]);

  // Carrega histórico do Banco de Dados
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/admin/acts');
        if (res.ok) {
          const data = await res.json();
          // Converte o timestamp do DB para o formato do console
          const formattedData = data.map((log: any) => ({
            ...log,
            timestamp: new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour12: false })
          })).reverse();
          setLogs(formattedData);
        }
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      }
    };

    if (status === 'authenticated') fetchHistory();
  }, [status]);

  useEffect(() => {
    // Escuta mudanças em tempo real no Banco de Dados
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ActivityLog',
        },
        (payload) => {
          const newLog = payload.new as any;
          // Formata o timestamp para o console
          const formattedLog = {
            ...newLog,
            timestamp: new Date(newLog.createdAt).toLocaleTimeString('pt-BR', { hour12: false })
          };
          setLogs(prev => [...prev.slice(-499), formattedLog]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatSessionTime = () => {
    const diff = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8 flex flex-col gap-6 selection:bg-impacto-yellow selection:text-black overflow-hidden h-screen">
      {/* SCANLINES OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-impacto-yellow/10 rounded-xl border border-impacto-yellow/20">
            <Terminal className="w-8 h-8 text-impacto-yellow animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-2">
              SISTEMA DE MONITORAMENTO <span className="text-impacto-yellow">OVERDRIVE</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Impacto Moto Parts | Admin Control Unit</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Sessão Alpha</span>
            <span className="text-xl font-black tabular-nums text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{formatSessionTime()}</span>
          </div>
          <button 
            onClick={() => setLogs([])}
            className="flex items-center gap-2 px-4 py-2 bg-impacto-red/10 hover:bg-impacto-red/20 border border-impacto-red/30 rounded-lg text-impacto-red text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> Purgar Logs
          </button>
        </div>
      </header>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {[
          { icon: Activity, label: 'Atos Gravados', value: logs.length, color: 'text-impacto-yellow' },
          { icon: UserCircle, label: 'Usuário Ativo', value: session?.user?.name, color: 'text-white' },
          { icon: Database, label: 'Uptime Sistema', value: '99.9%', color: 'text-green-400' },
          { icon: LayoutDashboard, label: 'Integridade', value: 'ESTÁVEL', color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/40 p-3 rounded-xl border border-white/5 flex items-center gap-3">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <div className="flex flex-col">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</span>
              <span className={`text-xs font-black truncate max-w-[120px] ${stat.color}`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONSOLE AREA */}
      <main className="flex-1 bg-zinc-950/50 rounded-2xl border border-white/10 overflow-hidden relative shadow-inner">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-impacto-yellow/50 to-transparent animate-pulse" />
        
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto p-6 space-y-4 custom-scrollbar"
        >
          <AnimatePresence initial={false}>
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                <Zap className="w-24 h-24 text-zinc-800 mb-4" />
                <span className="text-xs font-black uppercase tracking-[0.5em]">Aguardando transmissão de dados...</span>
              </div>
            ) : (
              logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  className="group flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all border-l-2 border-transparent hover:border-impacto-yellow"
                >
                  <div className="flex flex-col items-center shrink-0 w-16">
                    <span className="text-[10px] text-zinc-600 font-bold">[{log.timestamp}]</span>
                    <div className={`w-px h-full bg-white/5 mt-2 group-hover:bg-white/10 transition-colors`} />
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-impacto-yellow px-2 py-0.5 bg-impacto-yellow/10 rounded border border-impacto-yellow/20">
                        {log.user}
                      </span>
                      {log.metadata && (
                        <span className="text-[8px] text-zinc-500 font-black tracking-widest px-1.5 py-0.5 border border-white/10 rounded">
                          {log.metadata}
                        </span>
                      )}
                      <div className="flex-1 h-px bg-white/5" />
                      <span className={`text-[8px] font-black uppercase tracking-widest ${
                        log.type === 'error' ? 'text-impacto-red' : 
                        log.type === 'success' ? 'text-green-400' : 'text-zinc-500'
                      }`}>
                        TYPE_{log.type.toUpperCase()}
                      </span>
                    </div>
                    <p className={`text-sm font-bold tracking-tight ${
                      log.type === 'error' ? 'text-impacto-red' : 
                      log.type === 'navigation' ? 'text-impacto-orange' : 
                      log.type === 'input' ? 'text-impacto-red' : 'text-zinc-100'
                    }`}>
                      {log.detail}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="shrink-0 flex justify-between items-center text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] pt-2">
        <div className="flex gap-6">
          <span>Encrypted Tunnel: ELITE_AES_256</span>
          <span>Buffer: SYNC_VERIFIED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span>Servidor Principal: {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #facc15;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
