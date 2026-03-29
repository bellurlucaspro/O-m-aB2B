import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 900, 1200],
    imageSizes: [64, 128, 256],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  // Compress responses
  compress: true,
  // Powered-by header removed for cleaner responses
  poweredByHeader: false,
  // Headers for static asset caching
  async headers() {
    return [
      {
        // Cache 3D models and DRACO files aggressively
        source: "/(models|draco)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache static images
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000" }, // 30 days
        ],
      },
    ];
  },
};

export default nextConfig;
