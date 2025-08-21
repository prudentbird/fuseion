"use client";

import {
  Sidebar,
  SidebarMenu,
  SidebarGroup,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "~/components/ui/sidebar";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { api } from "~/convex/_generated/api";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { ThreadInterface } from "~/types/thread";
import { usePaginatedQuery } from "convex/react";
import { Rocket, Settings2, Search, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function ChatSidebar({ session }: { session: Session | null }) {
  const router = useRouter();
  const userId = session?.user?.userId ?? "";

  const [search, setSearch] = useState("");

  const {
    results: pagedThreads,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.threads.listThreadsPaginated,
    { userId, term: search || undefined },
    { initialNumItems: 20 },
  );

  const threads: ThreadInterface[] =
    (pagedThreads as unknown as ThreadInterface[]) || [];

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (
      status === "CanLoadMore" &&
      el.scrollTop + el.clientHeight >= el.scrollHeight - 200
    ) {
      loadMore(20);
    }
  };

  const filteredThreads = threads;

  function groupThreadsByDate(threads: ThreadInterface[]) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOf7DaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
    const startOf30DaysAgo = startOfToday - 30 * 24 * 60 * 60 * 1000;

    const groups: Record<string, ThreadInterface[]> = {
      pinned: [],
      today: [],
      yesterday: [],
      last7: [],
      last30: [],
      older: [],
    };
    for (const thread of threads) {
      if (thread.pinned) {
        groups.pinned.push(thread);
        continue;
      }
      if (thread.createdAt >= startOfToday) {
        groups.today.push(thread);
      } else if (thread.createdAt >= startOfYesterday) {
        groups.yesterday.push(thread);
      } else if (thread.createdAt >= startOf7DaysAgo) {
        groups.last7.push(thread);
      } else if (thread.createdAt >= startOf30DaysAgo) {
        groups.last30.push(thread);
      } else {
        groups.older.push(thread);
      }
    }

    groups.pinned.sort((a, b) => b.createdAt - a.createdAt);
    return groups;
  }

  const grouped = useMemo(
    () => groupThreadsByDate(filteredThreads),
    [filteredThreads],
  );

  function renderGroup(label: string, threads: ThreadInterface[]) {
    if (!threads.length) return null;
    return (
      <SidebarGroup className="px-4 py-0">
        <SidebarGroupLabel>
          <span>{label}</span>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {threads.map((thread: ThreadInterface, index: number) => (
              <SidebarMenuItem key={`${thread.id}-${index}`}>
                <SidebarMenuButton asChild>
                  <Link
                    scroll={false}
                    href={`/chat/${thread.id}`}
                    className="w-full items-center justify-between"
                    data-discover="true"
                  >
                    <div className="relative flex w-full items-center ">
                      <button
                        data-state="closed"
                        className="w-full !cursor-pointer"
                      >
                        <div className="relative w-full">
                          <input
                            aria-label="Thread title"
                            aria-describedby="thread-title-hint"
                            aria-readonly="true"
                            readOnly
                            tabIndex={-1}
                            className="hover:truncate-none h-full w-full rounded bg-transparent px-1 py-1 text-sm text-muted-foreground outline-none pointer-events-none cursor-pointer overflow-hidden truncate"
                            title={thread.title}
                            type="text"
                            value={thread.title || "Untitled"}
                          />
                        </div>
                      </button>
                    </div>
                    {thread.status === "streaming" && (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader className="flex flex-col gap-3 mx-1 p-0 !pt-safe ">
        <span className="flex h-8 shrink-0 items-center justify-center text-lg text-[#e3bad1] font-bold transition-opacity duration-75 mt-4 p-0">
          FuseIon
        </span>
        <div className="flex flex-col gap-2">
          <div className="!px-4 flex">
            <Button
              className="w-full bg-primary/50 !hover:bg-primary/70"
              onClick={() => {
                router.push("/chat");
                router.refresh();
              }}
            >
              New Chat
            </Button>
          </div>
          <div className="border-b border-accent-foreground/40 mx-3 px-1">
            <div className="flex items-center">
              <Search className="h-4 w-4" />
              <Input
                role="searchbox"
                aria-label="Search threads"
                placeholder="Search your threads..."
                className="w-full py-2 !text-sm text-foreground !placeholder-muted-foreground/50 placeholder:select-none !bg-transparent !border-none !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus:!border-none focus:!bg-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <Button
                  variant="ghost"
                  type="button"
                  size="icon"
                  className="ml-2 rounded-md !p-1 h-auto w-auto text-muted-foreground hover:bg-muted/40"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent
        className="flex-1 relative overflow-auto min-h-0 flex-col gap-2 mt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        style={{
          ["--shadow-height" as unknown as string]: "16px",
          ["--scrollbar-width" as unknown as string]: "0px",
          maskImage:
            "linear-gradient(to bottom,transparent,#000 var(--shadow-height),#000 calc(100% - var(--shadow-height)),transparent 100%),linear-gradient(to left,#fff var(--scrollbar-width),transparent var(--scrollbar-width))",
          WebkitMaskImage:
            "linear-gradient(to bottom,transparent,#000 var(--shadow-height),#000 calc(100% - var(--shadow-height)),transparent 100%),linear-gradient(to left,#fff var(--scrollbar-width),transparent var(--scrollbar-width))",
        }}
        onScroll={onScroll}
      >
        {status === "LoadingFirstPage" && search ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No results found
          </div>
        ) : (
          <>
            {renderGroup("Pinned", grouped.pinned)}
            {renderGroup("Today", grouped.today)}
            {renderGroup("Yesterday", grouped.yesterday)}
            {renderGroup("Last 7 Days", grouped.last7)}
            {renderGroup("Last 30 Days", grouped.last30)}
            {renderGroup("Older", grouped.older)}
          </>
        )}
        {status === "LoadingMore" && (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </SidebarContent>
      {session?.user ? (
        <SidebarFooter className="mb-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href="/settings"
                  className="flex w-full h-auto p-3 gap-3 items-center justify-between rounded-lg"
                >
                  <div className="flex w-auto h-auto gap-3 items-center">
                    <Avatar>
                      <AvatarImage src={session.user.picture} />
                      <AvatarFallback>
                        {session.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col text-foreground">
                      <span className="truncate font-semibold text-sm">
                        {session.user.name}
                      </span>
                      <span className="text-xs capitalize">
                        {session.user.tier}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent hover:text-inherit focus-visible:bg-transparent focus-visible:text-inherit"
                  >
                    <Settings2 className="size-4" />
                  </Button>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      ) : (
        <SidebarFooter className="p-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <Button
                asChild
                variant="ghost"
                className="w-full text-white justify-start items-center rounded-none"
              >
                <Link
                  href="/auth"
                  className="!py-4 !px-6 w-full h-full flex items-center justify-center gap-4 border-t border-white/40"
                >
                  <Rocket className="size-4" />
                  <span>Login</span>
                </Link>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
      <div className="absolute right-0 top-0 h-full w-4 cursor-col-resize"></div>
    </Sidebar>
  );
}
