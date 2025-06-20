import Chat from "~/components/chat";
import { preloadQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const initialMessages = await preloadQuery(api.messages.listMessages, {
    threadId: id,
  });

  return <Chat id={id} preloadedInitialMessages={initialMessages} />;
}
