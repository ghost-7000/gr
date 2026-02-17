import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
