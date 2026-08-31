import type { NextConfig } from "next";

const firebaseAuthHost =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "chakyru-47b0a.firebaseapp.com";

const nextConfig: NextConfig = {
  transpilePackages: ["@stagewise/toolbar"],
  serverExternalPackages: ["firebase-admin"],
  async redirects() {
    return [{ source: "/designers", destination: "/", permanent: false }];
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
