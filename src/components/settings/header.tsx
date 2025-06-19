'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { useActionState } from 'react';
import { logoutAction } from '~/app/(auth)/actions';
import { ArrowLeft, Loader2, UserLock } from 'lucide-react';

export const SettingsHeader = () => {
  const [_, action, isPending] = useActionState(logoutAction, null);

  return (
    <div className="flex items-center justify-between pb-8">
      <Button
        variant="ghost"
        asChild
        className="text-gray-300 hover:text-white hover:bg-gray-700"
      >
        <Link href="/chat" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Chat
        </Link>
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
