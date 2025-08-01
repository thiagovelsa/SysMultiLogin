import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Resolve problemas com puppeteer e dependências no servidor
      config.externals = [...(config.externals || []), 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'];
    }
    
    // Resolve problemas com clone-deep e outras dependências problemáticas
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Ignora warnings específicos do clone-deep
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Error: Can't resolve/,
    ];

    return config;
  },
};

export default nextConfig;
