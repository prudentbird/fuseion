import { cache } from "react";
import { formatISO } from "date-fns";
import { models } from "~/data/models";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { ChatMessage, MessagePart } from "~/types";
import { ChatSDKError, ErrorCode } from "./errors";
import { Doc } from "~/convex/_generated/dataModel";
import { AssistantModelMessage, ToolModelMessage } from "ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function convertToUIMessages(
  messages: Doc<"messages">[],
): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    parts: JSON.parse(message.parts || "[]") as MessagePart[],
    metadata: {
      model: JSON.parse(message.metadata || "{}").model,
      threadId: message.threadId,
      createdAt: formatISO(message.createdAt),
    },
  }));
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const { code, cause } = await response.json();
    throw new ChatSDKError(code as ErrorCode, cause);
  }

  return response.json();
};

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { code, cause } = await response.json();
      throw new ChatSDKError(code as ErrorCode, cause);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ChatSDKError("offline:chat");
    }

    throw error;
  }
}

export const getDefaultModel = cache(() => {
  let defaultModel = models.find((m) => m.metadata.modelPickerDefault === true);

  if (!defaultModel) {
    console.error("Default model is not configured");
    defaultModel = models[0];
  }

  return defaultModel;
});

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return `Unknown error: ${String(error)}`;
};

export function getTextFromMessage(message: ChatMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

type ResponseMessageWithoutId = ToolModelMessage | AssistantModelMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };
export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}
