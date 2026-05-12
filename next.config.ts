import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Disable Strict Mode to prevent Agora UID_CONFLICT errors caused by
  // React's double-mount behavior in development.
  reactStrictMode: false,
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:9002', '*.vercel.app'],
    },
    // Pre-compile these routes at dev server startup to avoid first-visit delay
    preloadEntriesOnStart: true,
  },
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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dzfgdbupfqgijtnziukd.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
