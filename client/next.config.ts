import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './empty.js',
      },
    },
  },
};

export default nextConfig;
