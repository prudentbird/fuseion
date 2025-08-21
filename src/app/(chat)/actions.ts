"use server";

import { z } from "zod/v4";
import { queries } from "~/lib/db";
import { cookies } from "next/headers";
import { Logger } from "~/lib/logger";
import { google } from "@ai-sdk/google";
import { Model } from "~/lib/ai/models";
import { generateObject, UIMessage } from "ai";
import { convertToUIMessages, getErrorMessage } from "~/lib/utils";

const logger = new Logger("chat/actions");

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage | UIMessage[];
}) {
  try {
    const {
      object: { title },
    } = await generateObject({
      model: google("gemini-2.0-flash-lite"),
      schema: z.object({
        title: z.string(),
      }),
      system: `\n
    - You will generate a short title based on the first message a user begins a conversation with
    - Ensure it is not more than 4 words
    - The title should be descriptive of the user's message in reference to the topic of the conversation
    - Do not use quotes or colons or any other punctuation
    - Do not use the word "chat" in the title
    - Do not use the word "conversation" in the title
    - Do not use the word "thread" in the title
    - Do not use the word "message" in the title
    - Do not use the word "new" in the title
    - Do not use plurals in the title
    - Do not use descriptors like initial, first, etc.
    - Do not return the user's message in the title
    - Return in Title Case`,
      temperature: 0.8,
      prompt: JSON.stringify(message),
    });

    return title;
  } catch (error) {
    logger.error(
      "Error generating title from user message:",
      getErrorMessage(error),
    );
    return "New Chat";
  }
}

export async function saveModelAsCookie(model: Model) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", JSON.stringify(model));
}

export async function regenerateThreadTitle({
  userId,
  threadId,
}: {
  userId: string;
  threadId: string;
}) {
  try {
    const messages = await queries.listMessagesByThreadId(threadId);
    const title = await generateTitleFromUserMessage({
      message: convertToUIMessages(messages),
    });
    return title;
  } catch (error) {
    logger.error("Error regenerating thread title:", getErrorMessage(error));
    const thread = await queries.getThreadByUserIdAndThreadId(userId, threadId);
    if (!thread) {
      return "New Chat";
    }
    return thread.title;
  }
}
