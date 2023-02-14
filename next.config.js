/** @type {import('next').NextConfig} */
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
    ],
  },
};

module.exports = nextConfig;
