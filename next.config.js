/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uxwing.com",
        port: "",
        pathname: "/wp-content/themes/uxwing/download/**",
      },
      {
        protocol: "https",
        hostname: "studying-farmer.kr.object.ncloudstorage.com",
        port: "",
        pathname: "/**",
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
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

module.exports = nextConfig;
