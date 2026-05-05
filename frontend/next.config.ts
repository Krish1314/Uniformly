import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // This allows the dev server to accept connections from 127.0.0.1
    // @ts-ignore - experimental field might not be in type yet depending on version
    allowedDevOrigins: ["127.0.0.1", "localhost"],
  }
};

export default nextConfig;
