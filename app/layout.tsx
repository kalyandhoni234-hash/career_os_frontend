import type { Metadata } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import { ClientShell } from "@/components/ClientShell";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif-var",
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans-var",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-var",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Career OS",
  description: "Your career, tracked and built with intent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable} font-sans antialiased`}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
