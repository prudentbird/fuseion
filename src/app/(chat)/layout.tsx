import Nav from '~/components/ui/nav';
import { auth } from '../(auth)/auth';
import { ReactNode, cache } from 'react';
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

  return (
    <ChatProvider>
      <Nav />
      <ChatSidebar session={session} />
      <SidebarInset>{children}</SidebarInset>
    </ChatProvider>
  );
}
