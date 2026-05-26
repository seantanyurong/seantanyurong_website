import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't walk up and pick a stale
  // package-lock.json sitting in a parent directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
