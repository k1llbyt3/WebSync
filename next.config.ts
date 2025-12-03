import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // THIS IS THE CRITICAL FIX FOR DRAG & DROP
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
      },
    ],
  },
};

export default nextConfig;