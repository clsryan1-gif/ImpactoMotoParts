import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Lista de Administradores (IMPACTO MOTO PARTS) ---');
  
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (admins.length === 0) {
      console.log('Nenhum administrador encontrado.');
    } else {
      admins.forEach(admin => {
        console.log(`[${admin.id.substring(0, 8)}] ${admin.name} <${admin.email}> - Role: ${admin.role}`);
      });
    }

  } catch (error) {
    console.error('Erro ao buscar administradores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
