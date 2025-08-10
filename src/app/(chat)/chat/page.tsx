import Chat from "~/components/chat";
import { Model } from "~/lib/ai/models";
import { cookies } from "next/headers";
import { auth } from "~/app/(auth)/auth";
import { redirect } from "next/navigation";
import { preloadQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";
import { generateUUID, getDefaultModel } from "~/lib/utils";

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  const id = generateUUID();
  const cookieStore = await cookies();
  const model = cookieStore.get("chat-model");
  const initialMessages = await preloadQuery(api.messages.listMessages, {
    threadId: id,
  });

  if (!model) {
    return (
      <Chat
        id={id}
        autoResume={false}
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
      autoResume={false}
      session={session}
      selectedModel={selectedModel}
      preloadedInitialMessages={initialMessages}
    />
  );
}
