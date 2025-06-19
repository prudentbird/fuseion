import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '~/components/ui/tooltip';
import { memo } from 'react';
import { toast } from 'sonner';
import type { UIMessage } from 'ai';
// import { useAppChat } from '../context';
import { Copy, RefreshCcw } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useCopyToClipboard } from 'usehooks-ts';
import type { MessageMetadata } from '~/types/message';

export function PureMessageActions({
  message,
  isLoading,
}: {
  message: UIMessage<MessageMetadata>;
  isLoading: boolean;
}) {
  if (isLoading) return null;
  // const { regenerate } = useAppChat();
  const [_, copyToClipboard] = useCopyToClipboard();

  if (message.role === 'user')
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex flex-row gap-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-150 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="p-2 rounded-md h-fit text-muted-foreground size-8"
                variant="ghost"
                size="icon"
                onClick={async () => {
                  const textFromParts = message.parts
                    ?.filter((part) => part.type === 'text')
                    .map((part) => part.text)
                    .join('\n')
                    .trim();

                  if (!textFromParts) {
                    toast.error("There's no text to copy!");
                    return;
                  }

                  await copyToClipboard(textFromParts);
                  toast.success('Copied to clipboard!');
                }}
              >
                <Copy />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" side="bottom">
              Copy
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );

  return (
    <div className="flex flex-row gap-2 items-center opacity-0 group-hover/message:opacity-100 transition-opacity duration-150">
      <TooltipProvider delayDuration={0}>
        <div className="flex flex-row gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="p-2 rounded-md h-fit text-muted-foreground size-8"
                variant="ghost"
                size="icon"
                onClick={async () => {
                  const textFromParts = message.parts
                    ?.filter((part) => part.type === 'text')
                    .map((part) => part.text)
                    .join('\n')
                    .trim();

                  if (!textFromParts) {
                    toast.error("There's no text to copy!");
                    return;
                  }

                  await copyToClipboard(textFromParts);
                  toast.success('Copied to clipboard!');
                }}
              >
                <Copy />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="start" side="bottom">
              Copy
            </TooltipContent>
          </Tooltip>
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="p-2 rounded-md h-fit text-muted-foreground size-8"
                variant="ghost"
                size="icon"
                // onClick={() => regenerate({ messageId: message.id })}
              >
                <RefreshCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="start" side="bottom">
              Regenerate
            </TooltipContent>
          </Tooltip> */}
        </div>
      </TooltipProvider>
      {message.role === 'assistant' && message.metadata?.model && (
        <span className="text-xs text-muted-foreground">
          {message.metadata.model.name}
        </span>
      )}
    </div>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
