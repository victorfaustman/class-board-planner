/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["pdf-lib"]
  }
};

module.exports = nextConfig;
