import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server that can be run by DigitalOcean App
  // Platform without shipping the full development dependency tree.
  output: "standalone",
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
