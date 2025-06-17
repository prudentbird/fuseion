'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { useIsMobile } from '~/hooks/use-mobile';
import { PanelLeft, Search, Plus } from 'lucide-react';
import { SidebarTrigger } from '~/components/ui/sidebar';

const Nav = () => {
  const isMobile = useIsMobile();
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setShowButtons(true);
    }

    return () => {
      setShowButtons(false);
    };
  }, [isMobile]);

  const handleSidebarToggle = () => {
    if (!isMobile) {
      setShowButtons(!showButtons);
    }
  };

  return (
    <div
      className={`pointer-events-auto fixed left-2 z-50 flex flex-row gap-0.5 p-1 top-3 rounded-md transition-all duration-75 ${showButtons ? 'bg-card' : ''}`}
    >
      <div className="duration-250 pointer-events-none absolute inset-0 right-auto -z-10 w-10 rounded-md bg-transparent backdrop-blur-sm transition-[background-color,width] delay-0 max-sm:delay-125 max-sm:duration-125 max-sm:w-[6.75rem] max-sm:bg-sidebar/50 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:w-[6.75rem] md:peer-data-[variant=inset]:peer-data-[state=collapsed]:bg-sidebar/50"></div>
      <SidebarTrigger
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 z-10 h-8 w-8 text-muted-foreground"
        aria-label="Toggle Sidebar"
        onClick={handleSidebarToggle}
      >
        <PanelLeft />
        <span className="sr-only">Toggle Sidebar</span>
      </SidebarTrigger>
      <Button
        variant="ghost"
        size="icon"
        className={`duration-250 size-8 text-muted-foreground transition-[transform,opacity] ${
          showButtons
            ? 'translate-x-0 opacity-100 delay-150'
            : 'pointer-events-none -translate-x-[2.125rem] opacity-0 delay-0 duration-150 sm:pointer-events-none sm:-translate-x-[2.125rem] sm:opacity-0 sm:delay-0 sm:duration-150 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:pointer-events-auto md:peer-data-[variant=inset]:peer-data-[state=collapsed]:translate-x-0 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:opacity-100'
        }`}
        aria-label="Search"
      >
        <Search />
        <span className="sr-only">Search</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        asChild
        className={`size-8 text-muted-foreground transition-[transform,opacity] duration-150 ${
          showButtons
            ? 'translate-x-0 opacity-100 delay-150'
            : 'pointer-events-none -translate-x-[2.125rem] opacity-0 delay-0 duration-150 sm:pointer-events-none sm:-translate-x-[2.125rem] sm:opacity-0 sm:delay-0 sm:duration-150 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:pointer-events-auto md:peer-data-[variant=inset]:peer-data-[state=collapsed]:translate-x-0 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:opacity-100'
        }`}
        aria-label="New Thread"
      >
        <Link href="/">
          <Plus />
          <span className="sr-only">New Thread</span>
        </Link>
      </Button>
    </div>
  );
};

export default Nav;
