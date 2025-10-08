import "./globals.css";
import { env } from "~/env";
import { ReactNode } from "react";
import { ReactScan } from "./scan";
import Providers from "./providers";
import type { Metadata } from "next";
import { Outfit, Inconsolata } from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: "FuseIon",
  description:
    "Chat instantly with the latest AI models from Google, OpenAI, Anthropic, DeepSeek, and more in one app.",
  applicationName: "FuseIon",
  creator: "prudentbird",
  authors: [{ name: "prudentbird", url: "https://prudentbird.com" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "FuseIon",
    title: "FuseIon",
    description: "AI chat for nerds by nerds",
    images: [
      {
        url: "/favicon.ico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FuseIon",
    description: "AI chat for nerds by nerds",
    creator: "prudentbird",
    images: ["/favicon.ico"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {["local", "development"].includes(env.NODE_ENV) && <ReactScan />}
      <body
        className={`${outfit.variable} ${inconsolata.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
