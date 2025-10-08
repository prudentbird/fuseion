import { Suspense } from "react";
import { auth } from "~/app/(auth)/auth";
import { ChatSidebar } from "./chat-sidebar";

async function AppSidebarContent({ session }: { session: any }) {
  "use cache";
  return <ChatSidebar session={session} />;
}

async function SidebarWithAuth() {
  const session = await auth();
  return <AppSidebarContent session={session} />;
}

export default async function AppSidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarWithAuth />
    </Suspense>
  );
}
