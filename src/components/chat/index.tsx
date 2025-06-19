'use client';

import ChatInput from './input';
import { Messages } from './messages';
import { useAppChat } from './context';
import { UIMessage } from '@ai-sdk/react';
import { api } from '~/convex/_generated/api';
import { MessageMetadata } from '~/types/message';
import { Preloaded, usePreloadedQuery } from 'convex/react';

const Chat = ({
  id,
  preloadedInitialMessages,
}: {
  id?: string;
  preloadedInitialMessages?: Preloaded<typeof api.messages.listMessages>;
}) => {
  let initialMessages: UIMessage<MessageMetadata>[] = [];
  if (preloadedInitialMessages) {
    initialMessages = usePreloadedQuery(preloadedInitialMessages).map(
      (message) => ({
        id: message.id ?? '',
        role: message.role as 'system' | 'user' | 'assistant',
        parts: message.parts ? JSON.parse(message.parts) : [],
        metadata: message.metadata ? JSON.parse(message.metadata) : undefined,
      }),
    );
  }
  const {
    messages,
    status,
    regenerate,
    setMessages,
    stop,
    selectedModel,
    setSelectedModel,
    sendMessage,
    models,
  } = useAppChat(initialMessages);

  return (
    <div>
      <div
        className="absolute inset-0 overflow-y-scroll w-full pb-32"
        style={{ scrollbarGutter: 'stable both-edges' }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pt-safe-offset-10">
          <Messages
            chatId={id ?? ''}
            status={status}
            messages={messages}
            setMessages={setMessages}
            regenerate={regenerate}
          />
        </div>
      </div>
      <ChatInput
        status={status}
        stop={stop}
        sendMessage={sendMessage}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        models={models}
      />
    </div>
  );
};

export default Chat;
