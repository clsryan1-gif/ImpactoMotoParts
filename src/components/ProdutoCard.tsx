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
      className="glass-premium rounded-2xl overflow-hidden flex flex-col hover:border-impacto-yellow/50 transition-all duration-500 group relative shadow-2xl gpu-accelerated hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] hover:-translate-y-1"
      suppressHydrationWarning
    >
      {/* Imagem Container - Link para detalhes */}
      <Link href={`/produtos/${produto.id}`} className="block relative">
        <div className="bg-gradient-to-b from-white/5 to-transparent aspect-square flex items-center justify-center p-6 overflow-hidden relative grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700">
          {produto.imagem ? (
            <motion.div
              whileHover={{ scale: 1.15, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative h-full w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-10"
            >
              <Image
                src={produto.imagem}
                alt={produto.nome}
                fill
                className="object-contain gpu-accelerated drop-shadow-2xl"
                sizes="(max-width: 768px) 50vw, 20vw"
                quality={100}
                priority
              />
            </motion.div>
          ) : (
            <Package className="w-16 h-16 text-zinc-500 opacity-20" />
          )}
          
          {/* Efeito de Reflexo no Hover (Shimmer) */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-20 pointer-events-none">
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          </div>

          {/* Vinheta suave interna */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-60"></div>
          
          {/* Badge de Esgotado Overlay */}
          {produto.estoque <= 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 flex items-center justify-center">
              <span className="bg-zinc-900 border border-zinc-700 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase">Esgotado</span>
            </div>
          )}
        </div>
      </Link>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1 relative z-10 bg-gradient-to-b from-transparent to-black/20">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[9px] uppercase font-black text-impacto-red tracking-[0.2em] bg-impacto-red/10 inline-block px-2 py-0.5 rounded shadow-[0_0_10px_rgba(220,38,38,0.2)]">{produto.categoria}</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor] ${produto.estoque > 5 ? 'text-green-500 bg-green-500' : produto.estoque > 0 ? 'text-yellow-500 bg-yellow-500 animate-pulse' : 'text-zinc-600 bg-zinc-600'}`}></div>
            <span className={`text-[10px] font-bold ${produto.estoque > 5 ? 'text-zinc-500' : produto.estoque > 0 ? 'text-yellow-500' : 'text-zinc-600'}`}>
              {produto.estoque > 0 ? `${produto.estoque} un.` : 'Indisponível'}
            </span>
          </div>
        </div>

        <Link href={`/produtos/${produto.id}`}>
          <h2 className="text-[15px] font-bold text-zinc-100 leading-tight mb-2 group-hover:text-impacto-yellow transition-colors line-clamp-2 min-h-[2.5rem]">{produto.nome}</h2>
        </Link>
        
        <div className="flex flex-col gap-1 mb-5 flex-1">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            <span className="text-zinc-600 font-medium">Aplicação:</span> <span className="text-zinc-400 italic line-clamp-1">{produto.compatibilidade}</span>
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-[-4px]">Preço</span>
            <span className={`font-black text-xl tracking-tighter ${produto.estoque > 0 ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]' : 'text-zinc-600'}`}>
              {BRL(produto.preco)}
            </span>
          </div>

          <motion.button
            whileHover={produto.estoque > 0 ? { scale: 1.05, y: -2 } : {}}
            whileTap={produto.estoque > 0 ? { scale: 0.95 } : {}}
            onClick={() => produto.estoque > 0 && onAdicionar(produto)}
            disabled={produto.estoque <= 0}
            className={`relative p-3.5 rounded-2xl transition-all shadow-xl overflow-hidden border-2 ${
              isAdded ? 'bg-green-600 border-green-400 text-white shadow-green-900/20' : 
              produto.estoque > 0 ? 'bg-zinc-900 border-impacto-yellow/30 text-impacto-yellow hover:border-impacto-yellow hover:bg-impacto-yellow hover:text-zinc-950 hover:shadow-impacto-yellow/20' : 
              'bg-zinc-950 border-zinc-800 text-zinc-700 cursor-not-allowed'
            }`}
          >
            <AnimatePresence mode="popLayout text-white">
              {isAdded ? (
                 <motion.div key="check" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                   <CheckCircle2 className="w-5 h-5" />
                 </motion.div>
              ) : (
                 <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                   <ShoppingCart className={`w-5 h-5 ${produto.estoque > 0 ? 'inline-block' : 'opacity-50'}`} />
                 </motion.div>
              )}
            </AnimatePresence>

            {/* Brilho interno dinâmico */}
            {produto.estoque > 0 && !isAdded && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

ProdutoCard.displayName = 'ProdutoCard';

export default ProdutoCard;
