import { env } from "~/env";
import { headers } from "next/headers";
import { createOpenAI } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { postRequestBodySchema, PostRequestBody } from "../schema";
import { streamText, smoothStream, convertToModelMessages } from "ai";

export const maxDuration = 60;
export async function POST(req: NextRequest) {
  let requestBody: PostRequestBody;

  try {
    const json = await req.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (err) {
    console.log("bad_request:api", err);
    return NextResponse.json(
      { error: "bad_request:api" },
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const { messages } = requestBody;
    const headersList = await headers();

    const lastMessage = messages[messages.length - 1];
    const model = lastMessage?.metadata?.model;
    if (!model) {
      return NextResponse.json(
        { error: "Missing model in message metadata" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const provider = model.metadata.provider.toLowerCase();
    const modelId = model.id;
    let aiModel: Parameters<typeof streamText>[0]["model"];
    let apiKey: string | undefined;
    let providerOptions;

    switch (provider) {
      case "openai": {
        apiKey = headersList.get("openai-api-key") || env.OPENAI_API_KEY;
        if (!apiKey) {
          return NextResponse.json(
            { error: "Missing OpenAI API key" },
            { status: 400 },
          );
        }
        const openai = createOpenAI({ apiKey });
        aiModel = openai(modelId);
        break;
      }
      case "openrouter": {
        apiKey =
          headersList.get("openrouter-api-key") || env.OPENROUTER_API_KEY;
        if (!apiKey) {
          return NextResponse.json(
            { error: "Missing OpenRouter API key" },
            { status: 400 },
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
          headersList.get("google-generative-ai-api-key") ||
          env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
          return NextResponse.json(
            { error: "Missing Google Generative AI API key" },
            { status: 400 },
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
        return NextResponse.json(
          { error: "Unsupported model provider" },
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    const modelMessages = convertToModelMessages(messages);

    const chunking = model.metadata.streamChunking;
    const experimental_transform = chunking
      ? [smoothStream({ chunking })]
      : undefined;

    const result = streamText({
      model: aiModel,
      messages: modelMessages,
      experimental_transform,
      ...(providerOptions ? { providerOptions } : {}),
      abortSignal: req.signal,
      onError: (error) => {
        console.log("[ERROR]: ", error);
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      onError: (error) => {
        console.error("[ERROR]: ", error);
        return "Unable to complete request. Please try again.";
      },
    });
  } catch (error) {
    console.log("error", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
