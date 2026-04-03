import { Skeleton } from "~/components/ui/skeleton";

function MessageSkeleton({
  align = "left",
  width = "max-w-[44rem]",
  lines,
}: {
  align?: "left" | "right";
  width?: string;
  lines: string[];
}) {
  return (
    <div
      className={`flex w-full ${align === "right" ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex w-full flex-col gap-2 ${width}`}>
        {lines.map((line, index) => (
          <Skeleton key={`${align}-${line}-${index}`} className={line} />
        ))}
      </div>
    </div>
  );
}

export default function ChatLoadingShell() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 overflow-y-scroll pb-40"
        style={{ scrollbarGutter: "stable both-edges" }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pt-safe-offset-10 pb-10">
          <div className="rounded-[24px] border border-border/60 bg-card/75 p-4 shadow-[0_24px_50px_-38px_rgba(0,0,0,0.65)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <MessageSkeleton
              lines={[
                "h-4 w-40 rounded-full",
                "h-5 w-full rounded-full",
                "h-5 w-[82%] rounded-full",
                "h-5 w-[64%] rounded-full",
              ]}
            />
            <MessageSkeleton
              align="right"
              width="max-w-[75%]"
              lines={[
                "ml-auto h-10 w-full rounded-[20px]",
                "ml-auto h-10 w-[84%] rounded-[20px]",
              ]}
            />
            <MessageSkeleton
              lines={[
                "h-4 w-32 rounded-full",
                "h-5 w-full rounded-full",
                "h-5 w-[88%] rounded-full",
                "h-5 w-[72%] rounded-full",
              ]}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 z-10 w-full px-2">
        <div className="relative mx-auto w-full max-w-3xl">
          <div className="rounded-t-[22px] border border-[#404040] bg-[#2a2a2a]/95 p-3 pb-safe-offset-3 shadow-[0_-28px_60px_-36px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="space-y-3">
              <Skeleton className="h-5 w-52 rounded-full border-white/10 bg-white/[0.06] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.12)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_70%)]" />
              <Skeleton className="h-5 w-2/3 rounded-full border-white/10 bg-white/[0.04] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_70%)]" />
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-28 rounded-full border-white/10 bg-white/[0.05] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.12)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_70%)]" />
                <Skeleton className="h-8 w-20 rounded-full border-white/10 bg-white/[0.04] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_70%)]" />
              </div>
              <Skeleton className="size-8 rounded-xl border-white/10 bg-white/[0.08] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.14)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_70%)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
