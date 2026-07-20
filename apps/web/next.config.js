const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a minimal standalone server for a tiny production Docker image.
  output: 'standalone',
  // In a monorepo, trace files from the repo root so the standalone bundle is complete.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  poweredByHeader: false,
};

module.exports = nextConfig;
