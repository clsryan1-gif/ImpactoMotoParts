import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Usuário deve estar logado
    if (!session || !session.user) {
      return NextResponse.json({ message: "Faça login para finalizar a compra." }, { status: 401 });
    }

    const { itens, paymentType, endereco, taxaEntrega } = await req.json();

    if (!itens || !itens.length || !paymentType) {
      return NextResponse.json({ message: "Carrinho vazio ou pagamento não selecionado." }, { status: 400 });
    }

    // Tratamento de segurança: impedir taxas de entrega negativas que descontariam o total
    const sanitizedTaxaEntrega = Math.max(0, Number(taxaEntrega) || 0);

    // Agrupar itens para processar quantidades e baixar estoque corretamente
    const cartItemsMap = new Map<string, { product: any, quantity: number }>();
    
    for (const item of itens) {
      const id = String(item.id);
      if (cartItemsMap.has(id)) {
        cartItemsMap.get(id)!.quantity += 1;
      } else {
        const product = await prisma.product.findUnique({ where: { id } });
        if (product) {
          cartItemsMap.set(id, { product, quantity: 1 });
        }
      }
    }

    if (cartItemsMap.size === 0) {
      return NextResponse.json({ message: "Produtos não encontrados no estoque." }, { status: 404 });
    }

    // --- VALIDAÇÃO DE ESTOQUE (NOVO) ---
    // Verifica se todos os itens têm estoque suficiente antes de iniciar a transação
    for (const [id, info] of cartItemsMap) {
      if (info.product.estoque < info.quantity) {
        return NextResponse.json({ 
          message: `Desculpe, o produto "${info.product.nome}" acabou de esgotar ou não possui unidades suficientes (Disponível: ${info.product.estoque}).`,
          insufficientStock: true 
        }, { status: 400 });
      }
    }

    let total = 0;
    const orderItemsData: any[] = [];
    
    cartItemsMap.forEach(({ product, quantity }) => {
      total += product.preco * quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: quantity,
        price: product.preco
      });
    });

    // Cria o Pedido (Order) com seus items e atualiza estoque
    const order = await prisma.$transaction(async (tx) => {
      // 1. Criar a ordem
      const newOrder = await tx.order.create({
        data: {
          userId: (session.user as any).id || session.user.email,
          total: total + sanitizedTaxaEntrega,
          status: "PENDENTE",
          paymentType: String(paymentType),
          endereco: typeof endereco === 'object' ? JSON.stringify(endereco) : String(endereco || ''),
          taxaEntrega: sanitizedTaxaEntrega,
          items: {
            create: orderItemsData
          }
        }
      });

      // 3. Dar baixa no estoque de cada produto agrupado
      for (const [productId, info] of cartItemsMap) {
        // Double-check no estoque dentro da transação para garantir atomicidade
        const p = await tx.product.findUnique({ where: { id: productId } });
        if (!p || p.estoque < info.quantity) {
          throw new Error(`Estoque insuficiente para o item: ${info.product.nome}`);
        }

        await tx.product.update({
          where: { id: productId },
          data: {
            estoque: {
              decrement: info.quantity
            }
          }
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ 
      message: err.message || "Erro ao processar pedido no servidor.",
    }, { status: 500 });
  }
}
