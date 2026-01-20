"use client";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '~/components/ui/dropdown-menu';
import { toast } from "sonner";
// import { useTheme } from 'next-themes';
import { SunMoon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "~/components/ui/button";
// import { Moon, Sun, Monitor, SunMoon } from 'lucide-react';

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  // const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={() => {
        toast.error("Stick to Dark Mode!");
      }}
    >
      <SunMoon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
    //   <DropdownMenu>
    //     <DropdownMenuTrigger className="cursor-pointer" asChild>
    //       <Button variant="ghost" size="icon" className="size-8">
    //         {theme === 'light' ? (
    //           <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    //         ) : theme === 'dark' ? (
    //           <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    //         ) : (
    //           <SunMoon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-0 dark:scale-100" />
    //         )}
    //         <span className="sr-only">Toggle theme</span>
    //       </Button>
    //     </DropdownMenuTrigger>
    //     <DropdownMenuContent align="start">
    //       <DropdownMenuItem
    //         className="cursor-pointer"
    //         onClick={() => setTheme('light')}
    //       >
    //         <Sun className="mr-2 h-4 w-4" />
    //         <span>Light</span>
    //       </DropdownMenuItem>
    //       <DropdownMenuItem
    //         className="cursor-pointer"
    //         onClick={() => setTheme('dark')}
    //       >
    //         <Moon className="mr-2 h-4 w-4" />
    //         <span>Dark</span>
    //       </DropdownMenuItem>
    //       <DropdownMenuItem
    //         className="cursor-pointer"
    //         onClick={() => setTheme('system')}
    //       >
    //         <Monitor className="mr-2 h-4 w-4" />
    //         <span>System</span>
    //       </DropdownMenuItem>
    //     </DropdownMenuContent>
    //   </DropdownMenu>
  );
}
