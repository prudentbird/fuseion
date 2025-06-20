import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

export const ErrorMessage = ({ error }: { error: string }) => {
  return (
    <Alert
      variant="destructive"
      className="bg-red-900/10 border-red-500/20 text-red-300"
    >
      <TriangleAlert className="h-4 w-4" />
      <AlertDescription className="!text-red-300">
        {error ?? "An error occured. Something went wrong."}
      </AlertDescription>
    </Alert>
  );
};
