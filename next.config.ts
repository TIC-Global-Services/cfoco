import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.22", "kathlyn-nonimplicative-believingly.ngrok-free.dev"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
