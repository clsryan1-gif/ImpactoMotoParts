import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const check = {
        url_exists: !!SUPABASE_URL,
        key_exists: !!SUPABASE_KEY,
        url: SUPABASE_URL || "null",
        bucket: "impactomotoparts"
    };

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ 
        message: "ERRO: Variáveis de ambiente faltando!",
        check
      });
    }

    // Tentar buscar informações do bucket para testar chaves
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/bucket/impactomotoparts`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY
        }
      }
    );

    const storageData = await res.json();

    return NextResponse.json({ 
        status: res.ok ? "CONEXÃO OK" : "ERRO DE CONEXÃO",
        http_code: res.status,
        supabase_response: storageData,
        check
    });
  } catch (error: any) {
    return NextResponse.json({ message: "CRASH NO SERVIDOR", error: error.message }, { status: 500 });
  }
}
