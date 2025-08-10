import { TriangleAlert } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";

export const ErrorMessage = ({ error }: { error: string }) => {
  return (
    <Alert
      variant="destructive"
      className="bg-red-900/10 border-red-500/20 text-red-300"
    >
      <TriangleAlert className="h-4 w-4" />
      <AlertDescription className="!text-red-300 gap-3">
        {error ?? "An error occured. Something went wrong."}
        <span>
          Kindly{" "}
          <Button
            variant="link"
            className="p-0 !text-red-300 underline font-semibold"
            onClick={() => window.location.reload()}
          >
            refresh the page
          </Button>{" "}
          and try again. If the issue persists, please{" "}
          <a
            className="underline underline-offset-4 font-semibold"
            href="mailto:prudentbird@gmail.com"
          >
            contact support.
          </a>
        </span>
      </AlertDescription>
    </Alert>
  );
};
