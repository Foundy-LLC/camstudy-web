/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // TODO: Media server SSL 인증서 공인 인증 받고 나서 인증 무시하고 접속하는 코드 삭제하기
  https: {
    trustAllCertificates: true,
  },
  images: {
    remotePatterns: [
      // {
      //   protocol: "https",
      //   hostname: "uxwing.com",
      //   port: "",
      //   pathname: "/wp-content/themes/uxwing/download/**",
      // },
      // {
      //   protocol: "https",
      //   hostname: "studying-farmer.kr.object.ncloudstorage.com",
      //   port: "",
      //   pathname: "/**",
      // },

      // TODO: 위에 걸로 바꾸기
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
