"use client";

import { toast } from "sonner";
import { Button } from "./button";
import { useEffect, useRef } from "react";
import { RefreshCcw } from "lucide-react";

function useInterval<P extends Function>(
  callback: P,
  { interval, lead }: { interval: number; lead?: boolean },
): void {
  const savedCallback = useRef<P>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = (): void => savedCallback.current?.();

    lead && tick();

    if (interval !== null) {
      const id = setInterval(tick, interval);

      return () => clearInterval(id);
    }
  }, [interval]);
}

export const VersionManager = () => {
  useInterval(
    async () => {
      try {
        const clientBuildId = process.env.NEXT_PUBLIC_BUILD_ID;
        const { buildId: serverBuildId }: { buildId: string | null } =
          await fetch("/api/build").then((res) => res.json());

        if (serverBuildId && clientBuildId && serverBuildId !== clientBuildId) {
          toast("Update Available", {
            description: "Kindly refresh to get the latest version",
            action: {
              label: (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground dark:bg-accent/50 dark:hover:bg-accent/100"
                >
                  <RefreshCcw />
                  <span className="sr-only">Refresh</span>
                </Button>
              ),
              onClick: () => window.location.reload(),
            },
            position: "top-right",
            style: {
              gap: "1rem",
              width: "100%",
              justifyContent: "space-between",
            },
            actionButtonStyle: {
              backgroundColor: "transparent",
              padding: "0",
              margin: "0",
            },
          });
        }
      } catch (error) {
        console.error("Error checking for updates", error);
      }
    },
    { interval: 15000 },
  );

  return null;
};
