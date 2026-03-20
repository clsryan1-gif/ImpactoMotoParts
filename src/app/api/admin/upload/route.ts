import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Converter para buffer para gerar Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Transformar em Data URL (Base64)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    return NextResponse.json({ url: base64Image });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ message: "Erro ao processar imagem para o banco" }, { status: 500 });
  }
}
