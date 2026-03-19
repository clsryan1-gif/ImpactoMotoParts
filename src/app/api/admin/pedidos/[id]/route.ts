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
    const { status } = await req.json();

    // 1. Buscar status atual para saber se era PAGO
    const previousOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!previousOrder) {
      return NextResponse.json({ message: "Pedido não encontrado" }, { status: 404 });
    }

    // 2. Transação para atualizar status e sincronizar financeiro
    await prisma.$transaction(async (tx) => {
      // Atualizar pedido
      await tx.order.update({
        where: { id },
        data: { status }
      });

      // Lógica de Estoque:
      // Se era CANCELADO e agora NÃO É -> Diminuir estoque (validando saldo)
      if (previousOrder.status === 'CANCELADO' && status !== 'CANCELADO') {
        for (const item of previousOrder.items) {
          if (item.product.estoque < item.quantity) {
            throw new Error(`Estoque insuficiente para o produto ${item.product.nome}`);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { estoque: { decrement: item.quantity } }
          });
        }
      }

      // Se NÃO ERA CANCELADO e agora É -> Repor estoque
      if (previousOrder.status !== 'CANCELADO' && status === 'CANCELADO') {
        for (const item of previousOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { estoque: { increment: item.quantity } }
          });
        }
      }

      // Lógica Financeira:
      // Se era PAGO e deixou de ser -> Remove do financeiro
      if (previousOrder.status === 'PAGO' && status !== 'PAGO') {
        await tx.financeiro.deleteMany({
          where: {
            descricao: { contains: id.substring(0, 8) }
          }
        });
      }
      
      // Se não era PAGO e agora é -> Adiciona no financeiro
      if (previousOrder.status !== 'PAGO' && status === 'PAGO') {
        await tx.financeiro.create({
          data: {
            tipo: "ENTRADA",
            valor: previousOrder.total,
            descricao: `Venda via ${previousOrder.paymentType} - Pedido #${id.substring(0, 8)}`,
            categoria: "VENDA"
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Erro ao atualizar status" }, { status: 500 });
  }
}
