import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { tipo, valor, descricao, categoria } = await req.json();

    const updated = await prisma.financeiro.update({
      where: { id },
      data: {
        tipo,
        valor: parseFloat(valor),
        descricao,
        categoria
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return NextResponse.json({ message: "Erro ao atualizar transação" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Buscar a transação antes de deletar para ver se há um pedido vinculado
    const transacao = await prisma.financeiro.findUnique({
      where: { id }
    });

    if (!transacao) {
      return NextResponse.json({ message: "Transação não encontrada" }, { status: 404 });
    }

    // Tentar extrair o ID do pedido da descrição (ex: "Pedido #abc12345")
    const match = transacao.descricao.match(/Pedido #([a-f0-9]{8})/);
    const orderPartialId = match ? match[1] : null;

    await prisma.$transaction(async (tx) => {
      // 1. Se for uma venda com pedido vinculado, tentamos limpar o pedido
      if (orderPartialId) {
        // Buscamos o pedido real que começa com esse ID (o prefixo de 8 caracteres costuma ser único o suficiente para busca manual aqui)
        const order = await tx.order.findFirst({
          where: {
            id: {
              startsWith: orderPartialId
            }
          }
        });

        if (order) {
          // Deletar itens do pedido primeiro
          await tx.orderItem.deleteMany({
            where: { orderId: order.id }
          });
          // Deletar o pedido
          await tx.order.delete({
            where: { id: order.id }
          });
        }
      }

      // 2. Deletar a transação financeira
      await tx.financeiro.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir transação:", error);
    return NextResponse.json({ message: "Erro ao excluir transação" }, { status: 500 });
  }
}
