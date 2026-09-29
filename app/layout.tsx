import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/Providers";
import "./globals.css";

// Bundled fonts keep builds independent of Google Fonts and its remote URL format.
const sans = localFont({
  variable: "--font-manrope",
  display: "swap",
  src: [
    { path: "./fonts/manrope/Manrope-wght.ttf", weight: "200 800", style: "normal" }
  ],
});

const display = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "./fonts/cormorantgaramond/CormorantGaramond-wght.ttf", weight: "400 700", style: "normal" },
    { path: "./fonts/cormorantgaramond/CormorantGaramond-Italic-wght.ttf", weight: "400 700", style: "italic" }
  ],
});

const vibes = localFont({
  variable: "--font-vibes",
  display: "swap",
  src: [
    { path: "./fonts/greatvibes/GreatVibes-Regular.ttf", weight: "400", style: "normal" }
  ],
});

const ceremonial = localFont({
  variable: "--font-ceremonial",
  display: "swap",
  src: [
    { path: "./fonts/marckscript/MarckScript-Regular.ttf", weight: "400", style: "normal" }
  ],
});

const playfair = localFont({
  variable: "--font-playfair",
  display: "swap",
  src: [
    { path: "./fonts/playfairdisplay/PlayfairDisplay-wght.ttf", weight: "400 700", style: "normal" },
    { path: "./fonts/playfairdisplay/PlayfairDisplay-Italic-wght.ttf", weight: "400 700", style: "italic" }
  ],
});

const unbounded = localFont({
  variable: "--font-unbounded",
  display: "swap",
  src: [
    { path: "./fonts/unbounded/Unbounded-wght.ttf", weight: "400 700", style: "normal" }
  ],
});

const caveat = localFont({
  variable: "--font-caveat",
  display: "swap",
  src: [
    { path: "./fonts/caveat/Caveat-wght.ttf", weight: "400 700", style: "normal" }
  ],
});

const philosopher = localFont({
  variable: "--font-philosopher",
  display: "swap",
  src: [
    { path: "./fonts/philosopher/Philosopher-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/philosopher/Philosopher-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/philosopher/Philosopher-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/philosopher/Philosopher-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://toichakyru.com"),
  title: "Toichakyru — Тойго чакыруу",
  description:
    "Онлайн чакыруу каттар: той, үйлөнүү, кыз узатуу, бешик той. 5 мүнөттө түзүп, WhatsApp аркылуу жибериңиз.",
  keywords: [
    "чакыруу",
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
    url: "https://toichakyru.com",
    siteName: "Toichakyru",
    title: "Toichakyru — Тойго чакыруу",
    description:
      "Онлайн чакыруу каттар: той, үйлөнүү, кыз узатуу, бешик той. 5 мүнөттө түзүп, WhatsApp аркылуу жибериңиз.",
    images: ["/icon.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toichakyru — Тойго чакыруу",
    description:
      "Онлайн чакыруу каттар: той, үйлөнүү, кыз узатуу, бешик той. 5 мүнөттө түзүп, WhatsApp аркылуу жибериңиз.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ky"
      className={`${sans.variable} ${display.variable} ${vibes.variable} ${ceremonial.variable} ${playfair.variable} ${unbounded.variable} ${caveat.variable} ${philosopher.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-page text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
