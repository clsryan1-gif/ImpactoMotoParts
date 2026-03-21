"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function executeSql(query: string) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Usamos queryRawUnsafe para permitir qualquer query enviada pelo admin
    const result = await prisma.$queryRawUnsafe(query);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
