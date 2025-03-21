import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://e892-2804-7f0-aa1a-d0e9-8c3e-d058-ad80-ea25.ngrok-free.app",
  ],
};

export default nextConfig;
