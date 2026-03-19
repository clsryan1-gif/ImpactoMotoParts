import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://impactomotoparts.com.br';

  const products = await prisma.product.findMany({
    where: { ativo: true },
    select: { id: true, createdAt: true }
  });

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/produtos/${p.id}`,
    lastModified: p.createdAt,
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/produtos`, lastModified: new Date() },
    { url: `${baseUrl}/checkout`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
    ...productUrls,
  ];
}
