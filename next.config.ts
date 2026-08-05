import type { NextConfig } from "next";

// Vercel automatically sets process.env.VERCEL = "1"
const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  // Do NOT set output: "standalone" on Vercel as it causes the next-server.js.nft.json ENOENT error
  ...(isVercel ? {} : { output: "standalone" }),
  serverExternalPackages: ["jszip"],
  turbopack: {},
};

export default nextConfig;
