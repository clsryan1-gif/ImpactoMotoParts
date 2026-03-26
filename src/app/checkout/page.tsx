'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, ChevronLeft, Trash2, MessageCircle, Info, ShieldCheck, Zap, AlertCircle, MapPin } from 'lucide-react';
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
  const [endereco, setEndereco] = useState<{rua: string, numero: string, complemento?: string, bairro: string, taxa: number, tipo?: 'ENTREGA' | 'RETIRADA'} | null>(null);

  const total = useMemo(() => {
    const totalItens = carrinho.reduce((a, p) => a + p.preco, 0);
    const taxaEntrega = endereco?.taxa || 0;
    return totalItens + taxaEntrega;
  }, [carrinho, endereco]);
  
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

  // Envio direto pelo WhatsApp - FORMATO PDV DETALHADO
  const enviarPedidoWhatsApp = (orderId?: string, methodOverride?: string) => {
    if (!carrinho.length) return;
    const numero = '558396248424';
    const data = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const metodoFinal = methodOverride || pagamento;
    const clienteNome = session?.user?.name || 'Cliente';

    const metodoLabel: Record<string, string> = {
      'PIX': 'PIX (Pagamento Instantâneo)',
      'CARTAO_CREDITO': '💳 Cartão de Crédito',
      'WHATSAPP': '🟢 Combinar via WhatsApp'
    };

    let msg = `🔥 *NOVO PEDIDO: IMPACTO MOTO PARTS* 🔥\n`;
    msg += `🚀 *ALTA PERFORMANCE EM SUAS MÃOS* 🚀\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    msg += `🆔 *Nº DO PEDIDO:* #${orderId ? orderId.substring(0, 8).toUpperCase() : 'PENDENTE'}\n`;
    msg += `👤 *PILOTO:* ${clienteNome}\n`;
    msg += `📅 *DATA:* ${data} às ${horaAtual}\n\n`;
    
    msg += `📦 *DETALHES DA CARGA:*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    groupedCart.forEach((p, i) => {
      msg += `🔹 *${p.nome}*\n`;
      msg += `   └─ ⚙️ Categoria: ${p.categoria}\n`;
      msg += `   └─ 🔢 Quantidade: ${p.quantity}\n`;
      msg += `   └─ 💰 Subtotal: ${BRL(p.preco * p.quantity)}\n\n`;
    });
 
    const taxaEntregaCalculada = endereco?.taxa || 0;
    const subtotalCalculado = total - taxaEntregaCalculada;
 
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💵 *SUBTOTAL:* ${BRL(subtotalCalculado)}\n`;
    msg += `🚚 *FRETE:* ${endereco?.tipo === 'RETIRADA' ? '🏁 RETIRADA NA LOJA' : (taxaEntregaCalculada > 0 ? BRL(taxaEntregaCalculada) : '✨ GRÁTIS')}\n`;
    msg += `🏆 *TOTAL FINAL:* *${BRL(total)}*\n`;
    msg += `💳 *FORMA DE PAGAMENTO:* ${metodoLabel[metodoFinal] || metodoFinal}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (endereco) {
      if (endereco.tipo === 'RETIRADA') {
        msg += `📍 *LOCAL DE RETIRADA:*\n`;
        msg += `🏢 Impacto Moto Parts - Santa Rita/PB\n`;
        msg += `✅ Disponível para retirada imediata.\n\n`;
      } else {
        msg += `📍 *DESTINO DA ENTREGA:*\n`;
        msg += `🏠 *Rua:* ${endereco.rua}, ${endereco.numero}\n`;
        msg += `🏙️ *Bairro:* ${endereco.bairro}\n`;
        if (endereco.complemento) msg += `📑 *Compl:* ${endereco.complemento}\n`;
        msg += `\n`;
      }
    }
    
    msg += `🛡️ *DADOS REGISTRADOS COM SUCESSO!*\n`;
    msg += `Impacto Moto Parts: Sua loja de elite para peças de alta performance! 🛠️🏍️\n\n`;
    msg += `------------------------------------------\n`;
    msg += `*Olá, acabei de fechar meu pedido pelo site! Aguardo o retorno para alinhar os últimos detalhes e acelerar a entrega.* 🏁🔥`;

    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Carrega itens do localStorage
  useEffect(() => {
    const carregarCarrinho = () => {
      const salvo = localStorage.getItem('@impacto-carrinho');
      if (salvo) {
        try {
          setCarrinho(JSON.parse(salvo));
        } catch (e) {}
      }
      setCarregando(false);
    };

    // Carregar endereço
    const carregarEndereco = () => {
      const salvo = localStorage.getItem('@impacto-endereco');
      if (salvo) {
        try {
          setEndereco(JSON.parse(salvo));
        } catch (e) {}
      }
    };

    carregarCarrinho();
    carregarEndereco();

    // Sincronizar entre abas
    const handleStorage = (e: StorageEvent) => {
      if (e.key === '@impacto-carrinho') carregarCarrinho();
      if (e.key === '@impacto-endereco') carregarEndereco();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Sincroniza exclusões com o localStorage
  const removerPorId = (id: string | number) => {
    setCarrinho(prev => {
      const novo = prev.filter(item => String(item.id) !== String(id));
      localStorage.setItem('@impacto-carrinho', JSON.stringify(novo));
      // Notificar componentes globais para atualizar badges
      window.dispatchEvent(new CustomEvent('cart-updated'));
      return novo;
    });
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    localStorage.removeItem('@impacto-carrinho');
    // Notificar componentes globais para atualizar badges
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const processarCheckoutNativo = async () => {
    if (!session) {
      showToast("⚠️ Você precisa Entrar ou Criar Conta primeiro.", "error");
      router.push('/login');
      return;
    }

    if (!endereco) {
      showToast("📍 Por favor, defina o endereço de entrega.", "error");
      router.push('/checkout/endereco');
      return;
    }

    if (!carrinho.length) return;
    setLoadingCheckout(true);

    try {
      // Para o método direta no Whatsapp sem gerar ordem no banco (opcional, mas vamos gerar para todas agora)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: carrinho,
          paymentType: pagamento,
          endereco: endereco,
          taxaEntrega: endereco?.taxa || 0
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Falha no processamento.");
      
      // Abre o WhatsApp com os detalhes
      enviarPedidoWhatsApp(data.orderId, pagamento);
      
      showToast("🚀 Pedido enviado para o WhatsApp com sucesso!", "success");
      limparCarrinho();
      
      // Não redirecionamos mais para a página de sucesso, voltamos para produtos ou mantemos aqui
      setTimeout(() => {
        router.push('/produtos');
      }, 1000);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20">
      
      {/* Overlay de Processamento */}
      <AnimatePresence>
        {loadingCheckout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-impacto-yellow/10 flex items-center justify-center border-2 border-impacto-yellow/20 relative">
                <div className="absolute inset-0 rounded-full border-t-2 border-impacto-yellow animate-spin"></div>
                <Zap className="w-10 h-10 text-impacto-yellow shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
              </div>
            </motion.div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">AUTENTICANDO PEDIDO...</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] max-w-xs leading-relaxed">
              Aguarde um instante. Estamos preparando sua carga para o WhatsApp da central.
            </p>
            
            <div className="mt-12 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-impacto-yellow rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-1.5 h-1.5 bg-impacto-yellow rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-1.5 h-1.5 bg-impacto-yellow rounded-full animate-bounce"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* HEADER SIMPLIFICADO - RACING THEME */}
      <header className="glass-premium sticky top-0 z-50">
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
            <div className="relative h-8 md:h-10 w-24 md:w-32 cursor-pointer brightness-125">
              <Image 
                src="/logo.png" 
                alt="Impacto" 
                fill 
                className="object-contain opacity-100" 
                priority
                quality={100}
              />
            </div>
          </Link>
          
          <div className="w-16"></div> 
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-10">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-black-ops)] tracking-tighter flex items-center gap-3" suppressHydrationWarning>
              <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-impacto-yellow" />
              FECHAR <span className="text-racing-gradient">PEDIDO</span>
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
            className="bg-zinc-900/60 glass-premium rounded-3xl py-24 px-4 text-center shadow-2xl relative overflow-hidden"
            suppressHydrationWarning
          >
             <div className="absolute inset-0 bg-red-500/10 blur-[150px] rounded-full pointer-events-none"></div>

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
                    className="glass-premium rounded-2xl p-4 flex items-center gap-4 relative group transition-colors shadow-2xl overflow-hidden gpu-accelerated"
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
                className="glass-premium rounded-3xl p-6 lg:p-8 sticky top-24 shadow-2xl relative overflow-hidden"
              >
                
                {/* Glow decorativo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                <h3 className="font-black text-xl mb-6 flex items-center gap-2 tracking-wide">
                  <Info className="w-5 h-5 text-zinc-400" />
                  RESUMO DA COMPRA
                </h3>
                
                <div className="space-y-4 mb-6 relative z-10">
                  <div className="flex justify-between items-center text-sm text-zinc-400">
                    <span className="flex items-center gap-1">Subtotal</span>
                    <span className="text-zinc-200 font-medium">{BRL(total - (endereco?.taxa || 0))}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      {endereco?.tipo === 'RETIRADA' ? 'Retirada na Loja' : 'Frete / Entrega'} 
                      <AlertCircle className="w-3 h-3 text-yellow-500/70" />
                    </span>
                    <span className={endereco?.taxa ? "text-zinc-200 font-medium" : "text-impacto-yellow text-[10px] font-black uppercase px-2 py-0.5 bg-impacto-yellow/10 rounded"}>
                      {endereco?.tipo === 'RETIRADA' ? 'Grátis' : (endereco?.taxa ? BRL(endereco.taxa) : 'Grátis Beta')}
                    </span>
                  </div>
                </div>

                {/* Seção de Endereço */}
                <div className="mb-8 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Endereço de Entrega</span>
                    <Link href="/checkout/endereco">
                       <span className="text-impacto-yellow text-[9px] font-black uppercase hover:underline cursor-pointer">Alterar</span>
                    </Link>
                  </div>
                  
                  {endereco ? (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border p-4 rounded-2xl flex items-start gap-3 transition-colors ${endereco.tipo === 'RETIRADA' ? 'bg-impacto-yellow/10 border-impacto-yellow/30' : 'bg-zinc-950/50 border-zinc-800'}`}
                    >
                      <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${endereco.tipo === 'RETIRADA' ? 'text-impacto-yellow' : 'text-red-500'}`} />
                      <div className="text-xs">
                        {endereco.tipo === 'RETIRADA' ? (
                          <>
                            <p className="text-impacto-yellow font-black uppercase tracking-tight mb-0.5">Retirada na Loja (Grátis)</p>
                            <p className="text-zinc-500 font-bold uppercase text-[9px]">Sede Impacto Moto Parts — Santa Rita, PB</p>
                          </>
                        ) : (
                          <>
                            <p className="text-zinc-200 font-bold leading-tight mb-1">{endereco.rua}, {endereco.numero}</p>
                            <p className="text-zinc-500 font-medium">{endereco.bairro}{endereco.complemento ? ` - ${endereco.complemento}` : ''}</p>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <Link href="/checkout/endereco">
                      <motion.div 
                        whileHover={{ scale: 1.02, borderColor: 'var(--impacto-yellow)' }}
                        className="border-2 border-dashed border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all"
                      >
                        <MapPin className="w-6 h-6 text-zinc-700 group-hover:text-impacto-yellow transition-colors" />
                        <span className="text-[10px] font-black text-zinc-600 group-hover:text-zinc-400 uppercase tracking-widest">Definir Endereço</span>
                      </motion.div>
                    </Link>
                  )}
                </div>
                
                {/* Meios de Pagamento */}
                {session ? (
                  <div className="mb-8 relative z-10">
                    <span className="font-bold text-zinc-400 uppercase tracking-widest text-[10px] mb-3 block">Forma de Pagamento</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => setPagamento('PIX')}
                        className={`py-4 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-black text-[10px] tracking-widest transition-all ${pagamento === 'PIX' ? 'border-impacto-yellow bg-impacto-yellow/10 text-impacto-yellow shadow-[0_0_20px_rgba(255,183,0,0.2)]' : 'border-zinc-800 bg-zinc-950/50 text-zinc-600 hover:border-zinc-700'}`}
                      >
                        <Zap className="w-5 h-5" /> PIX
                      </button>
                      <button 
                        onClick={() => setPagamento('CARTAO_CREDITO')}
                        className={`py-4 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-black text-[10px] tracking-widest transition-all ${pagamento === 'CARTAO_CREDITO' ? 'border-impacto-yellow bg-impacto-yellow/10 text-impacto-yellow shadow-[0_0_20px_rgba(255,183,0,0.2)]' : 'border-zinc-800 bg-zinc-950/50 text-zinc-600 hover:border-zinc-700'}`}
                      >
                        <span className="text-xl leading-none">💳</span> CARTÃO
                      </button>
                      <button 
                        onClick={() => setPagamento('WHATSAPP')}
                        className={`py-4 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-black text-[10px] tracking-widest transition-all ${pagamento === 'WHATSAPP' ? 'border-impacto-yellow bg-impacto-yellow/10 text-impacto-yellow shadow-[0_0_20px_rgba(255,183,0,0.2)]' : 'border-zinc-800 bg-zinc-950/50 text-zinc-600 hover:border-zinc-700'}`}
                      >
                        <MessageCircle className="w-5 h-5" /> OUTROS
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={processarCheckoutNativo}
                  disabled={!session || loadingCheckout}
                  onMouseEnter={() => setIsHoveringBtn(true)}
                  onMouseLeave={() => setIsHoveringBtn(false)}
                  className={`w-full relative overflow-hidden group disabled:opacity-50 rounded-2xl py-6 font-black flex items-center justify-center gap-3 transition-all z-10 
                    ${pagamento === 'WHATSAPP' ? 'bg-[#25D366] hover:bg-[#22c55e] text-white shadow-[0_0_20px_rgba(37,211,102,0.3)]' : 
                      pagamento === 'PIX' ? 'bg-zinc-100 text-zinc-950 shadow-[0_0_30px_rgba(255,255,255,0.2)]' :
                      'bg-gradient-to-r from-impacto-yellow to-impacto-orange text-zinc-950 shadow-[0_0_30px_rgba(255,102,0,0.4)] border-b-4 border-impacto-red active:border-b-0 active:translate-y-1'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {loadingCheckout ? <Zap className="w-6 h-6 animate-pulse" /> : 
                      pagamento === 'WHATSAPP' ? <MessageCircle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />
                    }
                    <span className="tracking-widest uppercase text-sm">
                      {loadingCheckout ? 'ACELERANDO...' : 
                        !session ? 'ACESSE SUA CONTA' : 
                        pagamento === 'WHATSAPP' ? 'ENVIAR NO WHATSAPP' :
                        `FINALIZAR NO ${pagamento.replace('_', ' ')}`
                      }
                    </span>
                  </div>
                  {session && !loadingCheckout && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>}
                </motion.button>
                
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
