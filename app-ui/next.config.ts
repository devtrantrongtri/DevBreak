import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Tắt ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Optimize for production
  experimental: {
    optimizeCss: true,
  },
  // Configure API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'http://app-server:3000/:path*'  // Docker internal network
          : 'http://localhost:3000/:path*'   // Development
      }
    ];
  },
};

export default nextConfig;
