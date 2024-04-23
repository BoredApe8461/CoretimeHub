/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['github.com'],
  },
  env: {
    WS_ROCOCO_CORETIME_CHAIN: process.env.WS_ROCOCO_CORETIME_CHAIN || '',
    WS_KUSAMA_CORETIME_CHAIN: process.env.WS_KUSAMA_CORETIME_CHAIN || '',
    WS_ROCOCO_RELAY_CHAIN: process.env.WS_ROCOCO_RELAY_CHAIN,
    WS_KUSAMA_RELAY_CHAIN: process.env.WS_KUSAMA_RELAY_CHAIN,
  },
};

module.exports = nextConfig;
