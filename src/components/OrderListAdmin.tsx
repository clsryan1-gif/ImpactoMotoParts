'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, AlertCircle, Printer, Trash2 } from "lucide-react";
import OrderStatusChanger from "./OrderStatusChanger";
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { hideOrder } from '@/app/admin/pedidos/actions';
import ConfirmModal from './ConfirmModal';

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrderListAdmin({ initialOrders }: { initialOrders: any[] }) {
  const [pedidos, setPedidos] = useState(initialOrders);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'TODOS' | 'PENDENTE' | 'PAGO' | 'ENVIADO'>('TODOS');
  const [modalDelete, setModalDelete] = useState<{ isOpen: boolean, orderId: string | null }>({ isOpen: false, orderId: null });
  const { showToast } = useToast();

  useEffect(() => {
    setPedidos(initialOrders);
  }, [initialOrders]);

  // Realtime Logic
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'Order',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrderRaw = payload.new as any;
            
            // Busca os detalhes completos (itens e usuário) via API
            try {
              const res = await fetch(`/api/pedidos/${newOrderRaw.id}`);
              if (res.ok) {
                const fullOrder = await res.json();
                setPedidos(prev => [fullOrder, ...prev]);
                showToast('NOVO PEDIDO RECEBIDO! 🏁', 'success');
                
                // Toca som de alerta se possível (feedback sonoro para o Ryan)
                if (typeof Audio !== 'undefined') {
                  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                  audio.play().catch(() => {});
                }
              }
            } catch (err) {
              console.error('Erro ao buscar detalhes do novo pedido:', err);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as any;
            setPedidos(prev => prev.map(p => p.id === updatedOrder.id ? { ...p, status: updatedOrder.status } : p));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id;
            setPedidos(prev => prev.filter(p => p.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showToast]);

  const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handlePrint = (pedido: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Etiqueta de Envio - Pedido #${pedido.id.substring(0, 8)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; }
            .header { border-bottom: 4px solid #000; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
            .order-id { font-size: 14px; font-weight: bold; background: #000; color: #fff; padding: 5px 12px; border-radius: 4px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #666; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .client-name { font-size: 20px; font-weight: 900; text-transform: uppercase; }
            .client-phone { font-size: 14px; color: #444; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th { text-align: left; font-size: 10px; text-transform: uppercase; padding: 10px; border-bottom: 2px solid #000; }
            .items-table td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 13px; }
            .total-row { font-size: 18px; font-weight: 900; text-align: right; margin-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">IMPACTO MOTO PARTS</div>
            <div class="order-id">PEDIDO #${pedido.id.substring(0, 8)}</div>
          </div>
          <div class="section">
            <div class="section-title">Destinatário / Piloto</div>
            <div class="client-name">${pedido.user?.name || 'Cliente'}</div>
            <div class="client-phone">WhatsApp: ${pedido.user?.phone}</div>
          </div>
          <div class="section">
            <div class="section-title">Conteúdo da Encomenda</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quant.</th>
                  <th>Preço Unit.</th>
                </tr>
              </thead>
              <tbody>
                ${pedido.items.map((i: any) => `
                  <tr>
                    <td>${i.product.nome}</td>
                    <td>${i.quantity}</td>
                    <td>${BRL(i.price)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="total-row">TOTAL: ${BRL(pedido.total)}</div>
          <div class="no-print" style="margin-top: 50px; text-align: center;">
            <button onclick="window.print()" style="padding: 15px 30px; background: #000; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">EFETUAR IMPRESSÃO</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDelete = async (orderId: string) => {
    setModalDelete({ isOpen: true, orderId });
  };

  const confirmDelete = async () => {
    if (!modalDelete.orderId) return;
    
    const res = await hideOrder(modalDelete.orderId);
    if (res.success) {
      setPedidos(prev => prev.filter(p => p.id !== modalDelete.orderId));
      showToast('Pedido removido do painel!', 'success');
    } else {
      showToast('Erro ao remover pedido.', 'error');
    }
  };

  const pedidosFiltrados = (filtro === 'TODOS' ? pedidos : pedidos.filter(p => p.status === filtro))
    .filter(p => 
      p.user?.name?.toLowerCase().includes(busca.toLowerCase()) || 
      p.user?.phone?.toLowerCase().includes(busca.toLowerCase()) ||
      p.id.includes(busca)
    );

  return (
    <div className="h-full overflow-y-auto pr-2 space-y-4 pb-10 custom-scrollbar">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Barra de Busca Elite */}
        <div className="flex-1 relative">
          <input 
            type="text"
            placeholder="Buscar por cliente, whatsapp ou ID..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-3 px-5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
          />
        </div>

        {/* Barra de Filtros Premium */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {['TODOS', 'PENDENTE', 'PAGO', 'ENVIADO'].map((f) => {
            const colors: any = {
              PENDENTE: 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10',
              PAGO: 'border-green-500/30 text-green-500 hover:bg-green-500/10',
              ENVIADO: 'border-blue-500/30 text-blue-500 hover:bg-blue-500/10',
              TODOS: 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/50'
            };
            const active: any = {
              PENDENTE: 'bg-yellow-500 border-yellow-400 text-black shadow-[0_5px_15px_rgba(234,179,8,0.3)]',
              PAGO: 'bg-green-500 border-green-400 text-black shadow-[0_5px_15px_rgba(34,197,94,0.3)]',
              ENVIADO: 'bg-blue-500 border-blue-400 text-black shadow-[0_5px_15px_rgba(59,130,246,0.3)]',
              TODOS: 'bg-white border-white text-black shadow-[0_5px_15px_rgba(255,255,255,0.2)]'
            };
            return (
              <button
                key={f}
                onClick={() => setFiltro(f as any)}
                className={`px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                  filtro === f ? active[f] : colors[f]
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {pedidosFiltrados.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full min-h-[300px] text-zinc-600 border border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-900/10">
            <ShoppingCart className="w-12 h-12 mb-4 opacity-5" />
            <p className="text-sm font-medium">Nenhum pedido encontrado para "{busca || filtro}".</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {pedidosFiltrados.map((pedido, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={pedido.id} 
                className={`bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-5 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all relative group shadow-lg 
                  [content-visibility:auto] [contain-intrinsic-size:100px]
                  ${pedido.status === 'PAGO' ? 'hover:shadow-green-500/5 hover:border-green-500/30' : 
                    pedido.status === 'PENDENTE' ? 'hover:shadow-yellow-500/5 hover:border-yellow-500/30' : 
                    'hover:shadow-blue-500/5 hover:border-blue-500/30'}`}
              >
                {/* Indicador de Status Lateral */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full transition-opacity opacity-0 group-hover:opacity-100
                  ${pedido.status === 'PAGO' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 
                    pedido.status === 'PENDENTE' ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 
                    'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`}>
                </div>
            
            {/* Info Cliente */}
            <div className="space-y-1.5 lg:w-56 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-[0.15em]">#{pedido.id.substring(0, 8)}</span>
                <span className="text-[10px] text-zinc-600 flex items-center gap-1 font-bold"><Calendar className="w-2.5 h-2.5" /> {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div>
                <h3 className="font-black text-white text-sm uppercase tracking-wide">{pedido.user?.name || "Piloto"}</h3>
                <p className="text-[10px] text-zinc-500 truncate font-medium">{pedido.user?.phone}</p>
              </div>
            </div>

            {/* Itens */}
            <div className="flex-1 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 min-w-0">
              <span className="text-[9px] uppercase text-zinc-600 font-black block mb-2 tracking-widest">{pedido.items.length} {pedido.items.length === 1 ? 'peça' : 'peças'} adquirida(s)</span>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {pedido.items.map((item: any) => (
                  <div key={item.id} className="text-[10px] text-zinc-400 truncate flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                    {item.product.nome}
                  </div>
                ))}
              </div>
            </div>

            {/* Valor + Status + Ações */}
            <div className="flex flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-end gap-3 lg:w-56 shrink-0 border-t lg:border-t-0 border-zinc-800/60 pt-4 lg:pt-0">
              <div className="text-right">
                <span className="text-[9px] uppercase text-zinc-500 font-black block tracking-widest mb-0.5">Total</span>
                <strong className="text-lg font-black text-green-400 font-mono drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]">{BRL(pedido.total)}</strong>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-1">
                  <OrderStatusChanger orderId={pedido.id} currentStatus={pedido.status} />
                  <span className="text-[8px] text-zinc-600 uppercase tracking-widest font-black">Via {pedido.paymentType.replace('_', ' ')}</span>
                </div>
                
                  <button 
                    onClick={() => handlePrint(pedido)}
                    className="p-3 rounded-xl bg-zinc-800/50 hover:bg-blue-500/20 text-zinc-600 hover:text-blue-500 transition-all border border-transparent hover:border-blue-500/20"
                    title="Imprimir Etiqueta"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleDelete(pedido.id)}
                    className="p-3 rounded-xl bg-zinc-800/50 hover:bg-red-500/20 text-zinc-600 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                    title="Apagar do Painel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
            </div>
          </motion.div>
        ))}
        <ConfirmModal 
        isOpen={modalDelete.isOpen}
        onClose={() => setModalDelete({ isOpen: false, orderId: null })}
        onConfirm={confirmDelete}
        title="Apagar Pedido?"
        message="Deseja realmente apagar este pedido do painel? Ele continuará salvo no banco de dados para seu histórico e segurança."
        confirmLabel="Pode Apagar"
        cancelLabel="Mantenha aqui"
      />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
