'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Zap, ImageIcon } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ProductForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [compatibilidade, setCompatibilidade] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [estoque, setEstoque] = useState('10');

  const criarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const precoNum = parseFloat(preco);
    const estoqueNum = parseInt(estoque, 10);

    if (isNaN(precoNum) || isNaN(estoqueNum)) {
      showToast('Preço ou estoque inválido.', 'error');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, 
          categoria, 
          compatibilidade, 
          preco: precoNum, 
          imagem, 
          estoque: estoqueNum
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao criar produto.');
      }

      showToast('Produto cadastrado com sucesso!', 'success');
      setNome(''); setCategoria(''); setCompatibilidade(''); setPreco(''); setImagem('');
      router.push('/admin/produtos');
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar produto.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full xl:w-[450px] bg-zinc-900/60 backdrop-blur-xl border border-red-500/20 p-6 rounded-3xl shadow-2xl relative order-1 xl:order-2 shrink-0">
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 blur-[50px] rounded-full pointer-events-none"></div>

      <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-red-500" /> Nova Peça
      </h2>
      
      <form onSubmit={criarProduto} className="space-y-4 relative z-10">
         <div>
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Nome do Produto</label>
          <input required type="text" value={nome} onChange={e => setNome(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-700" placeholder="Ex: Guidão Oco Esportivo" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Categoria</label>
            <input required type="text" value={categoria} onChange={e => setCategoria(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-700" placeholder="Acessórios" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Estoque</label>
            <input required type="number" min="0" value={estoque} onChange={e => setEstoque(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 transition-colors" />
          </div>
        </div>

         <div>
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Compatibilidade</label>
          <input required type="text" value={compatibilidade} onChange={e => setCompatibilidade(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-700" placeholder="Universal / CG 160" />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="col-span-1">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Preço (R$)</label>
            <input required type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-700 font-mono text-green-400" placeholder="0.00" />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block flex items-center justify-between">
              Imagem do Produto <ImageIcon className="w-3 h-3" />
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={imagem} 
                onChange={e => setImagem(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-700 font-mono text-xs" 
                placeholder="URL da imagem ou faça upload ->" 
              />
              <label className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors border border-zinc-700 group">
                <Plus className="w-5 h-5 group-hover:text-red-500" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Limite de 4MB para Vercel
                    if (file.size > 4 * 1024 * 1024) {
                      showToast('Arquivo muito grande. Limite de 4MB.', 'error');
                      return;
                    }

                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                       console.log("Iniciando upload V2...");
                       showToast('Enviando foto...', 'info');
                       const res = await fetch('/api/admin/upload', {
                         method: 'POST',
                         body: formData
                       });

                       if (!res.ok) {
                         const errData = await res.json();
                         throw new Error(errData.message || 'Erro no servidor Supabase');
                       }
                       const data = await res.json();
                       setImagem(data.url);
                       showToast('Foto enviada com sucesso!', 'success');
                     } catch (err: any) {
                       console.error("Erro no upload V2:", err);
                       showToast('Erro ao enviar foto (V2): ' + (err.message || 'Sem detalhes'), 'error');
                     }
                  }}
                />
              </label>
            </div>
            {imagem && (
              <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                <img src={imagem} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>

        <button disabled={loading} className="w-full mt-4 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-black tracking-widest text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]">
          {loading ? <Zap className="w-4 h-4 animate-pulse" /> : <Plus className="w-4 h-4" />} 
          {loading ? 'Cadastrando no banco...' : 'CADASTRAR PEÇA'}
        </button>
      </form>
    </div>
  );
}
