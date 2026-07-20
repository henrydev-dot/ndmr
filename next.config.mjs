/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  // Type-checking runs as a dedicated step (`npm run typecheck`) so the build
  // stays fast and memory-stable; Next.js's in-build route-type validation is
  // otherwise prone to runaway memory on constrained hosts.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
