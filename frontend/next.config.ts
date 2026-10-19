import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for Docker (`.next/standalone`).
  output: "standalone",
  async rewrites() {
    // In production Nginx routes /api/* straight to the backend. This rewrite
    // makes `next dev` work on its own, without the Docker stack.
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
