import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Proteção de Rota
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validação com Zod
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map(e => e.message).join(", ");
      return NextResponse.json({ message: `Dados inválidos: ${errorMsg}` }, { status: 400 });
    }

    const { nome, categoria, compatibilidade, preco, imagem, estoque } = validation.data;

    const product = await (prisma.product as any).create({
      data: {
        nome,
        categoria,
        compatibilidade,
        preco,
        imagem,
        estoque
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ 
      message: `Erro no servidor: ${err.message || "Erro desconhecido"}`,
    }, { status: 500 });
  }
}
