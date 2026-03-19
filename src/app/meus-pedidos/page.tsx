'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Package, CheckCircle, Clock, Truck, XCircle, ChevronLeft, ExternalLink } from 'lucide-react';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: { nome: string; categoria: string; imagem: string | null };
};

type Order = {
  id: string;
  total: number;
  status: string;
  paymentType: string;
  createdAt: string;
  items: OrderItem[];
};

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_ICON: Record<string, React.ReactNode> = {
  PAGO: <CheckCircle className="w-4 h-4 text-green-400" />,
  PENDENTE: <Clock className="w-4 h-4 text-yellow-400" />,
  ENVIADO: <Truck className="w-4 h-4 text-blue-400" />,
  CANCELADO: <XCircle className="w-4 h-4 text-red-400" />,
};

const STATUS_COLOR: Record<string, string> = {
  PAGO: 'text-green-400 bg-green-500/10 border-green-500/20',
  PENDENTE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  ENVIADO: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  CANCELADO: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function MeusPedidos() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/meus-pedidos')
        .then(r => r.json())
        .then(data => { setPedidos(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (loading || status === 'loading') return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-500 text-sm animate-pulse">Carregando histórico...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 max-w-3xl mx-auto">
      <div className="absolute inset-0 bg-radial-gradient from-red-500/5 via-transparent to-transparent pointer-events-none -z-10"></div>

      <div className="mb-8 flex items-center gap-4">
        <Link href="/produtos" className="text-zinc-500 hover:text-white transition">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-red-500" /> Meus Pedidos
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Histórico de compras de <strong className="text-white">{session?.user?.name || session?.user?.phone}</strong></p>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 border border-dashed border-zinc-800 rounded-3xl">
          <ShoppingCart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-500 mb-2">Nenhum pedido ainda</h2>
          <p className="text-zinc-600 text-sm mb-8">Adicione peças ao carrinho e finalize sua primeira compra.</p>
          <Link href="/produtos">
            <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-colors">
              Ver Catálogo
            </button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido, i) => (
            <motion.div
              key={pedido.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors"
            >
              {/* Header do Pedido */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-1 rounded font-mono">#{pedido.id.substring(0, 8).toUpperCase()}</span>
                  <span className="text-xs text-zinc-500">{new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${STATUS_COLOR[pedido.status] || STATUS_COLOR['PENDENTE']}`}>
                    {STATUS_ICON[pedido.status]}
                    {pedido.status}
                  </span>
                </div>
              </div>

              {/* Itens */}
              <div className="p-4 space-y-3">
                {pedido.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/5">
                      {item.product.imagem
                        ? <img src={item.product.imagem} alt={item.product.nome} className="w-full h-full object-contain p-1" />
                        : <Package className="w-5 h-5 text-zinc-600 m-auto mt-3.5" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.product.nome}</p>
                      <p className="text-[10px] text-zinc-500">{item.product.categoria}</p>
                    </div>
                    <div className="text-green-400 font-mono font-bold text-sm shrink-0">{BRL(item.price)}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 bg-zinc-950/40 border-t border-zinc-800/60">
                <div className="text-xs text-zinc-500">
                  Via <span className="font-bold text-zinc-400">{pedido.paymentType.replace('_', ' ')}</span>
                </div>
                <div className="font-black text-white text-sm font-mono">
                  Total: <span className="text-green-400">{BRL(pedido.total)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
