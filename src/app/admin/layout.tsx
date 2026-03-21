import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, ShoppingCart, LayoutDashboard, LogOut, ChevronLeft, Database } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 glass-premium p-4 md:p-6 flex flex-row md:flex-col gap-4 md:gap-8 shrink-0 relative z-20 items-center md:items-start justify-between md:justify-start">
        <div className="flex flex-col md:gap-2">
          <Link href="/" className="hidden md:flex text-zinc-500 hover:text-red-500 items-center gap-2 text-xs uppercase font-bold tracking-widest transition mb-4">
            <ChevronLeft className="w-4 h-4" /> Sair do Painel
          </Link>
          <Link href="/">
            <div className="relative h-6 md:h-8 w-24 md:w-32 self-start mb-1 group">
              <Image 
                src="/logo.png" 
                alt="Impacto Logo" 
                fill 
                className="object-contain grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all cursor-pointer" 
                quality={100}
              />
            </div>
          </Link>
          <h2 className="text-red-500 font-bold tracking-widest uppercase text-[9px] md:text-xs">Admin Dashboard</h2>
        </div>

        <nav className="flex flex-row md:flex-col gap-4 md:gap-4">
          <Link href="/admin" className="flex items-center gap-2 md:gap-3 text-zinc-400 hover:text-white transition group" title="Resumo">
            <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 group-hover:text-impacto-yellow transition" />
            <span className="font-black tracking-widest text-[9px] md:text-[10px] uppercase hidden sm:inline md:inline">Resumo</span>
          </Link>
          <Link href="/admin/produtos" className="flex items-center gap-2 md:gap-3 text-zinc-400 hover:text-white transition group" title="Estoque">
            <Package className="w-4 h-4 md:w-5 md:h-5 group-hover:text-impacto-orange transition" />
            <span className="font-black tracking-widest text-[9px] md:text-[10px] uppercase hidden sm:inline md:inline">Produtos</span>
          </Link>
          <Link href="/admin/pedidos" className="flex items-center gap-2 md:gap-3 text-zinc-400 hover:text-white transition group" title="Vendas">
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 group-hover:text-impacto-yellow transition" />
            <span className="font-black tracking-widest text-[9px] md:text-[10px] uppercase hidden sm:inline md:inline">Vendas</span>
          </Link>
          <Link href="/admin/sql" className="flex items-center gap-2 md:gap-3 text-zinc-400 hover:text-white transition group" title="SQL Editor">
            <Database className="w-4 h-4 md:w-5 md:h-5 group-hover:text-red-500 transition" />
            <span className="font-black tracking-widest text-[9px] md:text-[10px] uppercase hidden sm:inline md:inline">SQL Editor</span>
          </Link>
        </nav>

        <div className="hidden md:block text-[10px] text-zinc-500 pt-8 border-t border-zinc-800/50 mt-auto">
          Painel de Controle Interno
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-8 relative overflow-x-hidden">
        {/* Ambient Dark Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        {children}
      </main>
    </div>
  );
}
