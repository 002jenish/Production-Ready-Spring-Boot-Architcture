import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["jszip"],
  turbopack: {},
};

export default nextConfig;
