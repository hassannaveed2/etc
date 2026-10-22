import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // enables forbidden() for role-gated admin pages
    authInterrupts: true,
  },
};

export default nextConfig;
