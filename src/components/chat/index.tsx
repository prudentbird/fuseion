"use client";

import ChatInput from "./input";
import { Model } from "~/data/models";
import { Messages } from "./messages";
import { ChatMessage } from "~/types";
import { useChat } from "@ai-sdk/react";
import type { Session } from "next-auth";
import { DefaultChatTransport } from "ai";
import { useState, useEffect } from "react";
import { api } from "~/convex/_generated/api";
import { useDataStream } from "./data-stream/provider";
import { useAutoResume } from "~/hooks/use-auto-resume";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchWithErrorHandlers, generateUUID } from "~/lib/utils";

const Chat = ({
  id,
  session,
  autoResume,
  selectedModel,
  preloadedInitialMessages,
}: {
  id: string;
  session: Session;
  autoResume: boolean;
  selectedModel: Model;
  preloadedInitialMessages?: Preloaded<typeof api.messages.listMessages>;
}) => {
  let initialMessages: ChatMessage[] = [];
  if (preloadedInitialMessages) {
    initialMessages = usePreloadedQuery(preloadedInitialMessages).map(
      (message) => ({
        id: message.id ?? "",
        role: message.role as "system" | "user" | "assistant",
        parts: message.parts ? JSON.parse(message.parts) : [],
        metadata: message.metadata ? JSON.parse(message.metadata) : undefined,
      }),
    );
  }

  const { setDataStream } = useDataStream();

  const {
    messages,
    status,
    regenerate,
    setMessages,
    stop,
    sendMessage,
    resumeStream,
    error,
  } = useChat<ChatMessage>({
    id,
    generateId: generateUUID,
    messages: initialMessages,
    experimental_throttle: 100,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            ...body,
            model: selectedModel,
            message: messages.at(-1),
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      router.replace(`/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  useAutoResume({
    id,
    session,
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  // Only sync when database has more messages than our current state
  useEffect(() => {
    const dbUserMessages = initialMessages.filter((msg) => msg.role === "user");
    const currentUserMessages = messages.filter((msg) => msg.role === "user");
    
    const dbMessageCount = dbUserMessages.length;
    const currentMessageCount = currentUserMessages.length;

    // Skip sync for new chats or when just starting out
    if (currentMessageCount <= 1 && dbMessageCount === 0) {
      return;
    }

    // Only run when database has more messages than our current state
    if (dbMessageCount > currentMessageCount) {
      const newMessages = dbUserMessages.filter(
        (initMsg) => !currentUserMessages.find((m) => m.id === initMsg.id),
      );

      if (newMessages.length > 0) {
        setMessages([...messages, ...newMessages]);
      }
    }
  }, [initialMessages, messages.length]);

  return (
    <div>
      <div
        className="absolute inset-0 overflow-y-scroll w-full pb-32"
        style={{ scrollbarGutter: "stable both-edges" }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pt-safe-offset-10">
          <Messages
            chatId={id}
            error={error}
            status={status}
            session={session}
            messages={messages}
            setMessages={setMessages}
            regenerate={regenerate}
          />
        </div>
      </div>
      <ChatInput
        id={id}
        stop={stop}
        status={status}
        session={session}
        sendMessage={sendMessage}
        selectedModel={selectedModel}
      />
    </div>
  );
};

export default Chat;
