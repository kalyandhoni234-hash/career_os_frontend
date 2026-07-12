import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    const backend = process.env.VERCEL
      ? "https://career-os-hlxt.onrender.com"
      : process.env.API_BACKEND_URL || "http://127.0.0.1:5001";
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
