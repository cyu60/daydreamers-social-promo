import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "DayDreamers | Social Promo Generator",
  description:
    "Generate promotional content for your projects across LinkedIn, Instagram, Twitter/X, and Email. AI-powered by DayDreamers Academy.",
  metadataBase: new URL("https://socials.daydreamers-academy.com"),
  openGraph: {
    type: "website",
    siteName: "DayDreamers Academy",
    title: "DayDreamers | Social Promo Generator",
    description:
      "Describe your project. Get AI-generated promotional content for LinkedIn, Instagram, Twitter/X, and email — plus branded image templates. Built by DayDreamers Academy.",
    url: "https://socials.daydreamers-academy.com",
    images: [
      {
        url: "/og-preview.png",
        width: 2172,
        height: 1274,
        alt: "DayDreamers Social Promo Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DayDreamers | Social Promo Generator",
    description:
      "AI-powered promotional content for every channel. Built by DayDreamers Academy.",
    images: ["/og-preview.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
