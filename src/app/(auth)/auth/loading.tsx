import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="absolute inset-0 min-h-screen overflow-hidden bg-[#2a2a2a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,186,209,0.2),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_36%)]" />
      <div className="relative px-6 pt-6">
        <Skeleton className="h-10 w-36 rounded-full border-white/10 bg-white/[0.05] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.12)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_70%)]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-white/[0.03] p-7 shadow-[0_36px_90px_-52px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <div className="space-y-5">
            <div className="space-y-3 text-center">
              <Skeleton className="mx-auto h-8 w-56 rounded-full border-white/10 bg-white/[0.06] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.14)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_70%)]" />
              <Skeleton className="mx-auto h-3.5 w-40 rounded-full border-white/10 bg-white/[0.04] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_70%)]" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-2xl border-white/10 bg-white/[0.06] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.14)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_70%)]" />
              <Skeleton className="h-10 w-full rounded-2xl border-white/10 bg-white/[0.04] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_70%)]" />
            </div>
            <div className="space-y-2 pt-1">
              <Skeleton className="h-3.5 w-full rounded-full border-white/10 bg-white/[0.04] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_70%)]" />
              <Skeleton className="h-3.5 w-5/6 rounded-full border-white/10 bg-white/[0.04] before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_48%,transparent_72%)] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_70%)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
