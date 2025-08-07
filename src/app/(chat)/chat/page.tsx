import Chat from "~/components/chat";
import { Model } from "~/data/models";
import { cookies } from "next/headers";
import { auth } from "~/app/(auth)/auth";
import { redirect } from "next/navigation";
import { generateUUID, getDefaultModel } from "~/lib/utils";

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  const cookieStore = await cookies();
  const model = cookieStore.get("chat-model");

  if (!model) {
    return (
      <Chat
        id={generateUUID()}
        autoResume={false}
        session={session}
        selectedModel={getDefaultModel()}
      />
    );
  }

  const selectedModel: Model = JSON.parse(model.value);

  return (
    <Chat
      id={generateUUID()}
      autoResume={false}
      session={session}
      selectedModel={selectedModel}
    />
  );
}
