import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH — Editar usuário ou mudar cargo
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  // Proteção extra: Não permitir que o admin mude o próprio cargo ou se exclua acidentalmente sem cuidado
  // Mas deixaremos habilitado conforme pedido, com cautela.

  try {
    const data = await req.json();
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role; // USER ou ADMIN

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ message: "Erro ao atualizar usuário", error: err.message }, { status: 500 });
  }
}

// DELETE — Excluir usuário (com cascata manual para Pedidos se necessário)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  // Proteção: Não permitir que o admin se auto-exclua
  if (id === session.user?.id || (session.user as any).id === id) {
    return NextResponse.json({ message: "Você não pode excluir sua própria conta administrativa" }, { status: 400 });
  }

  try {
    // Primeiro deletamos ou desconectamos pedidos? 
    // Por simplicidade e segurança de dados, vamos apenas deletar o usuário. 
    // Se houver pedidos, o prisma pode barrar por FK.
    
    await prisma.$transaction([
      // 1) Remove orderItems dos pedidos deste usuário
      prisma.orderItem.deleteMany({
        where: { order: { userId: id } }
      }),
      // 2) Remove os pedidos
      prisma.order.deleteMany({
        where: { userId: id }
      }),
      // 3) Remove o usuário
      prisma.user.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ message: "Usuário e dados vinculados excluídos com sucesso" });
  } catch (err: any) {
    console.error("Erro ao excluir usuário:", err);
    return NextResponse.json({ message: "Erro ao excluir usuário", error: err.message }, { status: 500 });
  }
}
