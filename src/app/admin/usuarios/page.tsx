import { prisma } from "@/lib/prisma";
import UserList from "@/components/UserList";
import { Users } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  // Chamamos a lógica diretamente (Server Component) para melhor performance
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      orders: {
        select: {
          total: true,
          status: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const usersWithStats = users.map(user => {
    const ordersCount = user.orders.length;
    const totalSpent = user.orders
      .filter(o => o.status === "PAGO")
      .reduce((sum, o) => sum + o.total, 0);

    return {
      id: user.id,
      name: user.name || "Piloto sem nome",
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      ordersCount,
      totalSpent,
      isVIP: ordersCount >= 5
    };
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-white">Gestão de Pilotos</h1>
            <p className="text-zinc-500 text-sm">Visualize o engajamento e histórico de todos os usuários registrados.</p>
          </div>
        </div>
      </header>

      <UserList initialUsers={usersWithStats} />
    </div>
  );
}
