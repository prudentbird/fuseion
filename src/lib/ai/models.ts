export interface Model {
  id: string;
  name: string;
  metadata: {
    shortDescription: string;
    fullDescription: string;
    provider: string;
    developer: string;
    type?: string;
    createdAt?: number;
    updatedAt?: number;
    apiKeySupport?: "optional" | "required" | "none";
    disabled: boolean;
    experimental: boolean;
    features: string[];
    streamChunking?: "word" | "line";
    limits: {
      maxInputTokens: number;
      maxOutputTokens: number;
    };
    modelPickerDefault?: boolean;
  };
}

export const models: Model[] = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    metadata: {
      shortDescription: "Google's latest stable model",
      fullDescription:
        "Google's flagship model, known for speed and accuracy (and also web search!). Not quite as smart as Claude 3.5 Sonnet, but WAY faster and cheaper. Also has an insanely large context window (it can handle a lot of data).",
      provider: "Google",
      developer: "Google",
      disabled: false,
      experimental: false,
      features: ["search"],
      limits: {
        maxInputTokens: 1000000,
        maxOutputTokens: 8192,
      },
      modelPickerDefault: true,
      streamChunking: "word",
      apiKeySupport: "optional",
    },
  },
  {
    id: "gemini-2.5-flash-preview-04-17",
    name: "Gemini 2.5 Flash",
    metadata: {
      provider: "Google",
      developer: "Google",
      shortDescription: "Google's latest fast model",
      fullDescription: "Google's latest fast model, but now it can think!",
      disabled: false,
      modelPickerDefault: false,
      limits: { maxInputTokens: 1000000, maxOutputTokens: 65535 },
      streamChunking: "word",
      features: ["images", "pdfs", "search", "reasoningEffort"],
      experimental: false,
      apiKeySupport: "required",
    },
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    metadata: {
      provider: "Google",
      developer: "Google",
      shortDescription: "Faster, less precise Gemini model",
      fullDescription:
        "Similar to 2.0 Flash, but even faster. Not as smart, but still good at most things.",
      disabled: false,
      modelPickerDefault: false,
      limits: { maxInputTokens: 1000000, maxOutputTokens: 8192 },
      streamChunking: "word",
      features: ["fast", "images", "pdfs"],
      experimental: true,
      apiKeySupport: "optional",
    },
  },
  // {
  //   id: "gpt-4.1-mini",
  //   name: "GPT-4.1 Mini",
  //   metadata: {
  //     provider: "OpenAI",
  //     developer: "OpenAI",
  //     shortDescription: "Fast and accurate mid-sized model",
  //     fullDescription:
  //       "GPT-4.1 Mini is a mid-sized model delivering performance competitive with GPT-4o at substantially lower latency. It has a very large context window and scores 45.1% on hard instruction evals, 35.8% on MultiChallenge, and 84.1% on IFEval. Mini also shows strong coding ability (e.g., 31.6% on Aider's polyglot diff benchmark) and vision understanding.",
  //     disabled: false,
  //     modelPickerDefault: false,
  //     limits: { maxInputTokens: 1000000, maxOutputTokens: 16384 },
  //     streamChunking: "word",
  //     features: ["parameters", "images"],
  //     experimental: false,
  //     apiKeySupport: "required",
  //   },
  // },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    metadata: {
      provider: "Google",
      developer: "Google",
      shortDescription: "Google's newest experimental model",
      fullDescription:
        "Google's most advanced model, excelling at complex reasoning and problem-solving. Particularly strong at tackling difficult code challenges, mathematical proofs, and STEM problems. With its massive context window, it can deeply analyze large codebases, datasets and technical documents to provide comprehensive solutions.",
      disabled: false,
      modelPickerDefault: true,
      limits: { maxInputTokens: 200000, maxOutputTokens: 64000 },
      streamChunking: "word",
      features: ["parameters", "images", "pdfs", "search", "reasoning"],
      experimental: true,
      apiKeySupport: "required",
    },
  },
  // {
  //   id: 'gemini-2.5-flash-preview-04-17',
  //   name: 'Gemini 2.5 Flash',
  //   metadata: {
  //     provider: 'Google',
  //     developer: 'Google',
  //     shortDescription: "Google's latest fast model",
  //     fullDescription:
  //       "Google's latest fast model, known for speed and accuracy (and also web search!). Not quite as smart as Claude 3.5 Sonnet, but WAY faster and cheaper. Also has an insanely large context window (it can handle a lot of data).",
  //     disabled: false,
  //     modelPickerDefault: true,
  //     limits: { maxInputTokens: 1000000, maxOutputTokens: 65535 },
  //     streamChunking: 'word',
  //     features: ['images', 'pdfs', 'search'],
  //     experimental: false,
  //     apiKeySupport: 'optional',
  //   },
  // },
  {
    id: "deepseek/deepseek-r1-0528:free",
    name: "DeepSeek R1 0528",
    metadata: {
      provider: "OpenRouter",
      developer: "DeepSeek",
      shortDescription:
        "DeepSeek's reasoning model, routed to the fastest available provider",
      fullDescription:
        "The open source reasoning model that shook the whole industry. Very smart. Shows all of its thinking. Not the fastest.",
      disabled: false,
      experimental: false,
      features: ["parameters", "reasoning"],
      limits: { maxInputTokens: 128000, maxOutputTokens: 16384 },
      modelPickerDefault: false,
      streamChunking: "line",
      apiKeySupport: "required",
    },
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek v3 (0324)",
    metadata: {
      provider: "OpenRouter",
      developer: "DeepSeek",
      shortDescription: "Latest update to DeepSeek's chat model",
      fullDescription:
        "DeepSeek V3, a 685B-parameter, mixture-of-experts model, is the latest iteration of the flagship chat model family from the DeepSeek team. It succeeds the DeepSeek V3 model and performs really well on a variety of tasks.",

      disabled: false,
      modelPickerDefault: false,
      limits: { maxInputTokens: 64000, maxOutputTokens: 16384 },
      features: ["parameters"],
      experimental: true,
    },
  },
];
