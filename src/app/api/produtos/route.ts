import { NextResponse } from "next/server";import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { ativo: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ message: "Erro ao buscar produtos" }, { status: 500 });
  }
}
