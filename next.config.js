/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // node-cron uses node:crypto — keep it out of the webpack bundle
      const existing = Array.isArray(config.externals) ? config.externals : [config.externals]
      config.externals = [...existing, 'node-cron']
    }
    return config
  },
};

module.exports = nextConfig;
