import { Preloaded } from "convex/react";
import { auth } from "~/app/(auth)/auth";
import { ChatSidebar } from "./chat-sidebar";
import { preloadQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

export default async function AppSidebar() {
  const session = await auth();
  let preloadedThreads: Preloaded<typeof api.threads.listThreads> | undefined =
    undefined;
  if (session?.user?.userId) {
    preloadedThreads = await preloadQuery(api.threads.listThreads, {
      userId: session.user.userId,
    });
  }

  return <ChatSidebar session={session} preloadedThreads={preloadedThreads} />;
}
