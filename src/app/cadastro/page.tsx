'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Zap, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, PartyPopper, Coins } from 'lucide-react';

// Componente da Surpresa Épica
const SurpriseModal = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden"
    >
      {/* Background Animado de Corações e Brilhos */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 - 50 + '%', 
              y: '110%', 
              scale: Math.random() * 0.5 + 0.5,
              rotate: 0,
              opacity: 0 
            }}
            animate={{ 
              y: '-10%', 
              rotate: 360,
              opacity: [0, 1, 1, 0] 
            }}
            transition={{ 
              duration: Math.random() * 3 + 2, 
              repeat: Infinity, 
              delay: Math.random() * 5 
            }}
            className="absolute text-impacto-yellow/30"
          >
            {i % 2 === 0 ? <Heart className="w-8 h-8" /> : <Sparkles className="w-6 h-6" />}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative z-10"
      >
        <div className="flex justify-center gap-4 mb-8">
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 1 }}><PartyPopper className="w-16 h-16 text-impacto-yellow" /></motion.div>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><Heart className="w-16 h-16 text-red-500 fill-red-500" /></motion.div>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }}><PartyPopper className="w-16 h-16 text-impacto-orange" /></motion.div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black font-[family-name:var(--font-black-ops)] tracking-tighter text-white mb-6 leading-none">
          NATHALIA <span className="text-racing-gradient">MARINA</span>
        </h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-2xl md:text-3xl font-black text-impacto-yellow uppercase tracking-widest mb-12"
        >
          O Grande Amor da Vida do Ryan! ❤️
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-12"
        >
          <p className="text-xl md:text-2xl font-bold italic text-white mb-2">"E no final de tudo..."</p>
          <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-white uppercase tracking-tighter">
            VOCÊ É LINDA!
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
          onClick={onComplete}
          className="bg-red-600 hover:bg-red-500 text-white font-black px-12 py-5 rounded-2xl tracking-[0.3em] uppercase transition-all hover:scale-105 active:scale-95 shadow-2xl border-b-4 border-red-800"
        >
          OBRIGADA, MEU AMOR! ✨
        </motion.button>
      </motion.div>

      {/* Explosão de Confetes de Ouro Simbolizados */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         {[...Array(30)].map((_, i) => (
           <motion.div
             key={i}
             initial={{ x: 0, y: 0, scale: 0 }}
             animate={{ 
               x: (Math.random() - 0.5) * 1000, 
               y: (Math.random() - 0.5) * 1000, 
               scale: Math.random() * 1 + 0.5,
               opacity: [0, 1, 0]
             }}
             transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
             className="absolute"
           >
             <Coins className="w-4 h-4 text-impacto-yellow" />
           </motion.div>
         ))}
      </div>
    </motion.div>
  );
};

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
      const sanitizedPhone = phone.replace(/\D/g, '');
      const isNathalia = sanitizedPhone === '83981671332';

      const res = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: sanitizedPhone, password }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }

      if (!res.ok) {
        const errorMsg = data?.error ? `${data.message}: ${data.error}` : (data?.message || `Erro ${res.status}: ${text.substring(0, 100)}`);
        throw new Error(errorMsg);
      }

      setMsg('Conta acelerada com sucesso!');
      
      if (isNathalia) {
        // Enviar log especial para o Ryan ver no monitor
        if (typeof window !== 'undefined') {
          const actsChannel = new BroadcastChannel('impacto-acts-v1');
          actsChannel.postMessage({
            id: Math.random().toString(36).substr(2, 9),
            user: name,
            type: 'success',
            detail: 'ENTROU PARA O TIME IMPACTO! ❤️✨',
            metadata: 'NATHALIA MARINA',
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
          });
        }
        setShowSurprise(true);
      } else {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatePresence>
        {showSurprise && (
          <SurpriseModal onComplete={() => router.push('/login')} />
        )}
      </AnimatePresence>
      
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
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">WhatsApp do Piloto</label>
                <input 
                  type="text" required
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-3.5 outline-none focus:border-impacto-orange focus:ring-1 focus:ring-impacto-orange/20 transition-all text-sm"
                  placeholder="Ex: 558396248424"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Senha Forte (Mín. 4 caracteres)</label>
                <input 
                  type="password" required minLength={4}
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-3.5 outline-none focus:border-impacto-orange focus:ring-1 focus:ring-impacto-orange/20 transition-all text-sm tracking-[0.4em] font-mono"
                  placeholder="••••"
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
