import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    // Exclude local storage directory from bundle tracing
    // (download route uses dynamic path.resolve which triggers Turbopack NFT warning)
    "*": ["./storage/**"],
  },
};

export default nextConfig;
