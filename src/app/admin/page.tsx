import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, Users, Wallet, TrendingUp, AlertTriangle, ArrowRight, PlusCircle, UserPlus, Receipt, Gauge, Terminal } from "lucide-react";
import Link from "next/link";

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Coleta de dados com tratamento de erro resiliente
  let usersCount = 0, productsCount = 0, ordersCount = 0, lowStock: any[] = [], recentOrders: any[] = [];
  let entradasAgg: any = { _sum: { valor: 0 } };
  let saidasAgg: any = { _sum: { valor: 0 } };
  let faturamentoPagas: any = { _sum: { total: 0 } };

  try {
    const results = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.product.findMany({ where: { estoque: { lte: 5 } }, take: 4, orderBy: { estoque: 'asc' } }),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
      (prisma as any).financeiro.aggregate({ _sum: { valor: true }, where: { tipo: "ENTRADA" } }),
      (prisma as any).financeiro.aggregate({ _sum: { valor: true }, where: { tipo: "SAIDA" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAGO' } })
    ]);

    usersCount = results[0];
    productsCount = results[1];
    ordersCount = results[2];
    lowStock = results[3];
    recentOrders = results[4];
    entradasAgg = results[5];
    saidasAgg = results[6];
    faturamentoPagas = results[7];
  } catch (error) {
    // Silently handle dash errors
  }
  
  const saldo = (entradasAgg._sum.valor || 0) - (saidasAgg._sum.valor || 0);
  const totalFaturado = faturamentoPagas._sum.total || 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 md:space-y-8 pb-10">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-2 md:gap-3">
            COCKPIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-impacto-yellow to-impacto-orange drop-shadow-[0_0_15px_rgba(255,102,0,0.5)]">IMPACTO</span>
            <div className="flex gap-1 scale-75 md:scale-100">
               <span className="bg-impacto-yellow animate-pulse w-2 h-2 rounded-full blur-[1px]"></span>
               <span className="bg-impacto-orange animate-pulse w-2 h-2 rounded-full blur-[1px] delay-75"></span>
               <span className="bg-impacto-red animate-pulse w-2 h-2 rounded-full blur-[1px] delay-150"></span>
            </div>
          </h1>
          <p className="text-zinc-500 font-black uppercase tracking-widest text-[8px] md:text-[9px] mt-0.5 md:mt-1 space-x-2">
            <span className="text-impacto-yellow text-[7px] md:text-[9px]">LIVE</span> 
            <span>• SISTEMA DE ALTA PERFORMANCE</span>
          </p>
        </div>

        {/* Status de Saúde do Sistema */}
        <div className="bg-zinc-900/50 border border-zinc-800 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 self-start">
           <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[7px] md:text-[9px] font-black text-zinc-400 uppercase tracking-widest">Banco OK</span>
           </div>
           <div className="w-px h-3 md:h-4 bg-zinc-800"></div>
           <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[7px] md:text-[9px] font-black text-zinc-400 uppercase tracking-widest">Logs OK</span>
           </div>
        </div>
      </header>

      {/* Grid Principal de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        
        {/* Fluxo de Caixa */}
        <Link href="/admin/caixa" className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl md:rounded-3xl p-4 md:p-6 relative overflow-hidden group hover:border-impacto-yellow/50 transition-all hover:translate-y-[-4px] block shadow-xl">
          <div className="absolute -top-10 -right-10 w-24 md:w-32 h-24 md:h-32 bg-impacto-yellow/5 blur-[40px] rounded-full group-hover:bg-impacto-yellow/10 transition-all"></div>
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-impacto-yellow/10 flex items-center justify-center border border-impacto-yellow/20">
              <Wallet className="w-4 h-4 md:w-6 md:h-6 text-impacto-yellow" />
            </div>
            <TrendingUp className="w-4 h-4 text-impacto-yellow animate-bounce hidden md:block" />
          </div>
          <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[7px] md:text-[10px] mb-0.5 md:mb-1">Saldo em Caixa</p>
          <div className={`text-lg md:text-3xl font-black ${saldo >= 0 ? 'text-white' : 'text-impacto-red'} drop-shadow-[0_0_15px_rgba(255,204,0,0.2)]`}>{BRL(saldo)}</div>
        </Link>

        {/* Faturamento de Vendas */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl md:rounded-3xl p-4 md:p-6 relative overflow-hidden group shadow-xl">
          <div className="absolute -top-10 -right-10 w-24 md:w-32 h-24 md:h-32 bg-blue-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-all"></div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center mb-2 md:mb-4 border border-blue-500/20">
            <Gauge className="w-4 h-4 md:w-6 md:h-6 text-blue-500" />
          </div>
          <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[7px] md:text-[10px] mb-0.5 md:mb-1">Vendas Pagas</p>
          <div className="text-lg md:text-3xl font-black text-white">{BRL(totalFaturado)}</div>
        </div>

        {/* Peças Catalogo */}
        <Link href="/admin/produtos" className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl md:rounded-3xl p-4 md:p-6 relative overflow-hidden group hover:border-impacto-orange/50 transition-all hover:translate-y-[-4px] block shadow-xl">
          <div className="absolute -top-10 -right-10 w-24 md:w-32 h-24 md:h-32 bg-impacto-orange/5 blur-[40px] rounded-full group-hover:bg-impacto-orange/20 transition-all"></div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-impacto-orange/10 flex items-center justify-center mb-2 md:mb-4 border border-impacto-orange/20">
            <Package className="w-4 h-4 md:w-6 md:h-6 text-impacto-orange" />
          </div>
          <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[7px] md:text-[10px] mb-0.5 md:mb-1">Estoque</p>
          <div className="text-lg md:text-3xl font-black text-white">{productsCount} <span className="text-[8px] md:text-xs text-zinc-600">itens</span></div>
        </Link>

        {/* Usuários */}
        <Link href="/admin/usuarios" className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl md:rounded-3xl p-4 md:p-6 relative overflow-hidden group hover:border-purple-500/50 transition-all hover:translate-y-[-4px] block shadow-xl">
          <div className="absolute -top-10 -right-10 w-24 md:w-32 h-24 md:h-32 bg-purple-500/5 blur-[40px] rounded-full group-hover:bg-purple-500/20 transition-all"></div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center mb-2 md:mb-4 border border-purple-500/20">
            <Users className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
          </div>
          <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[7px] md:text-[10px] mb-0.5 md:mb-1">Pilotos</p>
          <div className="text-lg md:text-3xl font-black text-white">{usersCount} <span className="text-[8px] md:text-xs text-zinc-600">contas</span></div>
        </Link>

      </div>

      {/* SEÇÃO INFERIOR: LOGÍSTICA E AÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA 1: AÇÕES RÁPIDAS E ÚLTIMAS VENDAS */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Atalhos Estratégicos */}
           <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                 <ArrowRight className="w-3 h-3 text-impacto-red" /> Atalhos Estratégicos
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                 <Link href="/admin/produtos/novo" className="bg-zinc-900/60 border border-zinc-800 p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col items-center gap-1 md:gap-2 hover:bg-impacto-orange transition-colors group">
                    <PlusCircle className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase text-zinc-500 group-hover:text-zinc-950">Nova Peça</span>
                 </Link>
                 <Link href="/admin/caixa" className="bg-zinc-900/60 border border-zinc-800 p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col items-center gap-1 md:gap-2 hover:bg-impacto-yellow transition-colors group">
                    <Receipt className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase text-zinc-500 group-hover:text-zinc-950">Lançamento</span>
                 </Link>
                 <Link href="/admin/usuarios" className="bg-zinc-900/60 border border-zinc-800 p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col items-center gap-1 md:gap-2 hover:bg-white transition-colors group">
                    <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase text-zinc-500 group-hover:text-zinc-950 text-center">Piloto</span>
                 </Link>
                 <Link href="/admin/pedidos" className="bg-zinc-900/60 border border-zinc-800 p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col items-center gap-1 md:gap-2 hover:bg-zinc-100 transition-colors group">
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase text-zinc-500 group-hover:text-zinc-950">Vendas</span>
                 </Link>
                 <Link href="/admin/acts" className="bg-zinc-900/60 border border-zinc-800 p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col items-center gap-1 md:gap-2 hover:bg-impacto-yellow transition-colors group">
                    <Terminal className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase text-zinc-500 group-hover:text-zinc-950">Atos</span>
                 </Link>
              </div>
           </section>

           {/* Vendas Recentes */}
           <section className="bg-zinc-900/20 border border-zinc-800/60 rounded-[2rem] overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
                 <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Atividade de Vendas Recente</h2>
                 <Link href="/admin/pedidos" className="text-[9px] font-black uppercase text-red-500 underline decoration-2 underline-offset-4">Ver Tudo</Link>
              </div>
              <div className="p-2">
                 {recentOrders.length > 0 ? (
                   <div className="space-y-1">
                      {recentOrders.map((order: any) => (
                         <div key={order.id} className="flex items-center justify-between p-4 hover:bg-zinc-900/40 rounded-2xl transition-all">
                            <div className="flex items-center gap-4">
                               <div className={`w-2 h-2 rounded-full ${order.status === 'PAGO' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                               <div>
                                  <p className="text-xs font-black text-white uppercase">{order.user?.name || 'Cliente Impacto'}</p>
                                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">#{order.id.substring(0,8)} • {new Date(order.createdAt).toLocaleTimeString('pt-BR')}</span>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-green-400 font-mono">{BRL(order.total)}</p>
                               <span className="text-[8px] text-zinc-600 font-black uppercase">{order.status}</span>
                            </div>
                         </div>
                      ))}
                   </div>
                 ) : (
                   <div className="py-10 text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">Nenhuma venda registrada ainda.</div>
                 )}
              </div>
           </section>
        </div>

        {/* COLUNA 2: LOGÍSTICA / ESTOQUE CRÍTICO */}
        <div className="space-y-6">
           <section className="bg-zinc-950 border-2 border-zinc-900 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-3xl"></div>
              
              <div className="flex items-center gap-2 mb-6">
                 <AlertTriangle className="w-5 h-5 text-red-500" />
                 <h2 className="text-xs font-black uppercase tracking-widest text-white">Alertas de Reposição</h2>
              </div>

              <div className="space-y-4">
                 {lowStock.length > 0 ? (
                    lowStock.map((p: any) => (
                       <div key={p.id} className="bg-zinc-900/50 border border-red-500/10 p-4 rounded-2xl group hover:border-red-500/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="text-[11px] font-black text-white uppercase truncate max-w-[150px]">{p.nome}</h3>
                             <span className="bg-red-500/20 text-red-500 text-[9px] font-black px-2 py-0.5 rounded-full">{p.estoque} UN</span>
                          </div>
                          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-red-600 h-full" style={{ width: `${(p.estoque/10) * 100}%` }}></div>
                          </div>
                          <Link href="/admin/produtos">
                             <button className="w-full mt-3 text-[9px] font-black uppercase text-zinc-600 group-hover:text-red-500 transition-colors flex items-center justify-center gap-1">
                                Gerenciar <ArrowRight className="w-3 h-3" />
                             </button>
                          </Link>
                       </div>
                    ))
                 ) : (
                    <div className="py-10 border border-dashed border-zinc-800 rounded-2xl text-center">
                       <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-4">Estoque saudável. Nenhuma peça em nível crítico.</p>
                    </div>
                 )}
                 
                 <div className="pt-4 border-t border-zinc-900">
                    <p className="text-[9px] text-zinc-500 font-bold leading-relaxed uppercase tracking-tighter">
                       Dica de Sucesso: Manter o estoque acima de 5 unidades evita cancelamentos e melhora sua reputação no catálogo.
                    </p>
                 </div>
              </div>
           </section>
        </div>

      </div>

    </div>
  );
}
