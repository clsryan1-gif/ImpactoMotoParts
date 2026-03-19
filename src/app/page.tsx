'use client';

import React from 'react';
import { MessageCircle, Menu, ChevronRight, Wrench, Award, Truck, Gauge } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';

export default function LandingPage() {
  const { data: session } = useSession();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const contatosWhatsApp = () => {
    window.open('https://wa.me/558396248424?text=Olá, vim pelo site e gostaria de tirar uma dúvida!', '_blank');
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans selection:bg-impacto-red selection:text-white overflow-x-hidden">


      {/* HEADER */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 glass-premium border-b border-white/5"
        suppressHydrationWarning
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: -5, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative h-10 md:h-14 w-32 md:w-40"
            >
              <Image 
                src="/logo.png" 
                alt="Impacto" 
                fill
                priority
                quality={80}
                className="object-contain" 
              />
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center gap-10 font-medium text-sm tracking-widest uppercase text-zinc-400">
            <Link href="/" className="text-white relative group">
              HOME
              <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-red-600 rounded-full"></span>
            </Link>
            <Link 
              href={session ? "/produtos" : "/login"} 
              className="hover:text-white transition-colors relative group"
            >
              CATÁLOGO
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-red-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            {session ? (
              <div className="flex items-center gap-2 md:gap-4">
                {(session.user as any)?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <span className="hidden sm:inline-block text-red-500 font-bold tracking-widest text-xs border border-red-500/50 px-3 py-1.5 rounded-full hover:bg-red-500/10 transition">
                      PAINEL ADMIN
                    </span>
                    <span className="sm:hidden text-red-500 font-bold tracking-widest text-[10px] border border-red-500/50 px-2 py-1 rounded hover:bg-red-500/10 transition">
                      ADMIN
                    </span>
                  </Link>
                )}
                <Link href="/meus-pedidos" className="hidden sm:block text-zinc-400 hover:text-white text-xs font-medium tracking-wider transition">
                  Olá, <strong className="text-white">{session.user?.name || "Piloto"}</strong>
                </Link>
                <button onClick={() => signOut()} className="text-zinc-500 hover:text-red-500 text-[10px] md:text-xs tracking-wider transition">SAIR</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <span className="text-zinc-400 hover:text-white text-[10px] md:text-xs font-bold tracking-widest transition-all duration-300 border border-zinc-700 px-3 py-1.5 rounded-full hover:border-zinc-400 hover:bg-zinc-800/50">
                    ENTRAR
                  </span>
                </Link>
                <Link href="/cadastro">
                  <span className="text-zinc-400 hover:text-white text-[10px] md:text-xs font-bold tracking-widest transition-all duration-300 border border-zinc-700 px-3 py-1.5 rounded-full hover:border-zinc-400 hover:bg-zinc-800/50">
                    CADASTRO
                  </span>
                </Link>
              </div>
            )}

            <Link href={session ? "/produtos" : "/login"}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden group flex items-center gap-1 md:gap-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 px-3 py-1.5 md:px-5 md:py-2 text-[10px] md:text-sm rounded-full font-black tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              >
                <span className="relative z-10 hidden sm:inline">VER CATÁLOGO ONLINE</span>
                <span className="relative z-10 sm:hidden">CATÁLOGO</span>
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 relative z-10" />
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section id="home" className="relative pt-0 pb-32 overflow-hidden flex flex-col items-center">
        {/* Fundo glow dinâmico otimizado */}
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "opacity" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[40px] -z-10"
        ></motion.div>
        
        <div className="absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-impacto-orange/10 rounded-full blur-[30px] -z-10"></div>

        <div className="container mx-auto px-4 flex flex-col items-center text-center z-10 relative pt-[12vh] mb-32">
          
          {/* Logo gigante atrás do texto */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none select-none overflow-visible">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.15, scale: 1.8 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-full h-full max-w-4xl opacity-30"
            >
               <Image
                 src="/logo.png"
                 alt=""
                 fill
                 quality={100}
                 className="object-contain filter grayscale invert opacity-30 gpu-accelerated"
               />
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
            suppressHydrationWarning
          >
            <h1 className="text-5xl md:text-8xl uppercase tracking-tight mb-8 leading-tight font-[family-name:var(--font-black-ops)] relative text-balance">
              VELOCIDADE <br className="md:hidden" />
              <span className="text-racing-gradient">SEM LIMITES.</span><br />
              <span className="text-white">IMPACTO TOTAL.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-16 relative">
              Peças originais e de alto desempenho com entrega rápida. Do motor ao acabamento — a Impacto tem tudo que sua moto precisa para andar forte.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Link href={session ? "/produtos" : "/login"}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden group flex items-center justify-center gap-3 bg-gradient-to-r from-impacto-yellow to-impacto-orange text-zinc-950 px-12 py-6 rounded-2xl font-black text-xl transition-all duration-200 shadow-[0_0_50px_rgba(255,102,0,0.4)] border-b-4 border-impacto-red"
              >
                <Wrench className="w-6 h-6 text-zinc-950" />
                <span className="relative z-10 tracking-[0.2em]">CATÁLOGO RACING</span>
                <ChevronRight className="w-6 h-6 relative z-10" />
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Features / Diferenciais (Novo Complemento) */}
          <div 
            className="flex flex-col items-center justify-center gap-16 mt-32 mb-32 max-w-4xl mx-auto text-center"
          >
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="flex flex-col items-center justify-center gap-4"
             >
                 <Award className="w-10 h-10 text-green-500 shrink-0 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                <div className="flex flex-col items-center">
                  <h4 className="font-black text-white tracking-widest text-lg md:text-xl mb-2">QUALIDADE EXTREMA</h4>
                  <p className="text-sm md:text-base text-zinc-400 leading-relaxed drop-shadow-[0_0_10px_rgba(0,0,0,1)] max-w-lg">
                    Selecionamos rigorosamente peças originais e paralelas de alta performance. Garantimos que sua moto não perca potência e aguente o tranco diário ou nas pistas com a máxima durabilidade.
                  </p>
                </div>
             </motion.div>
             
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center gap-4"
              >
                 <Truck className="w-10 h-10 text-blue-500 shrink-0 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
                <div className="flex flex-col items-center">
                  <h4 className="font-black text-white tracking-widest text-lg md:text-xl mb-2">ENTREGA IMPLACÁVEL</h4>
                  <p className="text-sm md:text-base text-zinc-400 leading-relaxed drop-shadow-[0_0_10px_rgba(0,0,0,1)] max-w-lg">
                    Sabemos que a pista não espera e você não tem tempo a perder. Por isso, nosso sistema logístico despacha o seu equipamento na velocidade da luz direto para o conforto da sua casa ou oficina.
                  </p>
                </div>
             </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center gap-4"
              >
                 <Gauge className="w-10 h-10 text-zinc-300 shrink-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                <div className="flex flex-col items-center">
                  <h4 className="font-black text-white tracking-widest text-lg md:text-xl mb-2">COMPATIBILIDADE UNIVERSAL</h4>
                  <p className="text-sm md:text-base text-zinc-400 leading-relaxed drop-shadow-[0_0_10px_rgba(0,0,0,1)] max-w-lg">
                    Trabalhamos com um catálogo vasto capaz de atender desde modelos populares até esportivas das melhores montadoras, oferecendo um encaixe liso, preciso e sem nenhuma gambiarra tecnológica.
                  </p>
                </div>
             </motion.div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 glass-premium pt-16 pb-8 border-t border-white/5 text-center md:text-left mt-auto gpu-accelerated">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 items-center mb-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start"
          >
            <div className="flex items-center gap-2 justify-center md:justify-start mb-4 relative h-16 w-32">
              <Image src="/logo.png" alt="Impacto Moto Parts Logo" fill quality={60} className="object-contain" />
            </div>
            <p className="text-zinc-500 text-sm max-w-[250px]">Sua parceira de extrema confiança para peças e acessórios de alta performance.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <h4 className="font-black mb-4 uppercase text-sm tracking-widest text-white/80">Atendimento</h4>
            <div className="space-y-2 text-center">
              <p className="text-zinc-400 text-sm flex justify-between gap-4"><span className="text-zinc-600">Seg a Sex</span> 08h às 18h</p>
              <p className="text-zinc-400 text-sm flex justify-between gap-4"><span className="text-zinc-600">Sábados</span> 08h às 12h</p>
              
              <div className="mt-4 border-2 border-red-600/60 rounded-lg p-2 bg-red-600/5 drop-shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                <p className="text-red-500 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  SOCORRO 24HRS
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="flex flex-col items-center md:items-end gap-3"
          >
            <p className="text-xs text-zinc-600 uppercase font-bold tracking-widest">Fale Direto com a Loja</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={contatosWhatsApp}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-black tracking-widest transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)]"
            >
              <MessageCircle className="w-5 h-5" />
              WHATSAPP
            </motion.button>
          </motion.div>
        </div>

        <div className="border-t border-zinc-900 pt-8 text-center text-xs text-zinc-600 font-medium">
          <p>© {mounted ? new Date().getFullYear() : '2026'} Impacto Moto Parts. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
