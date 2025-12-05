import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // You might also need to keep your webpack configuration for SVG
  // for broader compatibility or specific scenarios not covered by Turbopack's rules.
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true, // Example option: treat SVG as an icon
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
