'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Zap, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
      const res = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao cadastrar');
      }

      setMsg('Conta acelerada com sucesso! Redirecionando para as pistas...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
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
          className="object-contain opacity-10 mix-blend-screen gpu-accelerated"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg z-10"
      >
        <div className="relative group">
          {/* Efeito de Aura/Neon Pulsante atrás do card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-impacto-orange via-impacto-red to-impacto-yellow rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 gpu-accelerated"></div>
          
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl gpu-accelerated">
            <Link href="/login" className="absolute top-8 left-8 text-zinc-500 hover:text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            
            <div className="flex flex-col items-center mb-10">
              <div className="relative h-10 w-32 mb-6">
                <Image 
                  src="/logo.png" 
                  alt="Impacto" 
                  fill 
                  className="object-contain opacity-50 grayscale" 
                  priority
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-black-ops)] text-center tracking-tighter leading-none mb-2">
                NOVA <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-impacto-yellow to-impacto-orange">CREDENCIAL.</span>
              </h2>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-2 text-center">Inicie sua jornada na elite IMPACTO</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black p-4 rounded-xl mb-8 text-center uppercase tracking-widest"
              >
                🚨 {error}
              </motion.div>
            )}

            {msg && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black p-4 rounded-xl mb-8 text-center uppercase tracking-widest"
              >
                🏁 {msg}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome do Piloto</label>
                <input 
                  type="text" required minLength={3}
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-3.5 outline-none focus:border-impacto-orange focus:ring-1 focus:ring-impacto-orange/20 transition-all text-sm"
                  placeholder="Ex: Ryan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">E-mail para Contato</label>
                <input 
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-3.5 outline-none focus:border-impacto-orange focus:ring-1 focus:ring-impacto-orange/20 transition-all text-sm"
                  placeholder="piloto@impacto.com.br"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Senha Forte</label>
                <input 
                  type="password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-3.5 outline-none focus:border-impacto-orange focus:ring-1 focus:ring-impacto-orange/20 transition-all text-sm tracking-[0.4em] font-mono"
                  placeholder="••••••••"
                />
              </div>

              <button 
                disabled={loading}
                className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-impacto-yellow to-impacto-orange text-zinc-950 font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl mt-6 transition-all hover:scale-[1.02] active:scale-95 shadow-lg border-b-4 border-impacto-red"
              >
                <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
                <div className="relative z-10 flex justify-center items-center gap-2 text-sm">
                  {loading ? <Zap className="w-5 h-5 animate-pulse" /> : <UserPlus className="w-5 h-5" />}
                  {loading ? 'PREPARANDO MOTOR...' : 'CRIAR CONTA AGORA'}
                </div>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <Link href="/login" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
                Já possui credencial? <span className="text-impacto-yellow font-black">ENTRAR NO BOX</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
