import { auth } from "~/app/(auth)/auth";
import { redirect } from "next/navigation";
import { ChatSidebar } from "./chat-sidebar";

export default async function AppSidebar() {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  return <ChatSidebar session={session} />;
}
