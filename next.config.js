/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  async rewrites() {
    return [
      {
        source: "/rank-server/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_RANK_SERVER_BASE_URL}/:path*`,
      },
      {
        source: "/media-router/:path*",
        destination: `${process.env.NEXT_PUBLIC_MEDIA_ROUTER_BASE_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
