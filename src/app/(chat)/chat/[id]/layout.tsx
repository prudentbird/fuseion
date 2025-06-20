import { ReactNode } from "react";
import { ChatProvider } from "~/components/chat/context";

export default async function ChatIdLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChatProvider threadId={id}>{children}</ChatProvider>;
}
