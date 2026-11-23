import type { Metadata, Viewport } from "next";
import { Cairo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://alpha-pitch-terminal.vercel.app";

export const viewport: Viewport = {
  themeColor: "#090D16",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AlphaPitch Terminal — Quantitative Football Alpha & +EV Analytics",
    template: "%s | AlphaPitch Terminal",
  },
  description:
    "Institutional quantitative football modeling terminal powered by Dixon-Coles MLE, time-decayed xG, and Platt calibration. Audited out-of-sample across 14,845 Big-5 European matches (+7.95% ROI, +0.56% Pinnacle CLV, 5.61% Max Drawdown).",
  keywords: [
    "quantitative football analytics",
    "expected value betting",
    "+EV football signals",
    "Dixon-Coles model",
    "Pinnacle CLV",
    "expected goals xG",
    "Kelly criterion bankroll calculator",
    "La Liga predictions",
    "Serie A predictions",
    "EPL Draw No Bet",
  ],
  authors: [{ name: "AlphaPitch Quantitative Research" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_SA", "fr_FR"],
    url: SITE_URL,
    siteName: "AlphaPitch Terminal",
    title: "AlphaPitch Terminal — Quantitative Football Alpha & +EV Signals",
    description:
      "Leak-free Dixon-Coles + xG probability terminal audited across 14,845 European Big-5 matches with live Kelly bankroll sizing and Pinnacle CLV tracking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlphaPitch Terminal — Quantitative Football Alpha & +EV Terminal",
    description:
      "Out-of-sample verified +7.95% ROI & +0.56% Pinnacle CLV across La Liga, Serie A & EPL DNB. Zero-maintenance auto-sync every 15 minutes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${cairo.variable} dark`}
    >
      <body className="font-sans antialiased bg-[#090D16] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
