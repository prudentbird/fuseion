import { memo, useEffect } from 'react';
import equal from 'fast-deep-equal';
import { Greeting } from './greeting';
import { motion } from 'framer-motion';
import type { UIMessage } from '@ai-sdk/react';
import { MessageMetadata } from '~/types/message';
import { useMessages } from '~/hooks/use-messages';
import type { UseChatHelpers } from '@ai-sdk/react';
import { PreviewMessage, ThinkingMessage } from './message';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<UIMessage<MessageMetadata>>['status'];
  messages: Array<UIMessage<MessageMetadata>>;
  setMessages: UseChatHelpers<UIMessage<MessageMetadata>>['setMessages'];
  regenerate: UseChatHelpers<UIMessage<MessageMetadata>>['regenerate'];
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  regenerate,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
    scrollToBottom,
    isAtBottom,
  } = useMessages({
    chatId,
    status,
  });

  useEffect(() => {
    if ((isAtBottom || hasSentMessage) && messages.length > 0) {
      scrollToBottom('instant');
    }
  }, [messages, isAtBottom, hasSentMessage, scrollToBottom]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 pt-4"
    >
      {messages.length === 0 && <Greeting />}

      {messages.map((message, index) => (
        <PreviewMessage
          key={`${message.id}-${index}`}
          chatId={chatId}
          message={message}
          isLoading={status === 'streaming' && messages.length - 1 === index}
          setMessages={setMessages}
          regenerate={regenerate}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
        />
      ))}

      {status === 'submitted' &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});
