import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { updateDataForCurrentUser } from "./storage/user-data-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audio Player",
  description:
    "DJ Audio Player web application for uploading, managing, and playing audio files with advanced audio processing capabilities.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Store first page load if not already set
  updateDataForCurrentUser((current) => ({
    ...current,
    firstPageLoad: current.firstPageLoad ?? new Date().toISOString(),
  }));

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg?v=2" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico?v=2" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
