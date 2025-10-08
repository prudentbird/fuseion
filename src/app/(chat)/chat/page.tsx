import { Suspense } from "react";
import Chat from "~/components/chat";
import { cookies } from "next/headers";
import { Model } from "~/lib/ai/models";
import { auth } from "~/app/(auth)/auth";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { preloadQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";
import { generateUUID, getDefaultModel } from "~/lib/utils";

async function ChatWithModel() {
  const cookieStore = await cookies();
  const model = cookieStore.get("chat-model");
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  return <ChatPageContent session={session} modelCookie={model?.value} />;
}

async function ChatPageContent({
  session,
  modelCookie,
}: {
  session: Session;
  modelCookie: string | undefined;
}) {
  "use cache";

  const id = generateUUID();
  const initialMessages = await preloadQuery(api.messages.listMessages, {
    threadId: id,
  });

  if (!modelCookie) {
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

  const selectedModel: Model = JSON.parse(modelCookie);

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

export default async function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatWithModel />
    </Suspense>
  );
}
