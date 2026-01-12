import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // It ignores all TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
