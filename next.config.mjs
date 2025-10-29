/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: "/umami.js",
        destination: "http://62.72.42.195:3002/script.js",
      },
      {
        source: "/api/send",
        destination: "http://62.72.42.195:3002/api/send",
      },
    ];
  },
};

export default nextConfig;
