import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://impactomotoparts.com.br';

  let productUrls: any[] = [];
  
  try {
    const products = await prisma.product.findMany({
      where: { ativo: true },
      select: { id: true, createdAt: true }
    });

    productUrls = products.map((p) => ({
      url: `${baseUrl}/produtos/${p.id}`,
      lastModified: p.createdAt,
    }));
  } catch (error) {
    console.warn('⚠️ Build-time sitemap warning: Database unreachable. Skipping product URLs for now. This will be fixed at runtime.');
  }

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/produtos`, lastModified: new Date() },
    { url: `${baseUrl}/checkout`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
    ...productUrls,
  ];
}
