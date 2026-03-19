'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, ChevronLeft, Trash2, MessageCircle, Info, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

type Produto = {
  id: number;
  categoria: string;
  nome: string;
  compatibilidade: string;
  preco: number;
  imagem: string;
};

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);
  
  // Form controls
  const [pagamento, setPagamento] = useState('PIX');
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Envio direto pelo WhatsApp
  const enviarPedidoWhatsApp = () => {
    if (!carrinho.length) return;
    const numero = '558396248424';
    const data = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let msg = `🏁 *NOVO PEDIDO — IMPACTO MOTO PARTS*\n`;
    msg += `🗓️ ${data} às ${horaAtual}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    carrinho.forEach((p, i) => {
      msg += `🔩 *Produto ${i + 1}:* ${p.nome}\n`;
      msg += `   Categoria: ${p.categoria}\n`;
      msg += `   Compatibilidade: ${p.compatibilidade}\n`;
      msg += `   💲 Valor unitário: ${BRL(p.preco)}\n\n`;
    });
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🛒 *Total do pedido: ${BRL(total)}*\n`;
    msg += `💳 Forma preferida: *A combinar*\n\n`;
    msg += `Gostaria de confirmar disponibilidade e combinar forma de pagamento. Obrigado!`;

    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Carrega itens do localStorage
  useEffect(() => {
    const salvo = localStorage.getItem('@impacto-carrinho');
    if (salvo) {
      try {
        setCarrinho(JSON.parse(salvo));
      } catch (e) {
        // Erro silencioso
      }
    }
    setCarregando(false);
  }, []);

  const groupedCart = useMemo(() => {
    const map = new Map<string, Produto & { quantity: number }>();
    carrinho.forEach(item => {
      const id = String(item.id);
      if (map.has(id)) {
        map.get(id)!.quantity += 1;
      } else {
        map.set(id, { ...item, quantity: 1 });
      }
    });
    return Array.from(map.values());
  }, [carrinho]);

  const total = useMemo(() => carrinho.reduce((a, p) => a + p.preco, 0), [carrinho]);

  // Sincroniza exclusões com o localStorage
  const removerPorId = (id: string | number) => {
    setCarrinho(prev => {
      const novo = prev.filter(item => String(item.id) !== String(id));
      localStorage.setItem('@impacto-carrinho', JSON.stringify(novo));
      return novo;
    });
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    localStorage.removeItem('@impacto-carrinho');
  };

  const processarCheckoutNativo = async () => {
    if (!session) {
      showToast("⚠️ Você precisa Entrar ou Criar Conta primeiro.", "error");
      router.push('/login');
      return;
    }

    if (!carrinho.length) return;
    setLoadingCheckout(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: carrinho,
          paymentType: pagamento
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Falha no processamento.");
      
      limparCarrinho();
      router.push(`/checkout/sucesso?order=${data.orderId}&method=${pagamento}`);
    } catch (err: any) {
      showToast(err.message || 'Erro ao processar checkout. Tente novamente.', 'error');
      setLoadingCheckout(false);
    }
  };

  if (carregando) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="mb-4 text-red-600"
      >
        <Zap className="w-10 h-10" />
      </motion.div>
      <div className="text-red-500 font-bold tracking-widest uppercase">Aquecendo motores...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20 overflow-x-hidden">
      
      {/* HEADER SIMPLIFICADO - RACING THEME */}
      <header className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/produtos">
            <motion.div 
              whileHover={{ x: -3, color: 'var(--accent-yellow)' }}
              className="inline-flex items-center gap-1 text-zinc-500 text-xs font-black uppercase tracking-widest transition-colors"
            >
              <ChevronLeft className="w-4 h-4 cursor-pointer" /> 
              <span>VOLTAR</span>
            </motion.div>
          </Link>
          
          <Link href="/">
            <div className="relative h-8 md:h-10 w-24 md:w-32 cursor-pointer brightness-110">
              <Image 
                src="/logo.png" 
                alt="Impacto" 
                fill 
                className="object-contain" 
                priority
              />
            </div>
          </Link>
          
          <div className="w-16"></div> 
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-10">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-black-ops)] tracking-tighter flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-impacto-yellow" />
              FECHAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-impacto-yellow to-impacto-orange">PEDIDO</span>
            </h1>
            <p className="text-zinc-500 mt-2 font-black uppercase tracking-widest text-[10px]">Pista liberada para finalização segura.</p>
          </motion.div>
          
          <AnimatePresence>
            {carrinho.length > 0 && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={limparCarrinho}
                className="text-sm text-zinc-500 hover:text-red-500 transition-colors uppercase font-bold tracking-wider flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Esvaziar Carrinho
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {carrinho.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/30 border border-zinc-800/50 rounded-3xl py-24 px-4 text-center shadow-2xl relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-red-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <ShoppingCart className="w-20 h-20 text-zinc-800 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-black text-zinc-300 mb-3 tracking-wide">Pista limpa por aqui...</h2>
            <p className="text-zinc-500 mb-10 max-w-sm mx-auto">Sua moto está esperando aquele talento. Que tal adicionar a primeira peça?</p>
            
            <Link href="/produtos">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-black tracking-wider transition-colors shadow-[0_0_30px_rgba(220,38,38,0.4)]"
              >
                Acelerar p/ o Catálogo
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LISTA DE ITENS */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <AnimatePresence>
                {groupedCart.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    key={item.id} 
                    className="bg-zinc-900 border border-zinc-800 hover:border-red-500/30 rounded-2xl p-4 flex items-center gap-4 relative group transition-colors shadow-lg overflow-hidden"
                  >
                    {/* Brilhozinho on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -translate-x-full group-hover:translate-x-full ease-in-out"></div>

                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center p-2 shrink-0 group-hover:bg-white/10 transition-colors relative">
                      {item.imagem ? (
                        <Image src={item.imagem} alt={item.nome} fill className="object-contain p-2 drop-shadow-lg" />
                      ) : (
                        <ShoppingCart className="text-zinc-500" />
                      )}
                      
                      {item.quantity > 1 && (
                        <div className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-zinc-950">
                          x{item.quantity}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 py-1">
                      <span className="text-[9px] uppercase font-black text-red-400 tracking-widest bg-red-500/10 px-2 py-0.5 rounded-sm inline-block mb-1.5">{item.categoria}</span>
                      <h3 className="font-bold text-white text-sm md:text-base leading-tight pr-8 mb-1.5 line-clamp-2">{item.nome}</h3>
                      <p className="text-[11px] text-zinc-500 truncate mb-1">Aplicação: {item.compatibilidade}</p>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0 pl-2 border-l border-zinc-800/50">
                        <div className="flex flex-col items-end">
                          <div className="font-black text-green-400 text-lg sm:text-xl drop-shadow-[0_0_8px_rgba(74,222,128,0.2)]">
                              {BRL(item.preco * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">
                              {BRL(item.preco)} cada
                            </span>
                          )}
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removerPorId(item.id)}
                          className="mt-2 text-zinc-600 hover:text-red-500 bg-zinc-950/50 hover:bg-red-500/10 p-2 rounded-lg flex items-center justify-center transition-all"
                          title="Remover peças"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Box de Confiança */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}
                className="mt-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex gap-4 text-sm items-center"
              >
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <strong className="text-zinc-300 block">Compra 100% Segura</strong>
                    <span className="text-zinc-500 text-xs">O pagamento será acertado com nosso consultor. Sem cobranças surpresas.</span>
                  </div>
              </motion.div>
            </div>

            {/* RESUMO DO PEDIDO */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                className="bg-gradient-to-b from-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 sticky top-24 shadow-2xl relative overflow-hidden"
              >
                
                {/* Glow decorativo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

                <h3 className="font-black text-xl mb-6 flex items-center gap-2 tracking-wide">
                  <Info className="w-5 h-5 text-zinc-400" />
                  RESUMO DA COMPRA
                </h3>
                
                <div className="space-y-4 mb-6 relative z-10">
                  <div className="flex justify-between items-center text-sm text-zinc-400">
                    <span>Peças ({carrinho.length} itens)</span>
                    <span className="text-zinc-200 font-medium">{BRL(total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-zinc-400">
                    <span className="flex items-center gap-1">Frete / Entrega <AlertCircle className="w-3 h-3 text-yellow-500/70" /></span>
                    <span className="text-yellow-500 text-[10px] font-black uppercase px-2 py-0.5 bg-yellow-500/10 rounded">Grátis Beta</span>
                  </div>
                </div>
                
                {/* Meios de Pagamento */}
                {session ? (
                  <div className="mb-8 relative z-10">
                    <span className="font-bold text-zinc-400 uppercase tracking-widest text-[10px] mb-3 block">Forma de Pagamento</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => setPagamento('PIX')}
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold text-xs tracking-widest transition-all ${pagamento === 'PIX' ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700'}`}
                      >
                        <Zap className="w-4 h-4" /> PIX
                      </button>
                      <button 
                        onClick={() => setPagamento('CARTAO_CREDITO')}
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold text-xs tracking-widest transition-all ${pagamento === 'CARTAO_CREDITO' ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700'}`}
                      >
                        <span className="text-base leading-none">💳</span> CARTÃO
                      </button>
                      <button 
                        onClick={() => setPagamento('WHATSAPP')}
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold text-xs tracking-widest transition-all ${pagamento === 'WHATSAPP' ? 'border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700'}`}
                      >
                        <MessageCircle className="w-4 h-4" /> WHATS
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl flex flex-col items-center justify-center relative z-10 text-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-yellow-500 opacity-80" />
                    <p className="text-xs text-zinc-400 leading-relaxed">Você precisa estar logado para processar o pagamento oficial da loja.</p>
                    <Link href="/login" className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors w-full border border-zinc-700">Entrar na Conta</Link>
                  </div>
                )}

                <div className="border-t border-zinc-800/60 pt-6 mb-8 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-zinc-400 uppercase tracking-widest text-xs mb-1">Total a Pagar</span>
                    <motion.span 
                      key={total} // forçar re-render na mudança de total
                      initial={{ scale: 1.2, color: "#fff" }}
                      animate={{ scale: 1, color: "#4ade80" }}
                      className="text-4xl font-black drop-shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                    >
                      {BRL(total)}
                    </motion.span>
                  </div>
                </div>

                {pagamento === 'WHATSAPP' ? (
                  // Botão WhatsApp
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={enviarPedidoWhatsApp}
                    onMouseEnter={() => setIsHoveringBtn(true)}
                    onMouseLeave={() => setIsHoveringBtn(false)}
                    className="w-full relative overflow-hidden group bg-[#25D366] hover:bg-[#22c55e] text-white rounded-2xl py-5 font-black flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] z-10"
                  >
                    <motion.div animate={isHoveringBtn ? { rotate: [0,-10,10,-10,0] } : {}} transition={{ duration: 0.4 }}>
                      <MessageCircle className="w-6 h-6" />
                    </motion.div>
                    <span className="tracking-wide uppercase text-sm">ENVIAR PEDIDO PELO WHATSAPP</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                  </motion.button>
                ) : (
                  // Botão PIX/Cartão
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={processarCheckoutNativo}
                    disabled={!session || loadingCheckout}
                    className="w-full relative overflow-hidden group disabled:opacity-50 bg-gradient-to-r from-impacto-yellow to-impacto-orange hover:from-impacto-orange hover:to-impacto-red disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 rounded-2xl py-6 font-black flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(255,102,0,0.4)] border-b-4 border-impacto-red active:border-b-0 active:translate-y-1 z-10"
                  >
                    <div className="flex items-center gap-2">
                      {loadingCheckout ? <Zap className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
                      <span className="tracking-widest uppercase text-sm">
                        {loadingCheckout ? 'ACELERANDO...' : (session ? `FECHAR PEDIDO NO ${pagamento === 'PIX' ? 'PIX' : 'CARTÃO'}` : 'ACESSE SUA CONTA')}
                      </span>
                    </div>
                    {session && !loadingCheckout && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>}
                  </motion.button>
                )}
                
                <p className="text-[10px] text-zinc-600 text-center mt-5 leading-relaxed relative z-10 max-w-[280px] font-black uppercase tracking-tighter mx-auto">
                  SISTEMA IMPACTO DE SEGURANÇA TOTAL DO PILOTO.
                </p>
                
              </motion.div>
            </div>

          </div>
        )}
      </main>

      {/* Global shimmer keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
