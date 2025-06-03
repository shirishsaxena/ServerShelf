/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ← this enables static HTML export (replaces next export)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
