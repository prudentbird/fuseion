import Chat from "~/components/chat";
import { Model } from "~/lib/ai/models";
import { cookies } from "next/headers";
import { auth } from "~/app/(auth)/auth";
import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";
import { getDefaultModel } from "~/lib/utils";
import { fetchQuery, preloadQuery } from "convex/nextjs";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  const cookieStore = await cookies();
  const model = cookieStore.get("chat-model");

  const initialMessages = await preloadQuery(api.messages.listMessages, {
    threadId: id,
  });

  const thread = await fetchQuery(api.threads.getThreadByUserIdAndThreadId, {
    userId: session.user.userId ?? "",
    threadId: id,
  });

  if (!thread || thread.status === "deleted") {
    redirect("/chat");
  }

  if (!model) {
    return (
      <Chat
        id={id}
        autoResume={true}
        session={session}
        selectedModel={getDefaultModel()}
        preloadedInitialMessages={initialMessages}
      />
    );
  }

  const selectedModel: Model = JSON.parse(model.value);

  return (
    <Chat
      id={id}
      autoResume={true}
      session={session}
      selectedModel={selectedModel}
      preloadedInitialMessages={initialMessages}
    />
  );
}
