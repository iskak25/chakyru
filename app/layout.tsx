import type { Metadata } from "next";
import { Great_Vibes, Manrope, Marck_Script, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

const display = Playfair_Display({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const vibes = Great_Vibes({
  variable: "--font-vibes",
  subsets: ["latin"],
  weight: "400",
});

const ceremonial = Marck_Script({
  variable: "--font-ceremonial",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Chakyru — Тойго чакыруу",
  description:
    "Онлайн чакыруу каттар: той, үйлөнүү, кыз узатуу, бешик той. 5 мүнөттө түзүп, WhatsApp аркылуу жибериңиз.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ky"
      className={`${sans.variable} ${display.variable} ${vibes.variable} ${ceremonial.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-page text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
