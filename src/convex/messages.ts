import { v } from 'convex/values';
import {
  mutation,
  query,
  httpAction,
  internalMutation,
} from './_generated/server';
import type { ProviderOptions } from 'ai';
import { internal } from './_generated/api';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { PostRequestBody } from '~/app/(chat)/api/chat/schema';
import { streamText, smoothStream, convertToModelMessages } from 'ai';
export const addMessage = mutation({
  args: {
    threadId: v.string(),
    userId: v.string(),
    message: v.object({
      id: v.string(),
      role: v.string(),
      parts: v.string(),
      metadata: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
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
    const thread = await ctx.db
      .query('threads')
      .withIndex('by_external_id', (q) => q.eq('id', args.threadId))
      .unique();
    if (!thread) {
      if (!args.threadInfo)
        throw new Error('Missing thread info for first message');
      const now = Date.now();
      await ctx.db.insert('threads', {
        id: args.threadId,
        userId: args.userId,
        title: args.threadInfo.title,
        model: args.threadInfo.model,
        status: args.threadInfo.status,
        pinned: args.threadInfo.pinned,
        createdAt: now,
        updatedAt: now,
      });
    }
    return await ctx.db.insert('messages', {
      id: args.message.id,
      role: args.message.role,
      threadId: args.threadId,
      parts: args.message.parts,
      metadata: args.message.metadata,
      createdAt: args.message.createdAt,
      updatedAt: args.message.updatedAt,
    });
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_thread', (q) => q.eq('threadId', args.threadId))
      .order('asc')
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
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('messages', {
      role: args.message.role,
      threadId: args.threadId,
      parts: args.message.parts,
      metadata: args.message.metadata,
      createdAt: args.message.createdAt,
      updatedAt: args.message.updatedAt,
    });
  },
});

export const updateMessage = internalMutation({
  args: {
    messageId: v.id('messages'),
    message: v.object({
      parts: v.optional(v.string()),
      metadata: v.optional(v.string()),
      updatedAt: v.number(),
    }),
  },
  handler: async (ctx, { messageId, message }) => {
    await ctx.db.patch(messageId, {
      parts: message.parts,
      metadata: message.metadata,
      updatedAt: message.updatedAt,
    });
  },
});

export const streamChat = httpAction(async (ctx, request) => {
  const body = (await request.json()) as PostRequestBody & {
    streamId: string;
  };

  const { streamId, messages } = body;
  const lastMessage = messages[messages.length - 1];
  const model = lastMessage?.metadata?.model;
  if (!model) {
    return new Response(
      JSON.stringify({ error: 'Missing model in message metadata' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const modelId = model.id;
  const provider = model.metadata.provider.toLowerCase();
  let aiModel: Parameters<typeof streamText>[0]['model'];
  let apiKey: string | undefined;
  let providerOptions: ProviderOptions | undefined;
  const headers = request.headers;

  switch (provider) {
    case 'openai': {
      apiKey = headers.get('openai-api-key') || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'Missing OpenAI API key' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
      const openai = createOpenAI({ apiKey });
      aiModel = openai(modelId);
      break;
    }
    case 'openrouter': {
      apiKey =
        headers.get('openrouter-api-key') || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'Missing OpenRouter API key' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
      const openrouter = createOpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
      });
      aiModel = openrouter(modelId);
      break;
    }
    case 'google': {
      apiKey =
        headers.get('google-generative-ai-api-key') ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'Missing Google Generative AI API key' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
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
        JSON.stringify({ error: 'Unsupported model provider' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
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
      threadId: lastMessage.metadata?.threadId ?? '',
      message: {
        streamId,
        role: 'assistant',
        createdAt: now,
        updatedAt: now,
        metadata: JSON.stringify({
          streamId,
          status: 'streaming',
        }),
      },
    },
  );
  const streamResult = streamText({
    model: aiModel,
    messages: modelMessages,
    experimental_transform,
    ...(providerOptions ? { providerOptions } : {}),
    onChunk: (chunk) => {
      const now = Date.now();
      ctx.runMutation(internal.messages.updateMessage, {
        messageId,
        message: {
          parts: JSON.stringify(chunk),
          updatedAt: now,
          metadata: JSON.stringify({
            status: 'streaming',
          }),
        },
      });
    },
    onError: (error) => {
      const now = Date.now();
      console.error('[Streaming Error]:', error);
      ctx.runMutation(internal.messages.updateMessage, {
        messageId,
        message: {
          metadata: JSON.stringify({
            status: 'error',
          }),
          updatedAt: now,
        },
      });
    },
    onFinish: () => {
      const now = Date.now();
      ctx.runMutation(internal.messages.updateMessage, {
        messageId,
        message: {
          metadata: JSON.stringify({
            status: 'ready',
          }),
          updatedAt: now,
        },
      });
    },
  });

  try {
    const response = streamResult.toUIMessageStreamResponse({
      sendReasoning: true,
      onError: (error) => {
        console.error('[ERROR]: ', error);
        return 'Unable to complete request. Please try again.';
      },
      onFinish: () => {
        const now = Date.now();
        ctx.runMutation(internal.messages.updateMessage, {
          messageId,
          message: {
            metadata: JSON.stringify({ status: 'ready' }),
            updatedAt: now,
          },
        });
      },
    });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Vary', 'Origin');
    return response;
  } catch (error) {
    console.error('[Stream Creation Error]:', error);
    return new Response(JSON.stringify({ error: 'Failed to create stream' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Vary: 'Origin',
      },
    });
  }
});
