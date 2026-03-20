import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['openai', 'undici', 'https-proxy-agent'],
};

export default nextConfig;
