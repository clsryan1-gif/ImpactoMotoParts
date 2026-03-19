'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const ProductSkeleton = () => {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col h-full animate-pulse">
      {/* Imagem Placeholder */}
      <div className="bg-zinc-800 h-40 w-full relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </div>

      {/* Conteúdo Placeholder */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="h-3 w-12 bg-zinc-800 rounded"></div>
        <div className="h-4 w-full bg-zinc-800 rounded"></div>
        <div className="h-4 w-2/3 bg-zinc-800 rounded"></div>
        
        <div className="mt-auto flex items-end justify-between">
          <div className="h-6 w-20 bg-zinc-800 rounded"></div>
          <div className="h-10 w-10 bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const CategorySkeleton = () => {
  return (
    <div className="flex gap-3 overflow-x-hidden pb-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 w-28 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0 animate-pulse"></div>
      ))}
    </div>
  );
};
