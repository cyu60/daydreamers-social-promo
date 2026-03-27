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
    "Generate promotional content for your projects across LinkedIn, Instagram, Twitter/X, and Email. Built by DayDreamers.",
  openGraph: {
    title: "DayDreamers | Social Promo Generator",
    description: "AI-powered promotional content for every channel.",
    images: ["https://www.daydreamers-academy.com/images/og-preview.png"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'><path fill='none' stroke='%231c3fdc' stroke-width='18' stroke-linecap='round' stroke-linejoin='round' d='M166 82c-8-4-17-6-27-6c-32 0-58 26-58 58s26 58 58 58c26 0 48-17 55-41c-7 4-16 6-25 6c-26 0-46-20-46-46c0-12 4-22 11-29c7-7 20-7 32 0z'/></svg>",
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
