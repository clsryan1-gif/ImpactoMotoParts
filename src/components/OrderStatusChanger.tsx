'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, XCircle, Truck, ChevronDown } from 'lucide-react';

type StatusKey = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ENVIADO';

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; icon: React.ReactNode }> = {
  PENDENTE: { label: 'Pendente', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', icon: <Clock className="w-3 h-3" /> },
  PAGO: { label: 'Pago', color: 'text-green-400 border-green-500/30 bg-green-500/10', icon: <CheckCircle className="w-3 h-3" /> },
  ENVIADO: { label: 'Enviado', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', icon: <Truck className="w-3 h-3" /> },
  CANCELADO: { label: 'Cancelado', color: 'text-red-400 border-red-500/30 bg-red-500/10', icon: <XCircle className="w-3 h-3" /> },
};

export default function OrderStatusChanger({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const config = STATUS_CONFIG[currentStatus as StatusKey] ?? STATUS_CONFIG['PENDENTE'];

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [open]);

  const change = async (status: StatusKey) => {
    setLoading(true);
    setOpen(false);
    try {
      await fetch(`/api/admin/pedidos/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch {
      alert('Erro ao alterar status.');
    } finally {
      setLoading(false);
    }
  };

  const menu = (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
      <div 
        style={{ 
          position: 'absolute', 
          top: coords.top + 8, 
          left: coords.left + coords.width - 176, // 176px is w-44
          width: '176px' 
        }}
        className="z-[9999] bg-zinc-900 border border-zinc-700 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10 backdrop-blur-xl"
      >
        <div className="p-1 px-2 border-b border-zinc-800/50 bg-zinc-950/30">
          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">Alterar Status</span>
        </div>
        {(Object.keys(STATUS_CONFIG) as StatusKey[]).map(s => (
          <button
            key={s}
            onClick={() => change(s)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5 ${s === currentStatus ? 'bg-zinc-800/50 opacity-40 cursor-default' : 'text-zinc-400 hover:text-white'}`}
          >
            <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].color.split(' ')[0].replace('text-', 'bg-')}`}></div>
            <span>{STATUS_CONFIG[s].label}</span>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(p => !p)}
        disabled={loading}
        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border transition-all ${config.color} ${loading ? 'opacity-50' : 'hover:opacity-80'}`}
      >
        {config.icon}
        {loading ? '...' : config.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && typeof document !== 'undefined' && createPortal(menu, document.body)}
    </div>
  );
}
