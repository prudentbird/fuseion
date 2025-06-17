'use client';

import * as React from 'react';
import { Undo, Loader2, Rocket } from 'lucide-react';
import type { Session } from 'next-auth';
import { useActionState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';
import { logoutAction } from '~/app/(auth)/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from './button';

export function ChatSidebar({ session }: { session: Session | null }) {
  const userId = session?.user?.id;
  const [, action, isPending] = useActionState(logoutAction, null);

  const threads =
    useQuery(api.threads.listThreads, userId ? { userId } : 'skip') ?? [];

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader className="flex h-8 shrink-0 items-center justify-center text-lg text-[#e3bad1] font-bold transition-opacity duration-75 mt-4 p-0">
        FuseIon
      </SidebarHeader>
      <SidebarContent className="flex-1">
        {userId && threads.length > 0 && (
          <SidebarMenu>
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/chat/${thread.id}`}
                className="block w-full truncate"
              >
                <SidebarMenuItem key={thread.id}>
                  {thread.title || 'Untitled'}
                </SidebarMenuItem>
              </Link>
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter className="mb-2">
        {session?.user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground focus:outline-none focus-visible:ring-0 focus-visible:bg-sidebar-accent"
                  >
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session.user.email}
                      </span>
                      <span className="truncate text-xs text-muted-foreground capitalize">
                        Free
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="rounded-lg mb-1"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <form action={action}>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2"
                      >
                        {isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Undo className="size-4" />
                        )}
                        {isPending ? 'Processing' : 'Sign Out'}
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <Button
                asChild
                variant="ghost"
                className="w-full text-white justify-start items-center"
              >
                <Link
                  href="/auth"
                  className="!p-4 w-full h-full flex items-center justify-center gap-4"
                >
                  <Rocket className="size-4" />
                  <span>Login</span>
                </Link>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
