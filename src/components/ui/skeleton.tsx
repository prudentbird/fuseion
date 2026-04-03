import { cn } from "~/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative isolate overflow-hidden rounded-[calc(var(--radius)+4px)] border border-zinc-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,244,245,0.88))] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_30px_-24px_rgba(24,24,27,0.32)]",
        "before:absolute before:inset-0 before:translate-x-[-120%] before:animate-[skeleton-shimmer_1.8s_ease-in-out_infinite] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.94)_48%,transparent_72%)]",
        "after:absolute after:inset-px after:rounded-[inherit] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent_65%)]",
        "dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_40px_-32px_rgba(0,0,0,0.85)] dark:before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.14)_48%,transparent_72%)] dark:after:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_70%)]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
