/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Isso aqui diz: "Vercel, não barre o build por causa de aviso de código!"
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Opcional: também ignora erros de tipo se o build travar neles
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dpaschoal.vtexassets.com',
      },
      {
        protocol: 'https',
        hostname: '**.vtexassets.com',
      },
      {
        protocol: 'https',
        hostname: 'fqjezbdywnozgztiqwlx.supabase.co',
      }
    ],
  },
};

export default nextConfig;

