/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    
    // Handle font loading in webpack
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 8192,
          fallback: 'file-loader',
          publicPath: '/_next/static/fonts/',
          outputPath: 'static/fonts/',
          name: '[name]-[hash].[ext]',
        },
      },
    });
    
    return config;
  },
  
  // Completely disable font optimization
  optimizeFonts: false,
  
  // For standalone output
  output: 'standalone',
  
  // Skip type checking and ESLint during build for speed
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;