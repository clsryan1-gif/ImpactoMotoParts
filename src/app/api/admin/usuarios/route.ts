import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Proteção de Rota - Apenas ADMIN
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Busca usuários com contagem de pedidos e soma total
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

    // Processa os dados para um formato mais amigável ao frontend
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
        createdAt: user.createdAt,
        ordersCount,
        totalSpent,
        isVIP: ordersCount >= 5
      };
    });

    return NextResponse.json(usersWithStats);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao carregar lista de pilotos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    // Verifica se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "E-mail já cadastrado" }, { status: 400 });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER"
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao criar piloto" }, { status: 500 });
  }
}
