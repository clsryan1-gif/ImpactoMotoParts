import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      }
    ],
  },
};

export default nextConfig;
