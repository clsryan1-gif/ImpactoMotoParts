import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { partialProductSchema } from "@/lib/validations";

// PATCH — Editar produto
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    
    // Validação Parcial com Zod
    const validation = partialProductSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map(e => e.message).join(", ");
      return NextResponse.json({ message: `Dados inválidos: ${errorMsg}` }, { status: 400 });
    }

    const data = validation.data;
    const updateData: any = {};

    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.categoria !== undefined) updateData.categoria = data.categoria;
    if (data.compatibilidade !== undefined) updateData.compatibilidade = data.compatibilidade;
    if (data.preco !== undefined) updateData.preco = data.preco;
    if (data.imagem !== undefined) updateData.imagem = data.imagem;
    if (data.estoque !== undefined) updateData.estoque = data.estoque;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    const produto = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(produto);
  } catch (err: any) {
    return NextResponse.json({ message: "Erro ao atualizar produto", error: err.message }, { status: 500 });
  }
}

// DELETE — Excluir produto (com cascata manual para OrderItems)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Deletar em transaction: primeiro os itens de pedido vinculados, depois o produto
    await prisma.$transaction([
      // 1) Remove todos os OrderItems que referenciam este produto
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      // 2) Remove o produto em si
      prisma.product.delete({ where: { id: id } }),
    ]);

    return NextResponse.json({ message: "Produto excluído com sucesso" });
  } catch (err: any) {
    return NextResponse.json({ message: "Erro ao excluir produto", error: err.message }, { status: 500 });
  }
}

