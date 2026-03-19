import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingCart, LayoutDashboard, LogOut, ChevronLeft } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 bg-zinc-900/50 border-r border-zinc-800/50 p-6 flex flex-col gap-8 shrink-0 relative z-20">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-zinc-500 hover:text-red-500 flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition mb-4">
            <ChevronLeft className="w-4 h-4" /> Sair do Painel
          </Link>
          <Link href="/">
            <img src="/logo.png" alt="Impacto Logo" className="h-8 object-contain self-start grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer" />
          </Link>
          <h2 className="text-red-500 font-bold tracking-widest uppercase text-xs">Admin Dashboard</h2>
        </div>

        <nav className="flex flex-col gap-4 flex-1">
          <Link href="/admin" className="flex items-center gap-3 text-zinc-400 hover:text-white transition group">
            <LayoutDashboard className="w-5 h-5 group-hover:text-impacto-yellow transition" />
            <span className="font-black tracking-widest text-[10px] uppercase">Resumo</span>
          </Link>
          <Link href="/admin/produtos" className="flex items-center gap-3 text-zinc-400 hover:text-white transition group">
            <Package className="w-5 h-5 group-hover:text-impacto-orange transition" />
            <span className="font-black tracking-widest text-[10px] uppercase">Inventário</span>
          </Link>
          <Link href="/admin/pedidos" className="flex items-center gap-3 text-zinc-400 hover:text-white transition group">
            <ShoppingCart className="w-5 h-5 group-hover:text-impacto-yellow transition" />
            <span className="font-black tracking-widest text-[10px] uppercase">Vendas</span>
          </Link>
        </nav>

        <div className="text-xs text-zinc-500 pt-8 border-t border-zinc-800/50 mt-auto">
          Painel de Controle Interno - Impacto Moto Parts
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-8 relative overflow-x-hidden">
        {/* Ambient Dark Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        {children}
      </main>
    </div>
  );
}
