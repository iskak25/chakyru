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
  // Файлы из public/ без версии в имени: Next по умолчанию отдаёт их с max-age=0 и браузер перепроверяет каждый.
  // Неделя в браузере плюс фоновое обновление до месяца; заменённая картинка с тем же именем появится не позже чем через неделю.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }];
    return [
      { source: "/images/:path*", headers: cache },
      { source: "/stickers/:path*", headers: cache },
      { source: "/brand/:path*", headers: cache },
    ];
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
      // Именное приглашение: /i/<имя>/<id> показывает приглашение <id> для гостя <имя>.
      { source: "/i/:name/:id", destination: "/i/:id/g/:name" },
      {
        source: "/__/auth/:path*",
        destination: `https://${firebaseAuthHost}/__/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
