import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};


module.exports = {
  images: {
    remotePatterns: [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '4000',
    pathname: '/public/**',
  },
  {
    protocol: 'https',
    hostname: 'api.stoqle.com',
    pathname: '/public/**',
  },
],
    unoptimized: true, // disables optimization
  },
};

export default nextConfig;