'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ShoppingCart, Search, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProdutoCard from '@/components/ProdutoCard';
import { ProductSkeleton, CategorySkeleton } from '@/components/ProductSkeleton';
import Header from '@/components/Header';

// ===================================================
// Catálogo de Produtos
type Produto = {
  id: string; // ID do Prisma é String
  categoria: string;
  nome: string;
  compatibilidade: string;
  preco: number;
  imagem: string | null;
  estoque: number; // Campo de estoque adicionado
};
// ===================================================

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Variantes de animação para os cards
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export default function ProdutosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Carregar produtos do banco
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/produtos');
        if (res.ok) {
          const data = await res.json();
          setProdutos(data);
        }
      } catch (e) {
        console.error("Erro ao buscar produtos:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categorias = useMemo(
    () => ['Todas', ...Array.from(new Set(produtos.map(p => p.categoria)))],
    [produtos]
  );

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase();
    return produtos.filter(p => {
      const bateCategoria = categoria === 'Todas' || p.categoria === categoria;
      const bateBusca = p.nome.toLowerCase().includes(q) || p.compatibilidade.toLowerCase().includes(q);
      return bateCategoria && bateBusca;
    });
  }, [busca, categoria, produtos]);

  // Sincronizar carrinho com localStorage na inicialização e nas mudanças
  useEffect(() => {
    const carregarCarrinho = () => {
      const salvo = localStorage.getItem('@impacto-carrinho');
      if (salvo) {
        try {
          setCarrinho(JSON.parse(salvo));
        } catch (e) {}
      }
    };

    carregarCarrinho();

    // Sincronizar entre abas
    const handleStorage = (e: StorageEvent) => {
      if (e.key === '@impacto-carrinho') carregarCarrinho();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const adicionar = useCallback((p: Produto) => {
    setCarrinho(prev => {
      const novo = [...prev, p];
      localStorage.setItem('@impacto-carrinho', JSON.stringify(novo));
      return novo;
    });
    
    // Feedback visual temporário de adição
    setAddedItem(p.id);
    setTimeout(() => setAddedItem(null), 1500);
  }, []);


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20 overflow-x-hidden relative">

      {/* BACKGROUND EFFECTS - OTIMIZADO */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[80px] mix-blend-screen"></div>
         <div className="absolute -bottom-[10%] -left-[5%] w-[400px] h-[400px] bg-impacto-orange/10 rounded-full blur-[60px] mix-blend-screen"></div>
      </div>

      {/* BUSCA MOBILE */}
      <motion.div 
        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.2 }}
        className="md:hidden px-4 pt-4 relative z-10"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar peça..."
            className="w-full bg-zinc-900/80 border border-zinc-700/50 glass-premium rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-all"
          />
        </div>
      </motion.div>

      {/* PAGE TITLE */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4 relative z-10">
        <Link href="/">
          <motion.div whileHover={{ x: -5 }} className="inline-flex items-center gap-1 text-red-500 text-sm font-semibold mb-6 hover:text-red-400 transition-colors">
            <ChevronLeft className="w-4 h-4" /> INÍCIO
          </motion.div>
        </Link>
        <motion.h1 
          initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
          className="text-4xl md:text-6xl font-black font-[family-name:var(--font-black-ops)] tracking-tighter"
          suppressHydrationWarning
        >
          CATÁLOGO <span className="text-racing-gradient">IMPACTO</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }} className="text-zinc-500 text-sm mt-2 font-medium">
          {filtrados.length} {filtrados.length === 1 ? 'peça encontrada' : 'peças encontradas'}
        </motion.p>
      </div>

      {/* FILTROS CATEGORIA */}
      <div className="max-w-7xl mx-auto px-4 pb-8 relative z-10">
        {loading ? (
          <CategorySkeleton />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide py-1">
            {categorias.map(cat => {
             const isActive = categoria === cat;
             return (
               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 key={cat}
                 onClick={() => setCategoria(cat)}
                 className={`relative whitespace-nowrap px-8 py-3 rounded-xl text-xs font-black border transition-all shrink-0 overflow-hidden tracking-widest uppercase ${
                   isActive ? 'text-zinc-950 border-transparent shadow-[0_0_20px_rgba(255,102,0,0.3)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-impacto-yellow/50 hover:text-white'
                 }`}
               >
                 {isActive && (
                   <motion.div 
                     layoutId="activeCategory" 
                     className="absolute inset-0 bg-gradient-to-r from-impacto-yellow to-impacto-orange"
                     transition={{ duration: 0.2 }}
                   />
                 )}
                 <span className="relative z-10 tracking-wide">{cat}</span>
               </motion.button>
            );
          })}
        </div>
      )}
    </div>

      {/* GRID */}
      <main className="max-w-7xl mx-auto px-4 relative z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </motion.div>
          ) : filtrados.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-32 text-zinc-500 flex flex-col items-center justify-center bg-zinc-900/30 border border-zinc-800/50 rounded-3xl"
            >
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">Nenhum talento encontrado pra essa busca.</p>
              <button onClick={() => { setBusca(''); setCategoria('Todas'); }} className="mt-4 text-red-500 font-bold uppercase tracking-wider text-sm hover:text-red-400 underline decoration-2 underline-offset-4">
                Ver todo o estoque
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              variants={containerVariants}
              initial="hidden" animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {filtrados.map((p) => (
                <ProdutoCard 
                  key={p.id} 
                  produto={p} 
                  isAdded={addedItem === p.id} 
                  onAdicionar={adicionar} 
                  BRL={BRL} 
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* CARRINHO FLUTUANTE (FAB) */}
      <AnimatePresence>
        {carrinho.length > 0 && (
          <Link href="/checkout">
            <motion.div 
              initial={{ scale: 0, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, y: 100, opacity: 0 }}
              whileHover={{ scale: 1.1, rotate: -3 }}
              whileTap={{ scale: 0.9 }}
              className="fixed bottom-8 right-8 z-[60] flex items-center justify-center"
            >
              {/* Glow Pulsante de fundo */}
              <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              
              <button className="relative bg-red-600 hover:bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] border-2 border-white/20 transition-colors group">
                <ShoppingCart className="w-7 h-7" />
                
                {/* Contador de Itens Flutuante */}
                <motion.span 
                  key={carrinho.length}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 bg-white text-red-600 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-red-600"
                >
                  {carrinho.length}
                </motion.span>

                {/* Texto explicativo lateral que surge no hover */}
                <span className="absolute right-full mr-4 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-black px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tracking-widest uppercase">
                  Finalizar Pedido
                </span>
              </button>
            </motion.div>
          </Link>
        )}
      </AnimatePresence>

    </div>
  );
}
