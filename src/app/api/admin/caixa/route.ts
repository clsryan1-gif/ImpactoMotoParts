import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Busca todas as transações
    const transactions = await prisma.financeiro.findMany({
      orderBy: { data: 'desc' },
      take: 50 // Últimas 50 por segurança
    });

    // Estatísticas do Caixa
    const stats = await prisma.financeiro.aggregate({
      _sum: { valor: true },
      where: { tipo: "ENTRADA" }
    });
    
    const exits = await prisma.financeiro.aggregate({
      _sum: { valor: true },
      where: { tipo: "SAIDA" }
    });

    const totalEntradas = stats._sum.valor || 0;
    const totalSaidas = exits._sum.valor || 0;
    const saldo = totalEntradas - totalSaidas;

    return NextResponse.json({
      transactions,
      summary: {
        totalEntradas,
        totalSaidas,
        saldo
      }
    });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao carregar dados do caixa" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { tipo, valor, descricao, categoria } = await req.json();

    if (!tipo || !valor || !descricao || !categoria) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
    }

    const transaction = await prisma.financeiro.create({
      data: {
        tipo, // ENTRADA ou SAIDA
        valor: parseFloat(valor),
        descricao,
        categoria
      }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao registrar transação" }, { status: 500 });
  }
}
