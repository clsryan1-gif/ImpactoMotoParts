'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Zap, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      phone,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* BACKGROUND ÉPICO RACING */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/logo.png" 
          alt="" 
          fill
          className="object-contain opacity-30 mix-blend-screen gpu-accelerated"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl z-10"
        suppressHydrationWarning
      >
        <div className="relative group flex flex-col md:flex-row gap-6">
          
          {/* LADO ESQUERDO: LOGIN */}
          <div className="flex-1 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-impacto-red to-impacto-orange rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative glass-premium p-8 md:p-10 rounded-[2.5rem] h-full shadow-2xl gpu-accelerated">
              <Link href="/" className="absolute top-8 left-8 text-zinc-500 hover:text-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              
              <div className="flex flex-col items-center mb-8">
                <div className="relative h-10 w-32 mb-6">
                  <Image 
                    src="/logo.png" 
                    alt="Impacto" 
                    fill 
                    className="object-contain opacity-80" 
                    priority
                  />
                </div>
                <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-black-ops)] text-center tracking-tighter leading-none">
                  ENTRAR NO <br/>
                  <span className="text-racing-gradient">BOX.</span>
                </h2>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black p-3 rounded-xl mb-6 text-center uppercase tracking-widest">
                  🚨 {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Número cadastrado no site</label>
                  <input 
                    type="text" required
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-3.5 outline-none focus:border-impacto-orange transition-all text-sm"
                    placeholder="ex: 558396248424"
                  />
                </div>
                
                <div className="space-y-1.5 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Chave de Acesso</label>
                    <Link 
                      href="https://wa.me/558396248424?text=Olá, sou piloto da Impacto Moto Parts e esqueci meu acesso. Pode me ajudar a recuperar?" 
                      target="_blank"
                      className="text-[9px] font-bold text-impacto-orange hover:text-impacto-yellow transition-colors uppercase tracking-tighter"
                    >
                      Esqueci a senha
                    </Link>
                  </div>
                  <input 
                    type="password" required
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-3.5 outline-none focus:border-impacto-orange transition-all text-sm tracking-[0.4em] font-mono"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-impacto-yellow to-impacto-orange text-zinc-950 font-black uppercase tracking-[0.2em] text-xs py-4 rounded-2xl mt-4 transition-all hover:scale-[1.02] shadow-lg"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
                    {loading ? <span className="flex items-center gap-2"><Zap className="w-4 h-4 animate-pulse" /> SINCRONIZANDO...</span> : (
                      <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> ACESSAR AGORA</span>
                    )}
                </button>
              </form>
            </div>
          </div>

          {/* LADO DIREITO: CHAMADA PARA CADASTRO (AÇÃO PRINCIPAL) */}
          <div className="md:w-[380px] relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-impacto-orange to-impacto-yellow rounded-[2.5rem] blur-xl opacity-50 animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-impacto-red/30 to-impacto-orange/30 backdrop-blur-2xl border border-impacto-yellow/30 p-8 md:p-10 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-center overflow-hidden gpu-accelerated">
              <div className="absolute top-0 right-0 w-32 h-32 bg-impacto-yellow/10 blur-[40px] rounded-full pointer-events-none"></div>
              
              <Zap className="w-12 h-12 text-impacto-yellow mb-6 drop-shadow-[0_0_15px_rgba(255,204,0,0.5)]" />
              
              <h3 className="text-3xl md:text-5xl font-[family-name:var(--font-black-ops)] tracking-tighter leading-tight mb-4">
                AINDA NÃO É <br/> 
                <span className="text-impacto-yellow">ELITE?</span>
              </h3>
              
              <p className="text-sm font-bold text-zinc-300 mb-8 uppercase tracking-tighter">
                Garanta acesso ao <span className="text-white">Catálogo Exclusivo</span> e ofertas em tempo real.
              </p>

              <Link 
                href="/cadastro" 
                className="w-full bg-white text-black font-black uppercase tracking-widest text-sm py-5 rounded-2xl hover:bg-impacto-yellow transition-all shadow-xl flex items-center justify-center gap-2 group/cta"
              >
                CRIAR CONTA AGORA
                <ChevronRight className="w-5 h-5 group-hover/cta:translate-x-1 transition-transform" />
              </Link>
              
              <div className="mt-8 flex gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-impacto-yellow"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-impacto-orange"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-impacto-red"></div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
