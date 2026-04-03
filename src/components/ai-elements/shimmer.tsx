"use client";

import * as React from "react";

import { cn } from "~/lib/utils";

export function Shimmer({
  children,
  className,
  duration = 1.8,
}: React.ComponentProps<"span"> & {
  duration?: number;
}) {
  return (
    <span
      className={cn(
        "inline-block bg-[linear-gradient(110deg,currentColor,rgba(255,255,255,0.35),currentColor)] bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_1.8s_linear_infinite]",
        className,
      )}
      style={{ animationDuration: `${duration}s` }}
    >
      {children}
    </span>
  );
}
