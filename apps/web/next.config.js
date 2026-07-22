const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a minimal standalone server for a tiny production Docker image.
  output: 'standalone',
  // In a monorepo, trace files from the repo root so the standalone bundle is complete.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  poweredByHeader: false,
  // Serve the RFC 9116 security.txt at its well-known path (handler lives at
  // /security.txt to avoid a dot-prefixed route folder).
  async rewrites() {
    return [{ source: '/.well-known/security.txt', destination: '/security.txt' }];
  },
};

module.exports = nextConfig;
