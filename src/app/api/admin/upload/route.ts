import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    console.log("--- API UPLOAD V2 INICIADA ---");
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ 
        message: "Configuração do Supabase Storage faltando no .env" 
      }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = `produtos/${filename}`;

    // Upload via API REST direta do Supabase
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/Impactomotoparts/${filePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY, // Algumas APIs do Supabase exigem a chave aqui também
          'Content-Type': file.type
        },
        body: bytes
      }
    );

    if (!uploadRes.ok) {
      let errorMsg = "Erro no Supabase Storage";
      try {
        const errorData = await uploadRes.json();
        errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorMsg = await uploadRes.text();
      }
      console.error("Erro Real Supabase:", errorMsg);
      return NextResponse.json({ message: errorMsg }, { status: 500 });
    }

    // URL pública final
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/Impactomotoparts/${filePath}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Erro Fatal no Upload:", error);
    return NextResponse.json({ message: error.message || "Erro interno no servidor de upload" }, { status: 500 });
  }
}
