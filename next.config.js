/** @type {import('next').NextConfig} */
const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE
  ? process.env.NEXT_PUBLIC_API_BASE.replace(/\/api$/, '')
  : 'https://api.bookingkub.com';

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.bookingkub.com' }
    ]
  },
  async rewrites() {
    return [
      {
        // Proxy /uploads/filename.jpg → API_ORIGIN/api/upload/files/filename.jpg
        source: '/uploads/:path*',
        destination: `${API_ORIGIN}/api/upload/files/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
