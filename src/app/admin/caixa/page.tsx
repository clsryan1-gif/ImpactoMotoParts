'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Receipt, PlusCircle, MinusCircle, Wallet, History, TrendingUp, Filter, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Transaction = {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  valor: number;
  descricao: string;
  categoria: string;
  data: string;
};

type Summary = {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
};

export default function AdminCaixaPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<{ transactions: Transaction[], summary: Summary } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modais e Form
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTrans, setNewTrans] = useState({ tipo: 'SAIDA' as 'ENTRADA' | 'SAIDA', valor: '', descricao: '', categoria: 'REPOSICAO' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCaixa = async () => {
    try {
      const res = await fetch('/api/admin/caixa');
      const json = await res.json();
      setData(json);
    } catch (err) {
      showToast('Erro ao carregar caixa', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaixa();
  }, []);

  const handleAddTransaction = async () => {
    if (!newTrans.valor || !newTrans.descricao) return;
    setLoading(true);
    try {
      const url = isEditing ? `/api/admin/caixa/${editingId}` : '/api/admin/caixa';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrans),
      });
      if (!res.ok) throw new Error();
      
      showToast(isEditing ? 'Lançamento atualizado!' : 'Movimentação registrada!', 'success');
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      setNewTrans({ tipo: 'SAIDA', valor: '', descricao: '', categoria: 'REPOSICAO' });
      fetchCaixa();
    } catch {
      showToast('Erro ao processar alteração', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/caixa/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Lançamento excluído!', 'success');
      setDeletingId(null);
      fetchCaixa();
    } catch {
      showToast('Erro ao excluir', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (t: Transaction) => {
    setNewTrans({
      tipo: t.tipo,
      valor: t.valor.toString(),
      descricao: t.descricao,
      categoria: t.categoria
    });
    setEditingId(t.id);
    setIsEditing(true);
    setShowForm(true);
  };

  if (loading && !data) return <div className="p-20 text-center animate-pulse text-zinc-500 uppercase font-black tracking-widest">Acessando Cofre...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            Fluxo de Caixa
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">Controle financeiro, entradas e saídas da oficina.</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => {setNewTrans(p => ({...p, tipo: 'ENTRADA', categoria: 'OUTROS'})); setShowForm(true);}}
            className="bg-green-600/10 hover:bg-green-600/20 text-green-500 border border-green-500/20 px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase tracking-tighter text-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Entrada
          </button>
          <button 
            onClick={() => {setNewTrans(p => ({...p, tipo: 'SAIDA', categoria: 'REPOSICAO'})); setShowForm(true);}}
            className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase tracking-tighter text-xs transition-all"
          >
            <MinusCircle className="w-4 h-4" /> Retirada
          </button>
        </div>
      </header>

      {/* Cartões de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -z-10 group-hover:bg-green-500/10 transition-colors"></div>
          <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
            <ArrowUpCircle className="w-4 h-4 text-green-500" /> Faturamento Bruto
          </div>
          <div className="text-3xl font-black text-white">{BRL(data?.summary.totalEntradas || 0)}</div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -z-10 group-hover:bg-red-500/10 transition-colors"></div>
          <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
            <ArrowDownCircle className="w-4 h-4 text-red-500" /> Despesas / Saídas
          </div>
          <div className="text-3xl font-black text-white">{BRL(data?.summary.totalSaidas || 0)}</div>
        </div>

        <div className="bg-zinc-950 border-2 border-zinc-800 p-6 rounded-3xl relative overflow-hidden group shadow-2xl">
          <div className={`absolute top-0 right-0 w-32 h-32 ${(data?.summary.saldo || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} blur-3xl -z-10`}></div>
          <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
            <Wallet className={`w-4 h-4 ${(data?.summary.saldo || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} /> Saldo Disponível
          </div>
          <div className={`text-4xl font-black ${(data?.summary.saldo || 0) >= 0 ? 'text-green-500' : 'text-red-500'} drop-shadow-[0_0_15px_rgba(34,197,94,0.2)]`}>
            {BRL(data?.summary.saldo || 0)}
          </div>
        </div>
      </div>

      {/* Histórico Recente */}
      <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-[2.5rem] overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <History className="w-4 h-4" /> Histórico de Lançamentos
          </h2>
          <div className="bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <Filter className="w-3 h-3" /> Transações Recentes
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em]">
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2">Descrição</th>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {data?.transactions.map((t) => (
                <tr key={t.id} className="group hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-4 text-xs font-bold text-zinc-500 bg-zinc-900/30 rounded-l-2xl border-y border-l border-zinc-800/50">
                    {new Date(t.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-4 text-xs font-black text-white bg-zinc-900/30 border-y border-zinc-800/50">
                    {t.descricao}
                  </td>
                  <td className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-900/30 border-y border-zinc-800/50">
                    <span className={`px-2 py-1 rounded bg-zinc-950 border border-zinc-800 ${t.tipo === 'ENTRADA' ? 'text-green-500/70' : 'text-orange-500/70'}`}>
                      {t.categoria}
                    </span>
                  </td>
                  <td className={`px-4 py-4 text-sm font-black text-right bg-zinc-900/30 border-y border-zinc-800/50 ${t.tipo === 'ENTRADA' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.tipo === 'SAIDA' && '-'} {BRL(t.valor)}
                  </td>
                  <td className="px-4 py-4 text-right bg-zinc-900/30 rounded-r-2xl border-y border-r border-zinc-800/50">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => startEdit(t)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition shadow-lg">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingId(t.id)} className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 transition shadow-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data?.transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-zinc-600 uppercase font-bold tracking-widest text-xs">Aguardando primeira movimentação...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova/Editar Transação */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-zinc-700 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative">
                <header className="mb-8">
                  <h3 className={`text-2xl font-black uppercase tracking-widest flex items-center gap-3 ${newTrans.tipo === 'ENTRADA' ? 'text-green-500' : 'text-red-500'}`}>
                    {isEditing ? <Pencil className="w-8 h-8"/> : (newTrans.tipo === 'ENTRADA' ? <PlusCircle className="w-8 h-8"/> : <MinusCircle className="w-8 h-8"/>)}
                    {isEditing ? 'Alterar Lançamento' : 'Novo Lançamento'}
                  </h3>
                  <p className="text-zinc-500 text-sm mt-1 uppercase font-bold tracking-tighter">
                    {isEditing ? `Corrigindo registro #${editingId?.substring(0,8)}` : `Registrar ${newTrans.tipo.toLowerCase()} no caixa`}
                  </p>
                </header>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-600 mb-2 block tracking-widest">Valor do Lançamento</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={newTrans.valor} 
                      onChange={e => setNewTrans({...newTrans, valor: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-2xl font-black text-white outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-600 mb-2 block tracking-widest">Descrição / Motivo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Pagamento Fornecedor..." 
                      value={newTrans.descricao} 
                      onChange={e => setNewTrans({...newTrans, descricao: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                   <div>
                    <label className="text-[10px] font-black uppercase text-zinc-600 mb-2 block tracking-widest">Categoria</label>
                    <select 
                      value={newTrans.categoria} 
                      onChange={e => setNewTrans({...newTrans, categoria: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="VENDA">VENDA (ENTRADA)</option>
                      <option value="REPOSICAO">REPOSIÇÃO PEÇAS</option>
                      <option value="ALUGUEL">ALUGUEL / LUZ</option>
                      <option value="MARKETING">MARKETING / ANÚNCIOS</option>
                      <option value="OUTROS">OUTROS LANCAMENTOS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button onClick={() => {setShowForm(false); setIsEditing(false);}} className="py-4 rounded-3xl border border-zinc-800 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition">Cancelar</button>
                  <button onClick={handleAddTransaction} disabled={loading} className={`py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] text-white transition disabled:opacity-50 ${newTrans.tipo === 'ENTRADA' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}>
                    {loading ? 'Aguarde...' : 'Confirmar'}
                  </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmação Exclusão */}
      <AnimatePresence>
        {deletingId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-zinc-900 border border-red-500/30 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Remover Lançamento?</h3>
                <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Isso alterará o saldo total do seu caixa permanentemente.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setDeletingId(null)} className="py-4 rounded-2xl border border-zinc-800 text-zinc-500 font-bold hover:text-white transition text-xs tracking-widest uppercase">Cancelar</button>
                  <button onClick={() => handleDelete(deletingId)} disabled={loading} className="py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black transition disabled:opacity-50 text-xs tracking-widest uppercase">Excluir</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
