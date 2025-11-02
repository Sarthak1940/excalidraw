import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/db", "@repo/backend-common", "@repo/common", "@repo/eslint-config", "@repo/tailwind-config"],
  webpack: (config) => {
    // Handle path aliases from the ui package
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib': path.resolve(__dirname, '../../packages/ui/src/lib'),
      '@/components': path.resolve(__dirname, '../../packages/ui/src/components'),
      '@/hooks': path.resolve(__dirname, '../../packages/ui/src/hooks'),
      '@/styles': path.resolve(__dirname, '../../packages/ui/src/styles'),
    };
    return config;
  },
};

export default nextConfig;
