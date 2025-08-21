import { auth } from "~/app/(auth)/auth";
import { ChatSidebar } from "./chat-sidebar";

export default async function AppSidebar() {
  const session = await auth();
  return <ChatSidebar session={session} />;
}
