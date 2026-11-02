import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sangat Restaurant Multan | Traditional Desi Dining, BBQ & Karahi",
    template: "%s | Sangat Restaurant Multan",
  },
  description:
    "Traditional Pakistani hospitality on the Northern Bypass, Multan. Outdoor lawn dining, BBQ, karahi and family gatherings at Sangat Restaurant. Reserve a table or explore the menu.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "/",
    siteName: "Sangat Restaurant Multan",
    title: "Sangat Restaurant Multan | Where Tradition Meets Togetherness",
    description: "Outdoor desi dining, BBQ and karahi on the Northern Bypass, Multan.",
  },
  twitter: { card: "summary_large_image", title: "Sangat Restaurant Multan" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: "#0e0f0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
