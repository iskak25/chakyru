import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/Providers";
import "./globals.css";

// Bundled fonts keep builds independent of Google Fonts and its remote URL format.
const sans = localFont({
  variable: "--font-manrope",
  display: "swap",
  fallback: ["KyFallback"],
  src: [
    { path: "./fonts/manrope/Manrope-wght.woff2", weight: "200 800", style: "normal" }
  ],
});

const display = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "./fonts/cormorantgaramond/CormorantGaramond-wght.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/cormorantgaramond/CormorantGaramond-Italic-wght.woff2", weight: "400 700", style: "italic" }
  ],
});

const vibes = localFont({
  variable: "--font-vibes",
  display: "swap",
  preload: false,
  fallback: ["KyFallback"],
  src: [
    { path: "./fonts/greatvibes/GreatVibes-Regular.woff2", weight: "400", style: "normal" }
  ],
});

const ceremonial = localFont({
  variable: "--font-ceremonial",
  display: "swap",
  preload: false,
  src: [
    { path: "./fonts/marckscript/MarckScript-Regular.woff2", weight: "400", style: "normal" }
  ],
});

const playfair = localFont({
  variable: "--font-playfair",
  display: "swap",
  preload: false,
  src: [
    { path: "./fonts/playfairdisplay/PlayfairDisplay-wght.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/playfairdisplay/PlayfairDisplay-Italic-wght.woff2", weight: "400 700", style: "italic" }
  ],
});

const unbounded = localFont({
  variable: "--font-unbounded",
  display: "swap",
  preload: false,
  fallback: ["KyFallback"],
  src: [
    { path: "./fonts/unbounded/Unbounded-wght.woff2", weight: "400 700", style: "normal" }
  ],
});

const caveat = localFont({
  variable: "--font-caveat",
  display: "swap",
  preload: false,
  src: [
    { path: "./fonts/caveat/Caveat-wght.woff2", weight: "400 700", style: "normal" }
  ],
});

const philosopher = localFont({
  variable: "--font-philosopher",
  display: "swap",
  preload: false,
  src: [
    { path: "./fonts/philosopher/Philosopher-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/philosopher/Philosopher-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/philosopher/Philosopher-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/philosopher/Philosopher-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
});

const montserrat = localFont({
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
  src: [
    { path: "./fonts/montserrat/Montserrat-wght.woff2", weight: "100 900", style: "normal" }
  ],
});

const notoSerif = localFont({
  variable: "--font-noto-serif",
  display: "swap",
  preload: false,
  src: [
    { path: "./fonts/notoserif/NotoSerif-wght.woff2", weight: "100 900", style: "normal" }
  ],
});

const notoSans = localFont({
  variable: "--font-noto-sans",
  display: "swap",
  preload: false,
  src: [
    { path: "./fonts/notosans/NotoSans-wght.woff2", weight: "100 900", style: "normal" }
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.toichakyru.com"),
  title: "Toichakyru — Тойго чакыруу",
  description:
    "Той чакыруу 3D жана онлайн чакыруу каттар: той, үйлөнүү, кыз узатуу, бешик той. Тез жана арзан түзүп, WhatsApp аркылуу жибериңиз.",
  keywords: [
    "чакыруу",
    "той чакыруу",
    "той чакыруу 3d",
    "3d чакыруу",
    "3д чакыруу",
    "тойго чакыруу 3d",
    "3d приглашение на той",
    "чакыруу сайты",
    "тойго чакыруу",
    "үйлөнүү тойго чакыруу",
    "электрондук чакыруу",
    "онлайн чакыруу жасоо",
    "пригласительные на свадьбу",
    "электронные пригласительные",
    "сайт-приглашение на свадьбу",
  ],
  openGraph: {
    type: "website",
    locale: "ky_KG",
    alternateLocale: "ru_RU",
    url: "https://www.toichakyru.com",
    siteName: "Toichakyru",
    title: "Toichakyru — Тойго чакыруу",
    description:
      "Онлайн чакыруу каттар: той, үйлөнүү, кыз узатуу, бешик той. Тез жана арзан түзүп, WhatsApp аркылуу жибериңиз.",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "Toichakyru — Тойго чакыруу" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toichakyru — Тойго чакыруу",
    description:
      "Онлайн чакыруу каттар: той, үйлөнүү, кыз узатуу, бешик той. Тез жана арзан түзүп, WhatsApp аркылуу жибериңиз.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ky"
      className={`${sans.variable} ${display.variable} ${vibes.variable} ${ceremonial.variable} ${playfair.variable} ${unbounded.variable} ${caveat.variable} ${philosopher.variable} ${montserrat.variable} ${notoSerif.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-page text-ink">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "Toichakyru",
                  url: "https://toichakyru.com",
                  logo: "https://toichakyru.com/icon.png",
                },
                {
                  "@type": "WebSite",
                  name: "Toichakyru",
                  url: "https://toichakyru.com",
                  inLanguage: ["ky", "ru"],
                },
              ],
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
