import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Explicitly pin the project root so Turbopack doesn't infer the wrong
  // workspace root when a lockfile exists in a parent folder (e.g. C:\commerce).
  turbopack: {
    root: __dirname,
  },

  // Allows accessing the dev server from this LAN IP (e.g. testing on
  // your phone or another device on the same network).
  allowedDevOrigins: ["192.168.23.95"],
};

export default nextConfig;


export default nextConfig;