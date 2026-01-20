import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="absolute inset-0 min-h-screen bg-[#2a2a2a] text-white flex flex-col">
      <div className="mt-6 ml-6">
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full flex flex-col items-center justify-center gap-4">
          <div className="text-center space-y-2 mb-3">
            <Skeleton className="h-8 w-64 mx-auto" />
          </div>
          <div className="w-full max-w-sm">
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}

