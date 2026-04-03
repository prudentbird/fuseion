import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(225,121,181,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />
      <div className="relative mx-auto w-full max-w-3xl">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-[28px] border border-border/60 bg-card/75 p-6 shadow-[0_32px_90px_-54px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
          <Skeleton className="h-28 w-full rounded-[24px]" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-20 rounded-[20px]" />
            <Skeleton className="h-20 rounded-[20px]" />
            <Skeleton className="h-20 rounded-[20px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
