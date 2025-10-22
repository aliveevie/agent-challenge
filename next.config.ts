import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during build for faster Docker builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during build for faster Docker builds
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
