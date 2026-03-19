import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import InventoryList from "@/components/InventoryList";
import { Package, Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminProdutos() {
  const produtos = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-in fade-in space-y-8">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-red-600" />
            Inventário de Peças
          </h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-tighter mt-1">
            Gerencie seu estoque — {produtos.length} itens cadastrados
          </p>
        </div>

        <Link href="/admin/produtos/novo">
          <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-red-500/20 active:scale-95">
            <Plus className="w-4 h-4" /> Adicionar Peça
          </button>
        </Link>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800/80 p-8 rounded-[2.5rem] flex flex-col min-h-[60vh]">
        <InventoryList produtos={produtos} />
      </div>

    </div>
  );
}
