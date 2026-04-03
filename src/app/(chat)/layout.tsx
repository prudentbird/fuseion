import { ReactNode, Suspense } from "react";
import Nav from "~/components/ui/nav";
import AppSidebar from "./_components/sidebar";
import AppLoader from "~/components/app-loader";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";
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
        <Suspense fallback={<AppLoader />}>
          <AppSidebar />
        </Suspense>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </DataStreamProvider>
  );
}
