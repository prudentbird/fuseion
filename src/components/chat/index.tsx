'use client';

import ChatInput from './input';
import { Messages } from './messages';
import { useAppChat } from './context';

const Chat = ({ id }: { id?: string }) => {
  const {
    messages,
    status,
    regenerate,
    setMessages,
    stop,
    selectedModel,
    setSelectedModel,
    sendMessage,
  } = useAppChat();

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
      />
    </div>
  );
};

export default Chat;
