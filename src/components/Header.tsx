'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, LayoutDashboard, User, Menu, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Monitorar scroll para efeito de glassmorphism
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monitorar carrinho (localStorage) em tempo real entre abas e mudanças locais
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

    // Evento de storage para sincronização entre abas
    window.addEventListener('storage', updateCount);
    
    // Evento customizado para atualizações na mesma aba
    window.addEventListener('cart-updated', updateCount);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('cart-updated', updateCount);
    };
  }, []);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  // Ocultar cabeçalho em páginas de administração ou autenticação
  const isAuthPage = pathname === '/login' || pathname === '/cadastro';
  const isAdminPage = pathname?.startsWith('/admin');
  
  if (isAuthPage || isAdminPage) return null;

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 border-b ${
        isScrolled 
          ? 'py-2 bg-zinc-950/90 backdrop-blur-md border-white/10' 
          : 'py-4 bg-transparent border-transparent'
      } pt-[env(safe-area-inset-top,1rem)]`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group relative cursor-pointer">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-10 h-10 md:w-12 md:h-12"
          >
            <div className="absolute inset-0 bg-red-600 rounded-lg blur-[10px] opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
            <Image 
              src="/logo.png" 
              alt="Impacto Moto Parts" 
              width={48} 
              height={48} 
              className="object-contain relative z-10"
              priority
            />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-white font-black text-lg md:text-xl leading-none tracking-tighter group-hover:text-red-500 transition-colors">
              IMPACTO
            </span>
            <span className="text-zinc-500 font-bold text-[8px] md:text-[10px] tracking-widest uppercase">
              Moto Parts
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-10 font-black text-[11px] tracking-[0.2em] uppercase text-zinc-400">
          <Link href="/" className={`hover:text-white transition-colors relative group ${pathname === '/' ? 'text-white' : ''}`}>
            HOME
            <span className={`absolute -bottom-2 left-0 h-[2px] bg-red-600 rounded-full transition-all duration-300 ${pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link href="/produtos" className={`hover:text-white transition-colors relative group ${pathname === '/produtos' ? 'text-white' : ''}`}>
            CATÁLOGO
            <span className={`absolute -bottom-2 left-0 h-[2px] bg-red-600 rounded-full transition-all duration-300 ${pathname === '/produtos' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
        </nav>

        {/* ICONS & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {session ? (
            <div className="flex items-center gap-2 md:gap-4">
              {isAdmin && (
                <Link href="/admin">
                  <span className="hidden sm:inline-block text-red-500 font-black tracking-widest text-[10px] border border-red-500/30 px-4 py-2 rounded-full hover:bg-red-500/10 transition backdrop-blur-md">
                    PAINEL ADMIN
                  </span>
                  <LayoutDashboard className="sm:hidden w-5 h-5 text-red-500" />
                </Link>
              )}
              
              <Link href="/checkout" className="relative p-2 group bg-zinc-900/50 rounded-xl hover:bg-zinc-800 transition">
                <ShoppingCart className="w-5 h-5 text-white group-hover:text-red-500 transition-colors" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              
              <button 
                onClick={() => signOut({ callbackUrl: '/', redirect: true })}
                className="hidden sm:flex items-center gap-2 text-zinc-500 hover:text-red-500 text-[10px] font-bold tracking-widest transition"
              >
                SAIR <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <span className="text-zinc-400 hover:text-white text-[10px] font-black tracking-widest transition-all duration-300 border border-zinc-800 px-4 py-2 rounded-full hover:bg-zinc-800">
                  ENTRAR
                </span>
              </Link>
              <Link href="/cadastro">
                <span className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black tracking-widest transition-all px-4 py-2 rounded-full shadow-lg shadow-red-600/20">
                  CADASTRO
                </span>
              </Link>
            </div>
          )}

          {/* MOBILE TOGGLE */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-950 border-t border-white/5 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-black text-sm tracking-[0.2em] flex items-center justify-between">
                HOME <ChevronRight className="w-4 h-4 text-zinc-700" />
              </Link>
              <Link href="/produtos" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-black text-sm tracking-[0.2em] flex items-center justify-between">
                CATÁLOGO <ChevronRight className="w-4 h-4 text-zinc-700" />
              </Link>
              {session && (
                 <button 
                   onClick={() => {
                     signOut({ callbackUrl: '/', redirect: true });
                     setIsMobileMenuOpen(false);
                   }}
                   className="text-red-500 font-black text-sm tracking-[0.2em] text-left uppercase"
                 >
                   Sair da Conta
                 </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
