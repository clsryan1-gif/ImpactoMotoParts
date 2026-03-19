import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🏁 Limpando catálogo antigo...');
  await prisma.product.deleteMany({});

  console.log('🏁 Iniciando Seed de Estresse...');

  const produtos = [
    { nome: 'Kit Transmissão DID Racing', categoria: 'Transmissão', compatibilidade: 'Honda CRF 250/450', preco: 850.00, estoque: 25, imagem: '/logo.png' },
    { nome: 'Pneu Michelin Starcross 6', categoria: 'Pneus', compatibilidade: 'Universal Aro 19/21', preco: 620.00, estoque: 40, imagem: '/logo.png' },
    { nome: 'Guidão Pro Taper Fuzion', categoria: 'Acessórios', compatibilidade: 'Universal 28mm', preco: 1200.00, estoque: 15, imagem: '/logo.png' },
    { nome: 'Escapamento FMF Factory 4.1', categoria: 'Exaustão', compatibilidade: 'Yamaha YZF 250', preco: 4500.00, estoque: 5, imagem: '/logo.png' },
    { nome: 'Óleo Motul 7100 10W40', categoria: 'Lubrificantes', compatibilidade: 'Motos 4 Tempos', preco: 110.00, estoque: 100, imagem: '/logo.png' },
    { nome: 'Filtro de Ar Twin Air', categoria: 'Motor', compatibilidade: 'KTM EXC 300', preco: 180.00, estoque: 50, imagem: '/logo.png' },
    { nome: 'Kit Plásticos Acerbis', categoria: 'Plásticos', compatibilidade: 'Kawasaki KXF 450', preco: 950.00, estoque: 10, imagem: '/logo.png' },
    { nome: 'Manete Retrátil Biker', categoria: 'Acessórios', compatibilidade: 'Nacional/Importada', preco: 280.00, estoque: 30, imagem: '/logo.png' },
  ];

  for (const p of produtos) {
    await prisma.product.create({
      data: p
    });
  }

  console.log('✅ Catálogo populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
