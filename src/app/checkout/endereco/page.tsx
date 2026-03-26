'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Truck, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const BAIRROS_POR_CIDADE = {
  "Santa Rita": [
    { nome: "Tibiri (Santa Rita)", taxa: 10 },
    { nome: "Marcos Moura (Santa Rita)", taxa: 12 },
    { nome: "Heitel Santiago (Santa Rita)", taxa: 12 },
    { nome: "Várzea Nova (Santa Rita)", taxa: 10 },
    { nome: "Centro (Santa Rita)", taxa: 8 },
    { nome: "Alto das Populares (Santa Rita)", taxa: 10 },
    { nome: "Açude (Santa Rita)", taxa: 10 },
    { nome: "Popular (Santa Rita)", taxa: 10 },
  ],
  "Bayeux": [
    { nome: "Centro (Bayeux)", taxa: 15 },
    { nome: "Mário Andreaza (Bayeux)", taxa: 18 },
    { nome: "Rio do Meio (Bayeux)", taxa: 15 },
    { nome: "Comercial Norte (Bayeux)", taxa: 15 },
    { nome: "Brasília (Bayeux)", taxa: 15 },
    { nome: "Sesi (Bayeux)", taxa: 15 },
    { nome: "Tambay (Bayeux)", taxa: 15 },
    { nome: "Imaculada (Bayeux)", taxa: 15 },
    { nome: "Jardim Aeroporto (Bayeux)", taxa: 18 },
    { nome: "Alto da Boa Vista (Bayeux)", taxa: 18 },
  ],
  "Região Próxima": [
    { nome: "Bairro das Indústrias", taxa: 20 },
    { nome: "Oitizeiro", taxa: 20 },
    { nome: "Cruz das Armas", taxa: 22 },
    { nome: "Funcionários", taxa: 25 }
  ]
};

// Flatten for search/find logic
const BAIRROS_FLAT = Object.values(BAIRROS_POR_CIDADE).flat();

