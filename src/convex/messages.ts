import { v } from "convex/values";
import {
  mutation,
  query,
  httpAction,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { z } from "zod/v4";
import type { ProviderOptions } from "ai";
import { internal } from "./_generated/api";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { PostRequestBody } from "~/app/(chat)/api/chat/schema";
import {
  streamText,
  smoothStream,
  convertToModelMessages,
  generateObject,
} from "ai";
export const addMessage = mutation({
  args: {
    threadId: v.string(),
    userId: v.string(),
    message: v.object({
      id: v.string(),
      role: v.string(),
      parts: v.string(),
      metadata: v.optional(v.string()),
    }),
    threadInfo: v.optional(
      v.object({
        title: v.string(),
        model: v.string(),
        status: v.string(),
        pinned: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_external_id", (q) => q.eq("id", args.threadId))
      .unique();
    if (!thread) {
      if (!args.threadInfo) {
        throw new Error("Missing thread info for first message");
      }
      await ctx.db.insert("threads", {
        id: args.threadId,
        userId: args.userId,
        title: args.threadInfo.title,
        model: args.threadInfo.model,
        status: args.threadInfo.status,
        pinned: args.threadInfo.pinned,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.scheduler.runAfter(0, internal.messages.generateTitle, {
        threadId: args.threadId,
        prompt: args.message.parts,
      });
    }
    return await ctx.db.insert("messages", {
      id: args.message.id,
      role: args.message.role,
      threadId: args.threadId,
      parts: args.message.parts,
      metadata: args.message.metadata,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
  },
});

export const addAssistantMessage = internalMutation({
  args: {
    threadId: v.string(),
    message: v.object({
      role: v.string(),
      streamId: v.string(),
      parts: v.optional(v.string()),
      metadata: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("messages", {
      role: args.message.role,
      threadId: args.threadId,
      parts: args.message.parts,
      metadata: args.message.metadata,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateMessage = internalMutation({
  args: {
    messageId: v.id("messages"),
    message: v.object({
      id: v.optional(v.string()),
      parts: v.optional(v.string()),
      metadata: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { messageId, message }) => {
    await ctx.db.patch(messageId, {
      id: message.id,
      parts: message.parts,
      metadata: message.metadata,
      updatedAt: Date.now(),
    });
  },
});

export const streamChat = httpAction(async (ctx, request) => {
  const body = (await request.json()) as PostRequestBody & {
    streamId: string;
  };

  if (body.messages[0].metadata?.threadId) {
    await ctx.runMutation(internal.threads.internalUpdateThreadWithExternalId, {
      id: body.messages[0].metadata.threadId,
      status: "streaming",
    });
  }

  const { streamId, messages } = body;
  const lastMessage = messages[messages.length - 1];
  const model = lastMessage?.metadata?.model;
  if (!model) {
    return new Response(
      JSON.stringify({ error: "Missing model in message metadata" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const modelId = model.id;
  const provider = model.metadata.provider.toLowerCase();
  let aiModel: Parameters<typeof streamText>[0]["model"];
  let apiKey: string | undefined;
  let providerOptions: ProviderOptions | undefined;
  const headers = request.headers;

  switch (provider) {
    case "openai": {
      apiKey = headers.get("openai-api-key") || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "Missing OpenAI API key" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      const openai = createOpenAI({ apiKey });
      aiModel = openai(modelId);
      break;
    }
    case "openrouter": {
      apiKey =
        headers.get("openrouter-api-key") || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "Missing OpenRouter API key" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      const openrouter = createOpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      });
      aiModel = openrouter(modelId);
      break;
    }
    case "google": {
      apiKey =
        headers.get("google-generative-ai-api-key") ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "Missing Google Generative AI API key" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      const google = createGoogleGenerativeAI({ apiKey });
      aiModel = google(modelId);
      providerOptions = {
        google: {
          thinkingConfig: {
            includeThoughts: true,
          },
        },
      };
      break;
    }
    default:
      return new Response(
        JSON.stringify({ error: "Unsupported model provider" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
  }

  const modelMessages = convertToModelMessages(messages);
  const chunking = model.metadata.streamChunking;
  const experimental_transform = chunking
    ? [smoothStream({ chunking })]
    : undefined;

  const now = Date.now();
  const messageId = await ctx.runMutation(
    internal.messages.addAssistantMessage,
    {
      threadId: lastMessage.metadata?.threadId ?? "",
      message: {
        streamId,
        role: "assistant",
        metadata: JSON.stringify({
          model,
          streamId,
          status: "streaming",
        }),
      },
    },
  );

  const partsArray: unknown[] = [];
  const streamResult = streamText({
    model: aiModel,
    messages: modelMessages,
    experimental_transform,
    ...(providerOptions ? { providerOptions } : {}),
    onChunk: async (chunk) => {
      const now = Date.now();
      function upsertPart(type: "text" | "reasoning", newText: string) {
        const idx = partsArray.findIndex(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            "type" in item &&
            (item as { type: unknown }).type === type,
        );
        if (idx !== -1) {
          const existing = partsArray[idx];
          if (
            typeof existing === "object" &&
            existing !== null &&
            "text" in existing &&
            typeof (existing as { text: unknown }).text === "string"
          ) {
            const updated = {
              type,
              text: (existing as { text: string }).text + newText,
            };
            partsArray[idx] = updated;
          }
        } else {
          partsArray.push({ type, text: newText });
        }
      }
      switch (chunk.chunk.type) {
        case "text":
          upsertPart("text", chunk.chunk.text);
          break;
        case "reasoning":
          upsertPart("reasoning", chunk.chunk.text);
          break;
        default:
          break;
      }
      await ctx.runMutation(internal.messages.updateMessage, {
        messageId,
        message: {
          parts: JSON.stringify(partsArray),
          metadata: JSON.stringify({
            model,
            streamId,
            status: "streaming",
          }),
        },
      });
    },
    onError: async (error) => {
      const now = Date.now();
      await ctx.runMutation(internal.messages.updateMessage, {
        messageId,
        message: {
          metadata: JSON.stringify({
            model,
            streamId,
            status: "error",
          }),
        },
      });
    },
    onFinish: async (message) => {
      const now = Date.now();
      await ctx.runMutation(internal.messages.updateMessage, {
        messageId,
        message: {
          id: message.response.id,
          parts: JSON.stringify(message.content),
          metadata: JSON.stringify({
            model,
            streamId,
            status: "ready",
          }),
        },
      });
    },
  });

  try {
    const response = streamResult.toUIMessageStreamResponse({
      sendReasoning: true,
      onError: (error) => {
        return "Unable to complete request. Please try again.";
      },
      onFinish: async () => {
        const now = Date.now();
        await ctx.runMutation(internal.messages.updateMessage, {
          messageId,
          message: {
            metadata: JSON.stringify({
              model,
              streamId,
              status: "ready",
            }),
          },
        });
      },
    });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Vary", "Origin");
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create stream" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Vary: "Origin",
      },
    });
  }
});

export const generateTitle = internalAction({
  args: {
    prompt: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
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
      prompt: args.prompt,
    });

    await ctx.runMutation(internal.threads.internalUpdateThreadWithExternalId, {
      id: args.threadId,
      title: title ?? "New Chat",
    });

    return title;
  },
});
