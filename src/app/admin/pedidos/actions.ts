'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function hideOrder(orderId: string) {
  try {
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
