'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X, Save, Zap, Package, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

type Produto = {
  id: string;
  nome: string;
  categoria: string;
  compatibilidade: string;
  preco: number;
  imagem: string | null;
  estoque: number;
  ativo: boolean;
};

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function InventoryList({ produtos: initialProdutos }: { produtos: Produto[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Produto>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mantém sincronia se as props mudarem
  React.useEffect(() => {
    setProdutos(initialProdutos);
  }, [initialProdutos]);

  const startEdit = (p: Produto) => {
    setEditId(p.id);
    setEditData({ ...p });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/produtos/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao salvar');
      }

      const updatedProduct = await res.json();
      showToast('Alterações salvas com sucesso!', 'success');
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduto = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/produtos/${id}`, { method: 'DELETE' });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao excluir');
      }

      // Remove instantaneamente da interface
      setProdutos(prev => prev.filter(p => p.id !== id));
      showToast('Produto removido do inventário!', 'success');
      setDeletingId(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleAtivo = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/produtos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !currentStatus }),
      });
      
      if (!res.ok) throw new Error('Erro ao alterar visibilidade');

      setProdutos(prev => prev.map(p => p.id === id ? { ...p, ativo: !currentStatus } : p));
      showToast(!currentStatus ? 'Produto visível no catálogo!' : 'Produto ocultado do catálogo!', 'info');
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao alterar visibilidade.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            onClick={() => setDeletingId(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-zinc-900 border border-red-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-center text-white mb-2">Excluir Produto?</h3>
              <p className="text-zinc-500 text-sm text-center mb-8">Esta ação não pode ser desfeita. O produto será removido permanentemente do banco de dados.</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDeletingId(null)} className="py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white font-bold text-sm tracking-wide transition">
                  Cancelar
                </button>
                <button
                  onClick={() => deleteProduto(deletingId)}
                  disabled={loading}
                  className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm tracking-wide transition disabled:opacity-50"
                >
                  {loading ? 'Excluindo...' : 'EXCLUIR'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Edição */}
      <AnimatePresence>
        {editId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            onClick={cancelEdit}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={cancelEdit} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-red-500" /> Editar Peça
              </h3>

              <div className="space-y-3">
                {[
                  { label: 'Nome', key: 'nome', type: 'text', placeholder: 'Nome do produto' },
                  { label: 'Categoria', key: 'categoria', type: 'text', placeholder: 'Ex: Lubrificantes' },
                  { label: 'Compatibilidade', key: 'compatibilidade', type: 'text', placeholder: 'Universal / CG 160' },
                  { label: 'URL da Imagem', key: 'imagem', type: 'url', placeholder: 'https://...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">{f.label}</label>
                    <input
                      type={f.type}
                      value={(editData as any)[f.key] ?? ''}
                      onChange={e => setEditData(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Preço (R$)</label>
                    <input
                      type="number" step="0.01"
                      value={editData.preco ?? ''}
                      onChange={e => setEditData(prev => ({ ...prev, preco: parseFloat(e.target.value) }))}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors font-mono text-green-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Estoque (un)</label>
                    <input
                      type="number" min="0"
                      value={editData.estoque ?? ''}
                      onChange={e => setEditData(prev => ({ ...prev, estoque: parseInt(e.target.value, 10) }))}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={cancelEdit} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white font-bold text-sm transition">
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm tracking-wide transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Zap className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Salvando...' : 'SALVAR'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      <div className="space-y-3">
        {produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl text-center gap-3">
            <Package className="w-10 h-10 opacity-20" />
            <p className="text-sm">Nenhuma peça cadastrada ainda.</p>
          </div>
        ) : (
          produtos.map(p => {
            const estoquePercent = Math.min(100, (p.estoque / 100) * 100);
            const estoqueAbaixo = p.estoque < 10;
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl flex items-center gap-4 hover:border-red-500/30 transition-all group [content-visibility:auto] [contain-intrinsic-size:80px] ${!p.ativo ? 'opacity-50 grayscale-[0.5]' : ''}`}
              >
                {/* Imagem */}
                <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center p-1 shrink-0 overflow-hidden border border-white/5 relative">
                  {!p.ativo && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <EyeOff className="w-6 h-6 text-zinc-400" />
                    </div>
                  )}
                  {p.imagem
                    ? <img src={p.imagem} alt={p.nome} className="w-full h-full object-contain" />
                    : <Package className="w-6 h-6 text-zinc-600" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{p.categoria}</span>
                  <h3 className="text-sm font-bold text-white truncate pr-2">{p.nome}</h3>
                  <p className="text-[10px] text-zinc-500">Compat.: {p.compatibilidade}</p>
                  <div className="flex items-center gap-2">
                    {estoqueAbaixo && <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0" />}
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${estoqueAbaixo ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${estoquePercent}%` }}></div>
                    </div>
                    <span className={`text-[10px] font-bold tabular-nums ${estoqueAbaixo ? 'text-yellow-500' : 'text-zinc-400'}`}>{p.estoque} un</span>
                  </div>
                </div>

                {/* Preço + Ações */}
                <div className="flex flex-col items-end gap-3 shrink-0 pl-3 border-l border-zinc-800">
                  <div className="text-green-400 font-mono font-bold text-base">{BRL(p.preco)}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAtivo(p.id, p.ativo)}
                      className={`p-2 rounded-lg transition-colors ${p.ativo ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}
                      title={p.ativo ? "Ocultar do Catálogo" : "Mostrar no Catálogo"}
                    >
                      {p.ativo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => startEdit(p)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(p.id)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </>
  );
}
