import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // ETC media lives on DigitalOcean Spaces under ETC/ only (the bucket is shared)
    remotePatterns: [{ protocol: "https", hostname: "sbsi-cdn.sgp1.digitaloceanspaces.com", pathname: "/ETC/**" }],
  },
  experimental: {
    // enables forbidden() for role-gated admin pages
    authInterrupts: true,
  },
};

export default nextConfig;
