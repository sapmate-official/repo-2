/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    // If DATABASE_URL is set (Neon DB / Vercel), use native Prisma API routes
    if (process.env.DATABASE_URL) {
      return [];
    }
    // Fallback to Express backend if running in dual local mode
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5555';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
