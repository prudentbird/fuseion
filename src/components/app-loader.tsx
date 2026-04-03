import { cn } from "~/lib/utils";

type AppLoaderProps = {
  className?: string;
  spinnerClassName?: string;
};

export default function AppLoader({
  className,
  spinnerClassName,
}: AppLoaderProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-[100] flex min-h-screen w-full items-center justify-center bg-background/92 backdrop-blur-sm",
        className,
      )}
    >
      <div
        aria-label="Loading"
        role="status"
        className={cn(
          "size-10 animate-spin rounded-full border-2 border-foreground/15 border-t-primary",
          spinnerClassName,
        )}
      />
    </div>
  );
}
