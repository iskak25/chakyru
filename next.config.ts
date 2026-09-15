import type { NextConfig } from "next";

const firebaseAuthHost =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "chakyru-47b0a.firebaseapp.com";

const nextConfig: NextConfig = {
  transpilePackages: ["@stagewise/toolbar"],
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/designers", destination: "/", permanent: false },
      // Keep API/webhook requests on their original host; preserve old checkout query params.
      { source: "/pay/return", has: [{ type: "host", value: "chakyru.vercel.app" }], destination: "https://www.toichakyru.com/pay/return", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${firebaseAuthHost}/__/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
