'use client';

import React from 'react';
import ProductForm from '@/components/ProductForm';
import { ChevronLeft, PackagePlus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NovoProdutoPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/produtos">
              <motion.button 
                whileHover={{ x: -4 }}
                className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                <PackagePlus className="w-8 h-8 text-red-600" />
                Novo Cadastro
              </h1>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-tighter">Inserir nova peça no banco de dados</p>
            </div>
          </div>
        </header>

        <div className="flex justify-center">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}
