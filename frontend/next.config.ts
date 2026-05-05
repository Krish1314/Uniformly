import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allowedDevOrigins should be at the top level, not inside experimental
  // @ts-ignore
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
