import { Suspense } from "react";
import { auth } from "~/app/(auth)/auth";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { ChatSidebar } from "./chat-sidebar";

async function AppSidebarContent({ session }: { session: Session }) {
  "use cache";
  return <ChatSidebar session={session} />;
}

async function SidebarWithAuth() {
  const session = await auth();
  if (!session) {
    redirect("/auth");
  }
  return <AppSidebarContent session={session} />;
}

export default async function AppSidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarWithAuth />
    </Suspense>
  );
}
