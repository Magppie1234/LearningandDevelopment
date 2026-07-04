/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // shadcn/Radix + Tailwind plugin resolution under strict node_modules can surface
  // lint noise that shouldn't block builds; keep type-checking on.
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
