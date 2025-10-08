"use client";

import ChatInput from "./input";
import { Messages } from "./messages";
import { ChatMessage, type CustomUIDataTypes } from "~/types";
import { Model } from "~/lib/ai/models";
import { useChat } from "@ai-sdk/react";
import type { Session } from "next-auth";
import { DefaultChatTransport, type DataUIPart } from "ai";
import { useState, useEffect } from "react";
import { api } from "~/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useDataStream } from "./data-stream/provider";
import { useAutoResume } from "~/hooks/use-auto-resume";
import { Preloaded, usePreloadedQuery } from "convex/react";
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
  preloadedInitialMessages: Preloaded<typeof api.messages.listMessages>;
}) => {
  const preloaded = usePreloadedQuery(preloadedInitialMessages);
  const initialMessages: ChatMessage[] = preloaded.map((message) => ({
    id: message.id ?? "",
    role: message.role as "system" | "user" | "assistant",
    parts: message.parts ? JSON.parse(message.parts) : [],
    metadata: message.metadata ? JSON.parse(message.metadata) : undefined,
  }));

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
    experimental_throttle: 20,
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
      setDataStream((ds) =>
        ds ? [...ds, dataPart as DataUIPart<CustomUIDataTypes>] : [],
      );
    },
  });

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
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  useAutoResume({
    setMessages,
    resumeStream,
    initialMessages,
    autoResume: autoResume || initialMessages.length > 0,
  });

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
            regenerate={regenerate}
            setMessages={setMessages}
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
