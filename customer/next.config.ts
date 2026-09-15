import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "authjs.dev",
      },
      {
        protocol: "https",
        hostname: "flags.restcountries.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path((?!auth/).*)",
        destination: "http://127.0.0.1:5000/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://127.0.0.1:5000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
