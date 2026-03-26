'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function hideOrder(orderId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "ADMIN") {
      throw new Error("Não autorizado");
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { hidden: true }
    });
    revalidatePath('/admin/pedidos');
    return { success: true };
  } catch (error) {
    console.error("Erro ao ocultar pedido:", error);
    return { success: false };
  }
}
