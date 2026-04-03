import { ReactNode, Suspense } from "react";
import Nav from "~/components/ui/nav";
import AppSidebar from "./_components/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "~/components/ui/sidebar";
import { DataStreamProvider } from "~/components/chat/data-stream/provider";

function SidebarSkeleton() {
  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader className="mx-1 gap-3 p-0 pt-safe">
        <div className="mt-4 flex h-8 items-center justify-center px-4">
          <span className="text-lg font-bold text-[#e3bad1]/85">FuseIon</span>
        </div>
        <div className="space-y-2 px-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="border-b border-accent-foreground/30 pb-2">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pb-4">
        <SidebarGroup className="px-2 py-0">
          <SidebarGroupLabel>
            <Skeleton className="h-3 w-18 rounded-full" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 4 }).map((_, index) => (
                <SidebarMenuItem key={`recent-${index}`}>
                  <SidebarMenuSkeleton />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="px-2 py-0">
          <SidebarGroupLabel>
            <Skeleton className="h-3 w-22 rounded-full" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 3 }).map((_, index) => (
                <SidebarMenuItem key={`older-${index}`}>
                  <SidebarMenuSkeleton />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-3">
          <Skeleton className="size-10 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </SidebarFooter>
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
