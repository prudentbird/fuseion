"use client";

import { toast } from "sonner";
import { generateUUID } from "~/lib/utils";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "~/convex/_generated/api";
import { Model, models as availableModels } from "~/data/models";
import { UIMessage, useChat, UseChatHelpers } from "@ai-sdk/react";
import { MessageInterface, MessageMetadata } from "~/types/message";
import { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextProps {
  messages: UIMessage<MessageMetadata>[];
  status: UseChatHelpers<UIMessage<MessageMetadata>>["status"];
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
  sendMessage: UseChatHelpers<UIMessage<MessageMetadata>>["sendMessage"];
  regenerate: UseChatHelpers<UIMessage<MessageMetadata>>["regenerate"];
  stop: UseChatHelpers<UIMessage<MessageMetadata>>["stop"];
  setMessages: UseChatHelpers<UIMessage<MessageMetadata>>["setMessages"];
  threadId: string | undefined;
  models: Model[];
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export function ChatProvider({
  children,
  threadId,
}: {
  children: ReactNode;
  threadId?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.userId;
  const [selectedModel, setSelectedModel] = useState<Model>(availableModels[0]);

  const addMessage = useMutation(api.messages.addMessage);

  const {
    messages: baseMessages,
    status,
    regenerate,
    setMessages,
    sendMessage: baseSendMessage,
    stop,
  } = useChat<UIMessage<MessageMetadata>>({
    id: threadId ?? generateUUID(),
    onError: () => {
      toast.error("An error occurred while sending the message");
    },
  });

  const sendMessage: UseChatHelpers<
    UIMessage<MessageMetadata>
  >["sendMessage"] = async (message, options) => {
    if (!userId) {
      toast.error("You must be logged in to send messages");
      return;
    }

    try {
      const messageId = generateUUID();

      const currentThreadId = threadId ?? generateUUID();
      baseSendMessage(
        {
          ...message,
          metadata: {
            ...message.metadata,
            threadId: currentThreadId,
            status: "submitted",
          },
        },
        options,
      );

      const convexMessage: Omit<
        MessageInterface,
        "threadId" | "createdAt" | "updatedAt" | "streamId"
      > = {
        id: messageId,
        role: "user",
        metadata: JSON.stringify(message.metadata),
        parts: JSON.stringify(message.parts),
      };

      await addMessage({
        threadId: currentThreadId,
        userId,
        message: convexMessage,
        threadInfo: !threadId
          ? {
              title: "New Chat",
              model: selectedModel.id,
              status: status,
              pinned: false,
            }
          : undefined,
      });

      if (!threadId) {
        router.push(`/chat/${currentThreadId}`);
      }

      return;
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
      throw err;
    }
  };

  const value: ChatContextProps = {
    messages: baseMessages,
    status,
    selectedModel,
    setSelectedModel,
    sendMessage,
    regenerate,
    stop,
    setMessages,
    threadId,
    models: availableModels,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useAppChat(initialMessages?: UIMessage<MessageMetadata>[]) {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useAppChat must be used within a ChatProvider");
  }

  if (initialMessages) {
    context.messages = initialMessages;
  }

  return context;
}
