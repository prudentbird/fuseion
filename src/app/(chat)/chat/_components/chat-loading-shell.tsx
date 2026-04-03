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
        className="absolute inset-0 w-full overflow-y-scroll pb-32"
        style={{ scrollbarGutter: "stable both-edges" }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pt-safe-offset-10">
          <div className="flex min-w-0 flex-1 flex-col gap-6 pt-4">
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
    </div>
  );
}
