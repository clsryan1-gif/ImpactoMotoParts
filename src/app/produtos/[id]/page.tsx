'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingCart, CheckCircle2, Package, ShieldCheck, Zap, ArrowLeft, Info } from 'lucide-react';

type Produto = {
  id: string;
  categoria: string;
  nome: string;
  compatibilidade: string;
  preco: number;
  imagem: string | null;
  estoque: number;
};

export default function ProdutoDetalhePage() {
  const { id } = useParams();
  const router = useRouter();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/produtos/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduto(data);
        } else {
          router.push('/produtos');
        }
      } catch (e) {
        // Erro silencioso
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const adicionarAoCarrinho = () => {
    if (!produto) return;
    const salvo = localStorage.getItem('@impacto-carrinho');
    let carrinho = salvo ? JSON.parse(salvo) : [];
    carrinho.push(produto);
    localStorage.setItem('@impacto-carrinho', JSON.stringify(carrinho));
    
    // Avisar outros componentes
    window.dispatchEvent(new Event('cart-updated'));

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Zap className="w-12 h-12 text-impacto-orange animate-pulse" />
        <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px] mt-4">Acelerando motor...</p>
      </div>
    );
  }

  if (!produto) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 overflow-x-hidden">
      
      {/* HEADER SIMPLIFICADO */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/produtos" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Voltar ao Catálogo</span>
          </Link>
          <Link href="/checkout" className="bg-zinc-900 p-2 rounded-xl relative group">
             <ShoppingCart className="w-5 h-5 text-zinc-400 group-hover:text-impacto-yellow transition-colors" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 md:pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* LADO ESQUERDO: IMAGEM */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
            className="relative group aspect-square bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[3rem] overflow-hidden flex items-center justify-center p-8 md:p-16 shadow-2xl"
          >
            {/* Efeitos de Fundo na Imagem */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)]"></div>
            
            {produto.imagem ? (
              <div className="relative w-full h-full">
                <Image 
                  src={produto.imagem} 
                  alt={produto.nome} 
                  fill 
                  className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
            ) : (
              <Package className="w-32 h-32 text-zinc-800" />
            )}

            {/* Badge de Categoria Flutuante */}
            <div className="absolute top-8 left-8">
              <span className="bg-impacto-orange text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                {produto.categoria}
              </span>
            </div>
          </motion.div>

          {/* LADO DIREITO: INFO */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col h-full justify-center"
          >
            <div className="space-y-4 mb-8">
              <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-black-ops)] tracking-tighter leading-none">
                {produto.nome.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 !== 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-impacto-yellow to-impacto-orange' : ''}>{word} </span>
                ))}
              </h1>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Preço Elite</span>
                   <span className="text-4xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">{BRL(produto.preco)}</span>
                </div>
                <div className="h-10 w-px bg-zinc-800"></div>
                <div className="flex flex-col">
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Status de Box</span>
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${produto.estoque > 5 ? 'bg-green-500' : 'bg-impacto-yellow animate-pulse'}`}></div>
                      <span className="text-xs font-black text-white">{produto.estoque > 0 ? `${produto.estoque} UN DISPONÍVEIS` : 'ESGOTADO'}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* BOX DE INFORMAÇÕES TÉCNICAS */}
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem] space-y-6 mb-10 overflow-hidden relative">
               <div className="absolute -right-10 -bottom-10 opacity-[0.03] scale-150 rotate-12">
                  <Zap className="w-40 h-40 text-impacto-yellow" />
               </div>

               <div>
                 <h3 className="text-[10px] font-black text-impacto-yellow uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" /> Compatibilidade Garantida
                 </h3>
                 <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                   Esta peça foi rigorosamente testada pela equipe **IMPACTO** e é 100% compatível com: <span className="text-white font-black">{produto.compatibilidade}</span>.
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-4 pb-2">
                 <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Garantia</span>
                    <span className="text-xs font-black">90 DIAS NACIONAL</span>
                 </div>
                 <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Envio</span>
                    <span className="text-xs font-black">IMEDIATO (BOX 24H)</span>
                 </div>
               </div>
            </div>

            {/* AÇÕES */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={adicionarAoCarrinho}
                disabled={produto.estoque <= 0}
                className={`flex-1 relative overflow-hidden group/btn py-6 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                  added ? 'bg-green-600' : 'bg-gradient-to-r from-impacto-yellow to-impacto-orange text-zinc-950'
                } font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 disabled:grayscale`}
              >
                <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
                {added ? (
                  <> <CheckCircle2 className="w-6 h-6" /> ADICIONADO! </>
                ) : (
                   <> <ShoppingCart className="w-6 h-6" /> {produto.estoque > 0 ? 'ADICIONAR AO BOX' : 'FORA DE ESTOQUE'} </>
                )}
              </motion.button>

              <Link href="/checkout" className="flex-1">
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full h-full py-6 rounded-2xl flex items-center justify-center border-2 border-zinc-800 hover:border-impacto-orange/50 transition-colors uppercase font-black tracking-widest text-xs"
                >
                  Ir para Checkout
                </motion.button>
              </Link>
            </div>

            {/* DICA DE ESPECIALISTA */}
            <div className="mt-8 flex items-start gap-3 p-4 bg-zinc-900/20 border-l-4 border-impacto-red rounded-r-xl">
               <Info className="w-5 h-5 text-impacto-red shrink-0" />
               <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase">
                 <span className="text-white">DICA DO RYAN:</span> Use sempre mão de obra qualificada para instalação de peças de alta performance. Garanta o máximo da sua máquina.
               </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* FOOTER ESPAÇADOR */}
      <div className="py-20"></div>

    </div>
  );
}
