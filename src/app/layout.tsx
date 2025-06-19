import { ReactScan } from './scan';
import './globals.css';
import { env } from '~/env';
import Providers from './providers';
import type { Metadata } from 'next';
import { Outfit, Inconsolata } from 'next/font/google';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const inconsolata = Inconsolata({
  variable: '--font-inconsolata',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FuseIon',
  description: 'AI chat for nerds by nerds',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {env.NODE_ENV === 'development' && <ReactScan />}
      <body
        className={`${outfit.variable} ${inconsolata.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
