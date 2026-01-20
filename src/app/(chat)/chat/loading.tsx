import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <Skeleton className="h-20 w-3/4" />
        <Skeleton className="h-20 w-2/3 ml-auto" />
        <Skeleton className="h-20 w-3/4" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
