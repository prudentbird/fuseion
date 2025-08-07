import { ReactNode } from "react";
import Nav from "~/components/ui/nav";
import AppSidebar from "./_components/sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { DataStreamProvider } from "~/components/chat/data-stream/provider";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DataStreamProvider>
      <SidebarProvider>
        <Nav />
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </DataStreamProvider>
  );
}
