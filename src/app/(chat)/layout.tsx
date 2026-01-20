import { ReactNode, Suspense } from "react";
import Nav from "~/components/ui/nav";
import AppSidebar from "./_components/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";
import { DataStreamProvider } from "~/components/chat/data-stream/provider";

function SidebarSkeleton() {
  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-3 mx-1 p-0 pt-4">
          <div className="h-8 flex items-center justify-center">
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="px-4">
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="mx-3 px-1 border-b border-accent-foreground/40">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex-1 px-4 py-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    </Sidebar>
  );
}

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DataStreamProvider>
      <SidebarProvider>
        <Nav />
        <Suspense fallback={<SidebarSkeleton />}>
          <AppSidebar />
        </Suspense>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </DataStreamProvider>
  );
}
