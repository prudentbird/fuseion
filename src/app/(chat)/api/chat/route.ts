import {
  streamText,
  smoothStream,
  wrapLanguageModel,
  createUIMessageStream,
  convertToModelMessages,
  JsonToSseTransformStream,
  extractReasoningMiddleware,
} from "ai";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { env } from "~/env";
import { after } from "next/server";
import { headers } from "next/headers";
import { auth } from "~/app/(auth)/auth";
import { checkBotId } from "botid/server";
import { createGroq } from "@ai-sdk/groq";
import { ChatSDKError } from "~/lib/errors";
import { createOpenAI } from "@ai-sdk/openai";
import { queries, mutations } from "~/lib/db";
import { ProviderOptions } from "@ai-sdk/provider-utils";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateTitleFromUserMessage } from "../../actions";
import { entitlementsByUserTier } from "~/lib/ai/entitlements";
import { convertToUIMessages, generateUUID } from "~/lib/utils";
import { postRequestBodySchema, PostRequestBody } from "./schema";
// import { markdownJoinerTransform } from "~/lib/ai/markdown-transform";

export const maxDuration = 120;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("REDIS_URL")) {
          console.log(
            "Resumable streams are disabled due to missing REDIS_URL",
          );
        } else {
          console.error(error);
        }
      }
    }
  }

  return globalStreamContext;
}

export async function POST(req: Request) {
  const abortSignal = req.signal;
  let requestBody: PostRequestBody;

  const session = await auth();

  if (!session?.user || !session.user.userId) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const verification = await checkBotId();

  if (verification.isBot) {
    return new ChatSDKError("forbidden:api").toResponse();
  }

  try {
    const json = await req.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const { id, model, message }: PostRequestBody = requestBody;

    const dailyMessageCount = await queries.getDailyMessageCountByUserId(
      session.user.userId,
    );

    if (
      dailyMessageCount >=
      entitlementsByUserTier[session.user.tier].maxMessagesPerDay
    ) {
      return new ChatSDKError(
        `rate_limit_daily:chat_${session.user.tier}`,
      ).toResponse();
    }

    const monthlyMessageCount = await queries.getMonthlyMessageCountByUserId(
      session.user.userId,
    );

    if (
      monthlyMessageCount >=
      entitlementsByUserTier[session.user.tier].maxMessagesPerMonth
    ) {
      if (session.user.tier === "free") {
        return new ChatSDKError(
          `rate_limit_monthly:chat_${session.user.tier}`,
        ).toResponse();
      }

      const credits = await queries.getUserCredits(session.user.userId);
      if (credits === null || credits < 1) {
        return new ChatSDKError(
          `rate_limit_monthly:chat_${session.user.tier}`,
        ).toResponse();
      }
      await mutations.updateUserCredits(session.user.userId, credits - 1);
    }

    const thread = await queries.getThreadByUserIdAndThreadId(
      session.user.userId,
      id,
    );

    if (!thread) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await mutations.createThread({
        id,
        title,
        model: model.id,
        status: "streaming",
        pinned: false,
        userId: session.user.userId,
      });
    } else {
      if (thread.userId !== session.user.userId) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
      await mutations.updateThreadWithId({
        id,
        status: "streaming",
      });
    }

    const messagesFromConvex = await queries.listMessagesByThreadId(id);

    const uiMessages = [...convertToUIMessages(messagesFromConvex), message];

    await mutations.createMessage({
      threadId: id,
      userId: session.user.userId,
      id: message.id,
      role: message.role,
      parts: JSON.stringify(message.parts),
      metadata: JSON.stringify({
        model,
        threadId: id,
        createdAt: new Date(),
      }),
    });

    const streamId = generateUUID();
    await mutations.createStream({
      id: streamId,
      threadId: id,
    });

    abortSignal?.addEventListener("abort", async () => {
      await mutations.updateThreadWithId({
        id,
        status: "done",
      });
    });

    let modelId = model.id;
    let apiKey: string | undefined;
    const headersList = await headers();
    let providerOptions: ProviderOptions | undefined;
    let provider = model.metadata.provider.toLowerCase();
    let aiModel: Parameters<typeof streamText>[0]["model"];

    switch (provider) {
      case "openai":
        apiKey = headersList.get("openai-api-key") ?? env.OPENAI_API_KEY;
        if (!apiKey) {
          return new ChatSDKError("unauthorized:api").toResponse();
        }
        const openai = createOpenAI({ apiKey });
        aiModel = openai(modelId);
        break;

      case "openrouter":
        apiKey =
          headersList.get("openrouter-api-key") ?? env.OPENROUTER_API_KEY;
        if (!apiKey) {
          return new ChatSDKError("unauthorized:api").toResponse();
        }
        const openrouter = createOpenAI({
          apiKey,
          baseURL: "https://openrouter.ai/api/v1",
        });
        aiModel = openrouter(modelId);
        break;

      case "groq":
        apiKey = headersList.get("groq-api-key") ?? env.GROQ_API_KEY;
        if (!apiKey) {
          return new ChatSDKError("unauthorized:api").toResponse();
        }
        const groq = createGroq({ apiKey });
        aiModel = groq(modelId);
        break;

      case "google":
        apiKey =
          headersList.get("google-generative-ai-api-key") ??
          env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
          return new ChatSDKError("unauthorized:api").toResponse();
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
      default:
        return new ChatSDKError("unsupported_provider:api").toResponse();
    }

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: wrapLanguageModel({
            model: aiModel,
            middleware: extractReasoningMiddleware({
              tagName: "think",
            }),
          }),
          messages: convertToModelMessages(uiMessages),
          experimental_transform: [
            // markdownJoinerTransform(),
            smoothStream({ chunking: "word" }),
          ],
          ...(providerOptions ? { providerOptions } : {}),
          abortSignal,
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        messages.forEach(async (message) => {
          await mutations.createMessage({
            threadId: id,
            userId: session.user.userId,
            id: message.id,
            role: message.role,
            parts: JSON.stringify(message.parts),
            metadata: JSON.stringify({
              model,
              threadId: id,
              createdAt: new Date(),
            }),
          });
        });
        await mutations.updateThreadWithId({
          id,
          status: "done",
        });
      },
      onError: (error) => {
        if (error instanceof Error && error.name === "AbortError") {
          return "The chat request was aborted by the client. Please try again.";
        }

        return "Oops, an error occurred!";
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream()),
        ),
      );
    } else {
      return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    }
  } catch (error) {
    console.error("[Chat Route Error]:", error);
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    return new ChatSDKError("internal_server_error:api").toResponse();
  }
}
