'use client';

import React from 'react';
import { ShoppingCart, CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

type Produto = {
  id: string;
  categoria: string;
  nome: string;
  compatibilidade: string;
  preco: number;
  imagem: string | null;
  estoque: number;
};

interface ProdutoCardProps {
  produto: Produto;
  isAdded: boolean;
  onAdicionar: (p: Produto) => void;
  BRL: (v: number) => string;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }
};

const ProdutoCard = React.memo(({ produto, isAdded, onAdicionar, BRL }: ProdutoCardProps) => {
  return (
    <motion.div 
      variants={cardVariants}
      className="bg-zinc-900/80 low-perf-blur border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col hover:border-red-600/50 transition-colors group relative shadow-lg"
    >
      {/* Imagem Container - Link para detalhes */}
      <Link href={`/produtos/${produto.id}`} className="block relative">
        <div className="bg-white/5 h-40 flex items-center justify-center p-4 overflow-hidden relative">
          {produto.imagem ? (
            <motion.div
              whileHover={{ scale: 1.15, rotate: 2 }}
              transition={{ duration: 0.2 }}
              className="relative h-full w-full"
            >
              <Image
                src={produto.imagem}
                alt={produto.nome}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            </motion.div>
          ) : (
            <Package className="w-12 h-12 text-zinc-500 opacity-20" />
          )}
          
          {/* Efeito Glow Gradiente nas bordas da imagem */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-900/80 to-transparent"></div>
        </div>
      </Link>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1 relative z-10">
        <span className="text-[9px] uppercase font-black text-red-500 tracking-widest bg-red-500/10 inline-block px-1.5 py-0.5 rounded mb-2 w-max">{produto.categoria}</span>
        <Link href={`/produtos/${produto.id}`}>
          <h2 className="text-sm font-bold text-white leading-tight mb-1.5 group-hover:text-red-400 transition-colors line-clamp-2">{produto.nome}</h2>
        </Link>
        <div className="flex flex-col gap-1 mb-4 flex-1">
          <p className="text-[11px] text-zinc-500 line-clamp-1 group-hover:line-clamp-none transition-all">Serve em: <span className="text-zinc-400">{produto.compatibilidade}</span></p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${produto.estoque > 5 ? 'bg-green-500' : produto.estoque > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-600'}`}></div>
            <span className={`text-[10px] font-bold ${produto.estoque > 5 ? 'text-zinc-400' : produto.estoque > 0 ? 'text-yellow-500' : 'text-zinc-600'}`}>
              {produto.estoque > 0 ? `${produto.estoque} disponíveis` : 'ESGOTADO'}
            </span>
          </div>
        </div>
        
        <div className="flex items-end justify-between mt-auto">
          <span className={`font-black text-lg md:text-xl ${produto.estoque > 0 ? 'text-green-400' : 'text-zinc-600'}`}>
            {BRL(produto.preco)}
          </span>
          <motion.button
            whileHover={produto.estoque > 0 ? { scale: 1.1 } : {}}
            whileTap={produto.estoque > 0 ? { scale: 0.95 } : {}}
            onClick={() => produto.estoque > 0 && onAdicionar(produto)}
            disabled={produto.estoque <= 0}
            className={`relative p-3 rounded-xl transition-all shadow-lg overflow-hidden border-2 ${
              isAdded ? 'bg-green-600 border-green-400 text-white' : 
              produto.estoque > 0 ? 'bg-zinc-900 border-impacto-yellow text-impacto-yellow hover:bg-impacto-yellow hover:text-zinc-950' : 
              'bg-zinc-950 border-zinc-800 text-zinc-700 cursor-not-allowed'
            }`}
            title={produto.estoque > 0 ? "Adicionar ao carrinho" : "Produto esgotado"}
          >
            <AnimatePresence mode="popLayout">
              {isAdded ? (
                 <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                   <CheckCircle2 className="w-5 h-5" />
                 </motion.div>
              ) : (
                 <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                   <ShoppingCart className="w-5 h-5" />
                 </motion.div>
              )}
            </AnimatePresence>

            {/* Shimmer interno do botaozinho */}
            {!isAdded && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

ProdutoCard.displayName = 'ProdutoCard';

export default ProdutoCard;
