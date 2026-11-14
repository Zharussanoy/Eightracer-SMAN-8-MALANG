import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep development independent of the incomplete output left after the disk filled up.
  distDir: process.env.NODE_ENV === "production" ? ".next-production" : ".next-local",
  experimental: {
    agentFeedback: true,
    // Avoid growing a persistent compiler cache on this space-constrained laptop.
    turbopackFileSystemCacheForDev: false,
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
