/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // shadcn/Radix + Tailwind plugin resolution under strict node_modules can surface
  // lint noise that shouldn't block builds; keep type-checking on.
  eslint: { ignoreDuringBuilds: true },
  /**
   * pdfkit must not be bundled. It loads its built-in font metrics (.afm) from
   * paths relative to its own package; once webpack rewrites it into
   * .next/server/vendor-chunks those files are not there, and the certificate
   * route dies with `ENOENT ... Helvetica.afm` at `new PDFDocument()`.
   * Marking it external leaves it required from node_modules at runtime, where
   * its own data directory is intact.
   */
  serverExternalPackages: ['pdfkit'],
}

export default nextConfig
