import "./globals.css";
import { env } from "~/env";
import { ReactNode } from "react";
import { ReactScan } from "./scan";
import Providers from "./providers";
import type { Metadata } from "next";
import { BotIdClient } from "botid/client";
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
  title: "FuseIon",
  description: "AI chat for nerds by nerds",
};

const protectedRoutes = [
  {
    path: "/api/chat",
    method: "POST",
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <BotIdClient protect={protectedRoutes} />
      </head>
      {["local", "development"].includes(env.NODE_ENV) && <ReactScan />}
      <body
        className={`${outfit.variable} ${inconsolata.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