export default function EnderecoPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState<'ENTREGA' | 'RETIRADA'>('ENTREGA');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem('@impacto-endereco');
    if (salvo) {
      try {
        const data = JSON.parse(salvo);
        setRua(data.rua || '');
        setNumero(data.numero || '');
        setComplemento(data.complemento || '');
        setBairro(data.bairro || '');
        if (data.tipo === 'RETIRADA') setTipoEntrega('RETIRADA');
      } catch (e) {}
    }
  }, []);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tipoEntrega === 'ENTREGA') {
      if (rua.trim().length < 3) {
        showToast("⚠️ O endereço precisa de pelo menos 3 caracteres.", "error");
        return;
      }
      if (!numero.trim()) {
        showToast("⚠️ O número da residência é obrigatório.", "error");
        return;
      }
      if (!bairro) {
        showToast("📍 Por favor, selecione um bairro válido.", "error");
        return;
      }
    }

    setLoading(true);

    const b = BAIRROS_FLAT.find(x => x.nome === bairro);
    const taxa = b ? b.taxa : 0;

    const endereco = tipoEntrega === 'RETIRADA' 
      ? { rua: 'Retirada na Loja', numero: 'Impacto', complemento: 'Sede Física', bairro: 'SANTA RITA', taxa: 0, tipo: 'RETIRADA' }
      : { rua, numero, complemento, bairro, taxa, tipo: 'ENTREGA' };

    localStorage.setItem('@impacto-endereco', JSON.stringify(endereco));
    showToast("🏁 Destino confirmado com sucesso!", "success");

    setTimeout(() => {
      router.push('/checkout');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20">
      
      {/* HEADER SIMPLIFICADO */}
      <header className="glass-premium sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/checkout">
            <motion.div 
              whileHover={{ x: -3, color: 'var(--impacto-yellow)' }}
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
                className="object-contain" 
                priority
              />
            </div>
          </Link>
          
          <div className="w-16"></div> 
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-black-ops)] tracking-tighter flex items-center gap-3">
            <Truck className="w-8 h-8 md:w-10 md:h-10 text-impacto-yellow" />
            ONDE <span className="text-racing-gradient">ENTREGAR?</span>
          </h1>
          <p className="text-zinc-500 mt-2 font-black uppercase tracking-widest text-[10px]">Defina o box de destino para suas peças.</p>
        </motion.div>

        {/* TOGGLE ENTREGA / RETIRADA */}
        <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 mb-8 max-w-sm mx-auto">
          <button 
            type="button"
            onClick={() => setTipoEntrega('ENTREGA')}
            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tipoEntrega === 'ENTREGA' ? 'bg-impacto-yellow text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            Entregue em Casa
          </button>
          <button 
            type="button"
            onClick={() => setTipoEntrega('RETIRADA')}
            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tipoEntrega === 'RETIRADA' ? 'bg-impacto-yellow text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            Retiro na Loja (Grátis)
          </button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-6">
          <div className="glass-premium rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-impacto-red/5 rounded-full blur-3xl -z-10"></div>
            
            {tipoEntrega === 'ENTREGA' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="text" required
                      value={rua} onChange={e => setRua(e.target.value)}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-12 py-4 outline-none focus:border-impacto-yellow transition-all text-sm"
                      placeholder="Ex: Av. Epitácio Pessoa"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Número</label>
                  <input 
                    type="text" required
                    value={numero} onChange={e => setNumero(e.target.value)}
                    className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:border-impacto-yellow transition-all text-sm"
                    placeholder="Ex: 123"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Complemento (Opcional)</label>
                  <input 
                    type="text"
                    value={complemento} onChange={e => setComplemento(e.target.value)}
                    className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:border-impacto-yellow transition-all text-sm"
                    placeholder="Ex: Apt 101, Bloco A"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Bairro para Entrega</label>
                  <div className="relative">
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <select 
                      required
                      value={bairro} onChange={e => setBairro(e.target.value)}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-12 py-4 outline-none focus:border-impacto-yellow transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-zinc-900">Selecione o bairro...</option>
                      {Object.entries(BAIRROS_POR_CIDADE).map(([cidade, bairros]) => (
                        <optgroup key={cidade} label={cidade.toUpperCase()} className="bg-zinc-900 text-impacto-yellow font-black">
                          {bairros.map(b => (
                            <option key={b.nome} value={b.nome} className="bg-zinc-900 text-white font-sans">
                              {b.nome} — R$ {b.taxa.toFixed(2)}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                      <ChevronLeft className="w-4 h-4 rotate-270" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/20 border border-dashed border-zinc-800 rounded-3xl p-10 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-impacto-yellow/10 rounded-full flex items-center justify-center mx-auto border border-impacto-yellow/20">
                  <MapPin className="w-8 h-8 text-impacto-yellow" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Vou retirar na Impacto</h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Nenhum custo adicional será cobrado pelo envio.</p>
                </div>
                <div className="pt-4 border-t border-zinc-800/50">
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Endereço para Retirada:</p>
                  <p className="text-zinc-400 text-xs font-black mt-1 uppercase">Santa Rita, PB - Impacto Moto Parts</p>
                </div>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-impacto-yellow to-impacto-orange text-zinc-950 font-black uppercase tracking-widest py-5 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg border-b-4 border-impacto-red"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  CONFIRMAR ENDEREÇO
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-zinc-600 text-center mt-10 leading-relaxed max-w-xs mx-auto font-black uppercase tracking-tighter">
          ENTREGA RÁPIDA IMPACTO: SEU EQUIPAMENTO NO BOX EM TEMPO RECORDE.
        </p>
      </main>

      <style jsx global>{`
        select {
          background-image: none !important;
        }
        .rotate-270 {
          transform: rotate(-90deg);
        }
      `}</style>
    </div>
  );
}
