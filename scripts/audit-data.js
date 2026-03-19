
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const allOrders = await prisma.order.findMany({
    include: { items: true }
  });
  
  console.log('--- AUDITORIA DE PEDIDOS ---');
  console.log(`Total de pedidos: ${allOrders.length}`);
  
  const stats = allOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    if (order.status === 'PAGO') {
      acc.faturamento = (acc.faturamento || 0) + order.total;
    }
    return acc;
  }, { faturamento: 0 });
  
  console.log('Status:', stats);
  
  allOrders.forEach(o => {
    console.log(`ID: ${o.id.substring(0,8)} | Status: ${o.status} | Total: ${o.total} | Itens: ${o.items.length}`);
  });

  await prisma.$disconnect();
}

main();
