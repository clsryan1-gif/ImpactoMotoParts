import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import { ShoppingCart, Calendar, Trash2, AlertCircle } from "lucide-react";
import OrderStatusChanger from "@/components/OrderStatusChanger";
import OrderListAdmin from "@/components/OrderListAdmin";

export default async function AdminPedidos() {
  const pedidos = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, phone: true } },
      items: { include: { product: { select: { nome: true } } } }
    }
  });

  const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const pagos = pedidos.filter(p => p.status === 'PAGO');
  const faturamento = pagos.reduce((a, p) => a + p.total, 0);
  const pendentes = pedidos.filter(p => p.status === 'PENDENTE');
  const valorPendente = pendentes.reduce((a, p) => a + p.total, 0);

  return (
    <div className="animate-in fade-in flex flex-col gap-6 min-h-screen relative pb-20">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <header className="shrink-0">
        <h2 className="text-2xl font-black text-zinc-100 flex items-center gap-2 uppercase tracking-widest mb-1">
          <ShoppingCart className="w-6 h-6 text-blue-500" /> Gestão de Pedidos
        </h2>
        <p className="text-zinc-500 text-sm">Altere o status, acompanhe pagamentos e controle as entregas em tempo real.</p>

        {/* Mini Métricas */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center transition-all hover:bg-zinc-800/40">
            <div className="text-lg font-black text-white">{pedidos.length}</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Total</div>
          </div>
          <div className="bg-zinc-900/60 border border-green-500/20 rounded-xl p-3 text-center transition-all hover:bg-green-500/10">
            <div className="text-lg font-black text-green-400">{pagos.length}</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Pagos</div>
          </div>
          <div className="bg-zinc-900/60 border border-yellow-500/20 rounded-xl p-3 text-center transition-all hover:bg-yellow-500/10">
            <div className="text-sm font-black text-yellow-500 font-mono italic">{BRL(valorPendente)}</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">A Receber</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center transition-all hover:bg-green-500/20">
            <div className="text-sm font-black text-green-400 font-mono">{BRL(faturamento)}</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Faturado</div>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <OrderListAdmin initialOrders={JSON.parse(JSON.stringify(pedidos))} />
      </div>
    </div>
  );
}
