// import type { NextConfig } from "next";

// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'github.com',
//         pathname: '/**',
//       },
//     ],
//   },
// }

// module.exports = nextConfig

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
    ],
  },
  // Configure environment variables that will be available on both server and client
  publicRuntimeConfig: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    keycloakRealm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    keycloakClientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  },
  // CORS configuration for all routes
  async headers() {
    return [
      {
        // This matches all routes
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
