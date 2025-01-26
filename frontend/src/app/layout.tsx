import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/providers/posthog-provider";
import Header from "@/components/navbar/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ToolStack - Developer Tools Collection & Productivity Suite",
  description:
    "ToolStack is a collection of tools for developers to use in their projects.",
  keywords: [
    "developer tools",
    "productivity",
    "software development",
    "tools collection",
  ],
  authors: [{ name: "Marc Mansour", url: "https://marcmansour.dev" }],
  creator: "Marc Mansour",
  openGraph: {
    title: "ToolStack - Developer Tools Collection & Productivity Suite",
    description:
      "ToolStack is a collection of tools for developers to use in their projects.",
    url: "https://toolstack.pro/",
    siteName: "ToolStack",
    images: [
      {
        url: "https://toolstack.pro/og-image.png",
        width: 1200,
        height: 630,
        alt: "ToolStack OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolStack - Developer Tools Collection & Productivity Suite",
    description:
      "ToolStack is a collection of tools for developers to use in their projects.",
    images: ["https://toolstack.pro/og-image.png"],
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <PostHogProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
              <Footer />
              <Toaster />
              <Analytics />
            </div>
          </ThemeProvider>
        </body>
      </PostHogProvider>
    </html>
  );
}
