'use client';

import { env } from '~/env';
import { ReactNode } from 'react';
import { ThemeProvider } from './theme';
import { Toaster } from '~/components/ui/sonner';
import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '~/components/ui/sidebar';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider
      enableSystem
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <SessionProvider>
        <ConvexProvider client={convex}>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </ConvexProvider>
      </SessionProvider>
    </ThemeProvider>
  );
};

export default Providers;
