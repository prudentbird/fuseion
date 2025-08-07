"use client";

import { Button } from "../ui/button";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "~/app/(auth)/actions";
import { ArrowLeft, Loader2, UserLock } from "lucide-react";

export const SettingsHeader = () => {
  const router = useRouter();
  const [_, action, isPending] = useActionState(logoutAction, null);

  return (
    <div className="flex items-center justify-between pb-8">
      <Button
        variant="ghost"
        onClick={() => {
          router.push("/chat");
          router.refresh();
        }}
        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Chat
      </Button>
      <form action={action}>
        <Button
          variant="ghost"
          className="text-gray-300 hover:text-white hover:bg-gray-700 flex items-center gap-2"
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserLock className="h-4 w-4" />
          )}
          Sign Out
        </Button>
      </form>
    </div>
  );
};
