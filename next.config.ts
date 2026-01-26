import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Moved from experimental.serverComponentsExternalPackages
  serverExternalPackages: ["postgres"],
  // Turbopack configuration
  turbopack: {
    // Turbopack resolves modules correctly by default
    // No additional configuration needed for module resolution
  },
};

export default nextConfig;
