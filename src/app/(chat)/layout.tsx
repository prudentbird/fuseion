import Nav from '~/components/ui/nav';
import { auth } from '../(auth)/auth';
import { Preloaded } from 'convex/react';
import { ReactNode, cache } from 'react';
import { preloadQuery } from 'convex/nextjs';
import { api } from '~/convex/_generated/api';
import { SidebarInset } from '~/components/ui/sidebar';
import { ChatProvider } from '~/components/chat/context';
import { ChatSidebar } from '~/components/ui/chat-sidebar';

const getSession = cache(() => auth());

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  let preloadedThreads: Preloaded<typeof api.threads.listThreads> | undefined =
    undefined;
  if (session?.user?.userId) {
    preloadedThreads = await preloadQuery(api.threads.listThreads, {
      userId: session.user.userId,
    });
  }

  return (
    <ChatProvider>
      <Nav />
      <ChatSidebar session={session} preloadedThreads={preloadedThreads} />
      <SidebarInset>{children}</SidebarInset>
    </ChatProvider>
  );
}
