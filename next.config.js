/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // Para funcionar com subpaths no GitHub Pages
  // Se o repositório for nomeado diferente de username.github.io
  basePath: '/tetris',
  assetPrefix: '/tetris/',
};

module.exports = nextConfig;
