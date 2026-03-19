'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, QrCode, CreditCard, ExternalLink, ChevronRight, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { generatePixPayload } from '@/lib/pix';

function CheckoutSucessoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('order');
  const method = searchParams.get('method');

  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pixPayload, setPixPayload] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    // Busca detalhes do pedido para gerar o PIX real
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/pedidos/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrderTotal(data.total);
          
          // Gera o payload PIX Real com a chave do Ryan
          const payload = generatePixPayload('558396248424', data.total);
          setPixPayload(payload);
        }
      } catch (err) {
        // Erro silencioso
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handleCopy = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  if (!orderId) return null;

  const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[60px] pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-lg bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.2 }}
            className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
        </div>

        <h1 className="text-2xl font-black text-center text-white mb-2 tracking-wide uppercase">Pedido Registrado!</h1>
        <p className="text-zinc-400 text-center mb-8 text-sm">Seu pedido <strong className="text-white">#{orderId.substring(0, 8).toUpperCase()}</strong> está no nosso sistema.</p>

        {method === 'PIX' ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-zinc-300 font-bold uppercase tracking-widest text-sm">
              <QrCode className="w-5 h-5 text-green-500" /> Pagamento via PIX
            </div>
            
            <div className="relative group mx-auto w-48 h-48 bg-white p-3 rounded-2xl shadow-2xl">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                </div>
              ) : (
                <QRCodeSVG value={pixPayload} size={168} level="H" includeMargin={false} />
              )}
            </div>

            <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
              Valor do PIX: <span className="text-green-500 text-base ml-1">{BRL(orderTotal)}</span>
            </div>
            
            <div className="space-y-2 text-left">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Pix Copia e Cola / Payload</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={pixPayload} 
                  placeholder="Gerando código..."
                  className="w-full bg-zinc-900 text-[10px] text-zinc-500 p-3 rounded-xl border border-zinc-800 outline-none truncate font-mono" 
                />
                <button 
                  onClick={handleCopy} 
                  disabled={loading}
                  className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white px-4 rounded-xl transition-colors flex items-center justify-center shrink-0"
                >
                  {copiado ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-zinc-600 mt-4 leading-relaxed bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
              Pagamento validado via padrão Banco Central. Digitalize o QR Code acima para finalizar sua compra na <strong>Impacto Moto Parts</strong>.
            </p>
          </div>

        ) : (

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center space-y-4">
             <div className="flex items-center justify-center gap-2 text-zinc-300 font-bold uppercase tracking-widest text-sm mb-4">
              <CreditCard className="w-5 h-5 text-blue-500" /> Pagamento via Cartão
            </div>
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-500">
               <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-200">Pronto para Enviar</h3>
            <p className="text-xs text-zinc-500">Seu pedido foi reservado. Combine o pagamento no cartão com nosso consultor via WhatsApp.</p>
          </div>

        )}

        <div className="mt-8 pt-6 border-t border-zinc-800/60 flex flex-col gap-3">
          <Link href="/produtos">
            <button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2">
              Voltar ao Catálogo
            </button>
          </Link>
          <a href={`https://wa.me/558396248424?text=Olá IMPACTO, acabei de realizar o pedido #${orderId.substring(0,8).toUpperCase()} pelo site e paguei via ${method}. Queria combinar a entrega/retirada!`} target="_blank" rel="noreferrer" className="w-full py-4 bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-xl text-sm font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2">
            Avisar no WhatsApp <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </motion.div>
    </div>
  );
}

export default function CheckoutSucesso() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    }>
      <CheckoutSucessoContent />
    </Suspense>
  );
}
