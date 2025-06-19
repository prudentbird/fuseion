'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import cx from 'classnames';
import equal from 'fast-deep-equal';
import { Markdown } from './markdown';
import { Pencil } from 'lucide-react';
import { memo, useState } from 'react';
import { ErrorMessage } from './error';
import { MessageEditor } from './editor';
import { MessageActions } from './actions';
import { cn, sanitizeText } from '~/lib/utils';
import { MessageReasoning } from './reasoning';
import { Button } from '~/components/ui/button';
import type { MessageMetadata } from '~/types/message';
import { AnimatePresence, motion } from 'framer-motion';
// import { PreviewAttachment } from './attachment-preview';
import type { UseChatHelpers, UIMessage } from '@ai-sdk/react';
// type FileUIPart = Extract<UIMessage['parts'][number], { type: 'file' }>;

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  setMessages,
  regenerate,
  requiresScrollPadding,
}: {
  chatId: string;
  message: UIMessage<MessageMetadata>;
  isLoading: boolean;
  setMessages: UseChatHelpers<UIMessage<MessageMetadata>>['setMessages'];
  regenerate: UseChatHelpers<UIMessage<MessageMetadata>>['regenerate'];
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-[75%]',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          <div
            className={cn('flex flex-col gap-2 w-full', {
              'min-h-96': message.role === 'assistant' && requiresScrollPadding,
            })}
          >
            {/* {message.parts?.filter((part): part is FileUIPart => part.type === 'file').length > 0 && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row justify-end gap-2"
              >
                {message.parts?.filter((part): part is FileUIPart => part.type === 'file').map((filePart) => (
                  <PreviewAttachment key={filePart.url} attachment={filePart} />
                ))}
              </div>
            )} */}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'reasoning') {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.text}
                  />
                );
              }

              if (type === 'text') {
                if (mode === 'view') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {/* {message.role === 'user' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode('edit');
                              }}
                            >
                              <Pencil />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )} */}

                      {part.text &&
                      part.text.length > 0 &&
                      part.text.trim() !== '' ? (
                        <div
                          data-testid="message-content"
                          className={cn(
                            'flex flex-col gap-4',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-tl-4xl rounded-b-4xl border-primary px-4 py-1.5'
                              : 'bg-transparent border-none shadow-none w-full',
                          )}
                        >
                          <Markdown>{sanitizeText(part.text)}</Markdown>
                        </div>
                      ) : (
                        <ErrorMessage error="Response is empty." />
                      )}
                    </div>
                  );
                }

                if (mode === 'edit') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />
                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        regenerate={regenerate}
                      />
                    </div>
                  );
                }
              }

              // Handle file parts - they are already rendered above, so we skip them here
              if (type === 'file') {
                return null;
              }

              // Handle other part types that might be added in the future
              return null;
            })}

            {
              <MessageActions
                key={`action-${message.id}`}
                message={message}
                isLoading={isLoading}
              />
            }
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-[75%] group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
