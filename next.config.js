if (!process.env.BACKEND_URL) {
  throw new Error('BACKEND_URL environment variable is not defined')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/:path*`,
      },
    ];
  },

  webpack: (config) => {
    // Add your webpack configuration here
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};
module.exports = nextConfig
