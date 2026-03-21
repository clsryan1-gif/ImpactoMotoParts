'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function FloatingCart() {
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('@impacto-carrinho');
      if (saved) {
        try {
          const items = JSON.parse(saved);
          setCartCount(Array.isArray(items) ? items.length : 0);
        } catch (e) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCount();

    window.addEventListener('storage', updateCount);
    window.addEventListener('cart-updated', updateCount);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('cart-updated', updateCount);
    };
  }, []);

  // Não mostrar no checkout ou se estiver vazio
  if (pathname === '/checkout' || cartCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, x: -100, opacity: 0 }}
        animate={{ scale: 1, x: 0, opacity: 1 }}
        exit={{ scale: 0, x: -100, opacity: 0 }}
        className="fixed bottom-8 left-8 z-[1001] md:bottom-12 md:left-12"
      >
        <Link href="/checkout">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 3 }}
            whileTap={{ scale: 0.9 }}
            className="relative group"
          >
            {/* Efeito Glow de Fundo */}
            <div className="absolute inset-0 bg-red-600 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-impacto-red to-impacto-orange p-5 rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-white" />
              
              {/* Badge do Contador */}
              <motion.span
                key={cartCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-2 -right-2 bg-white text-red-600 text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-red-600"
              >
                {cartCount}
              </motion.span>

              {/* Tooltip Mobile/Desktop */}
              <div className="absolute left-full ml-4 bg-zinc-900/90 backdrop-blur-md border border-white/10 text-white text-[9px] font-black px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tracking-widest uppercase shadow-2xl">
                Ver Meu Box
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
