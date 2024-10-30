import type { NextConfig } from 'next'
import 'core-js/stable'
import 'core-js/proposals/promise-with-resolvers'
const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
