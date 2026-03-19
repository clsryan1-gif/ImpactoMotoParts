'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, ShoppingBag, Calendar, Mail, Shield, Crown, Pencil, Trash2, X, Save, Zap, AlertTriangle, UserCog, UserPlus, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  isVIP: boolean;
};

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function UserList({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  
  // Modais
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      showToast('Preencha os campos obrigatórios!', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao criar piloto');

      // Adiciona na lista local (fake stats para o novo)
      const addedUser: User = {
        ...data,
        ordersCount: 0,
        totalSpent: 0,
        isVIP: false,
        createdAt: new Date().toISOString()
      };
      
      setUsers([addedUser, ...users]);
      showToast('Novo piloto cadastrado com sucesso!', 'success');
      setIsAddingUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'USER' });
      router.refresh();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Erro ao excluir');

      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('Piloto removido com sucesso!', 'success');
      setDeletingId(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          role: editUser.role
        }),
      });
      
      if (!res.ok) throw new Error('Erro ao atualizar cadastro');

      setUsers(prev => prev.map(u => u.id === editUser.id ? editUser : u));
      showToast('Cadastro atualizado com sucesso!', 'success');
      setEditUser(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Add Button */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group w-full max-w-md">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-red-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text"
            placeholder="Buscar piloto por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-red-500 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium outline-none transition-all placeholder:text-zinc-600"
          />
        </div>

        <button 
          onClick={() => setIsAddingUser(true)}
          className="w-full md:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white border border-zinc-800/80 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-[0.15em] text-[10px] font-black"
        >
          <UserPlus className="w-4 h-4" />
          Novo Piloto
        </button>
      </div>

      {/* Grid de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-3xl">
            Nenhum piloto encontrado com esse termo.
          </div>
        ) : (
          filteredUsers.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 hover:border-purple-500/30 rounded-3xl p-6 transition-all group relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent"></div>
                  <Users className="w-6 h-6 text-zinc-400" />
                  {user.isVIP && (
                    <div className="absolute -top-1 -right-1">
                      <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {user.role === "ADMIN" && (
                    <span className="bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 border border-red-500/20">
                      <Shield className="w-3 h-3" /> STAFF
                    </span>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setEditUser(user)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition shadow-lg">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeletingId(user.id)} className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 transition shadow-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-white font-black uppercase tracking-wide truncate">{user.name}</h3>
                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-900">
                  <div className="flex items-center gap-2 text-zinc-600 mb-1">
                    <ShoppingBag className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Pedidos</span>
                  </div>
                  <span className="text-white font-black text-xl">{user.ordersCount}</span>
                </div>
                <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-900">
                  <div className="flex items-center gap-2 text-zinc-600 mb-1">
                    <Crown className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Investido</span>
                  </div>
                  <span className="text-green-500 font-black text-lg">{BRL(user.totalSpent)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </div>
                {user.isVIP && <span className="text-yellow-500">CLIENTE VIP</span>}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal: Adicionar Novo Piloto */}
      <AnimatePresence>
        {isAddingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-zinc-700 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative">
              <button onClick={() => setIsAddingUser(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
              <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                <UserPlus className="w-7 h-7 text-purple-500" /> Novo Piloto
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Nome Completo</label>
                  <input type="text" placeholder="Ex: João Silva" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl px-5 py-4 text-sm text-white outline-none transition" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">E-mail</label>
                  <input type="email" placeholder="piloto@exemplo.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl px-5 py-4 text-sm text-white outline-none transition" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Senha Provisória</label>
                  <div className="relative">
                    <input type="password" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl px-5 py-4 pl-12 text-sm text-white outline-none transition" />
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Cargo / Permissão</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl px-5 py-4 text-sm text-white outline-none transition appearance-none cursor-pointer">
                    <option value="USER">PILOTO (CLIENTE)</option>
                    <option value="ADMIN">STAFF (ADMINISTRADOR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button onClick={() => setIsAddingUser(false)} className="py-4 rounded-2xl border border-zinc-800 text-zinc-400 font-black hover:text-white transition uppercase tracking-widest text-xs">Cancelar</button>
                <button onClick={handleCreate} disabled={loading} className="py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black transition flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 shadow-lg shadow-purple-500/20">
                  {loading ? <Zap className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Cadastrando...' : 'Cadastrar Piloto'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {deletingId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} className="bg-zinc-900 border border-red-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Excluir Piloto?</h3>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Isso removerá todo o histórico de pedidos deste usuário também. Esta ação não tem volta.</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDeletingId(null)} className="py-4 rounded-2xl border border-zinc-800 text-zinc-400 font-bold hover:text-white transition">CANCELAR</button>
                <button onClick={() => handleDelete(deletingId)} disabled={loading} className="py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black transition disabled:opacity-50">EXCLUIR</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Edição de Usuário */}
      <AnimatePresence>
        {editUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4" onClick={() => setEditUser(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-zinc-700 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setEditUser(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
              <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                <UserCog className="w-7 h-7 text-purple-500" /> Editar Piloto
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Nome Completo</label>
                  <input type="text" value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl px-5 py-4 text-sm text-white outline-none transition" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">E-mail de Contato</label>
                  <input type="email" value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl px-5 py-4 text-sm text-white outline-none transition" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Cargo / Nível de Acesso</label>
                  <select value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl px-5 py-4 text-sm text-white outline-none transition appearance-none cursor-pointer">
                    <option value="USER">PILOTO (CLIENTE)</option>
                    <option value="ADMIN">STAFF (ADMINISTRADOR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button onClick={() => setEditUser(null)} className="py-4 rounded-2xl border border-zinc-800 text-zinc-400 font-black hover:text-white transition uppercase tracking-widest text-xs">Descartar</button>
                <button onClick={handleUpdate} disabled={loading} className="py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black transition flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50">
                  {loading ? <Zap className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Salvando...' : 'Salvar Dados'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
