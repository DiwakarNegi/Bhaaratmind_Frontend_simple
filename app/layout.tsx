import type { Metadata } from "next";
import {
  Newsreader,
  Inter,
  IBM_Plex_Mono,
  Noto_Sans_Devanagari,
  Noto_Sans_Bengali,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Noto_Sans_Kannada,
  Noto_Sans_Gujarati,
  Noto_Sans_Malayalam,
  Noto_Sans_Arabic,
} from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";

// Figma uses Newsreader 400 only; the wordmark's high-contrast cut comes from
// the optical-size axis, so load the variable font with opsz.
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-newsreader",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  variable: "--font-plex-mono",
});

// Noto Sans script faces, composed into --font-indic in base.css. Not
// preloaded: each is only pulled when its script actually renders.
const notoDeva = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  weight: ["400"],
  preload: false,
  variable: "--font-noto-deva",
});

const notoBeng = Noto_Sans_Bengali({
  subsets: ["bengali"],
  display: "swap",
  weight: ["400"],
  preload: false,
  variable: "--font-noto-beng",
});

const notoTaml = Noto_Sans_Tamil({
  subsets: ["tamil"],
  display: "swap",
  weight: ["400"],
  preload: false,
  variable: "--font-noto-taml",
});

const notoTelu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  display: "swap",
  weight: ["400"],
  preload: false,
  variable: "--font-noto-telu",
});

const notoKnda = Noto_Sans_Kannada({
  subsets: ["kannada"],
  display: "swap",
  weight: ["400"],
  preload: false,
  variable: "--font-noto-knda",
});

const notoGujr = Noto_Sans_Gujarati({
  subsets: ["gujarati"],
  display: "swap",
  weight: ["400"],
  preload: false,
  variable: "--font-noto-gujr",
});

const notoMlym = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  display: "swap",
  weight: ["400"],
  preload: false,
  variable: "--font-noto-mlym",
});

const notoArab = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  weight: ["400"],
  preload: false,
  variable: "--font-noto-arab",
});

export const metadata: Metadata = {
  title: "BhaaratMind — AI that thinks in your mother tongue",
  description:
    "BhaaratMind builds AI that understands meaning, culture and intent across 22+ Indian languages — and turns any question into a clear next step.",
  metadataBase: new URL("https://bhaaratmind.com"),
  openGraph: {
    title: "BhaaratMind — AI that thinks in your mother tongue",
    description:
      "Useful AI for India, built from the language up. 22+ Indian languages, one intelligence.",
    type: "website",
  },
};

const fontClasses = [
  newsreader.variable,
  inter.variable,
  plexMono.variable,
  notoDeva.variable,
  notoBeng.variable,
  notoTaml.variable,
  notoTelu.variable,
  notoKnda.variable,
  notoGujr.variable,
  notoMlym.variable,
  notoArab.variable,
].join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontClasses}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
