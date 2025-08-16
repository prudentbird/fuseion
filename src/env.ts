import { z } from "zod/v4";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["local", "test", "development", "staging", "production"])
      .default("development"),
    REDIS_URL: z.string(),
    ARCJET_KEY: z.string(),
    AUTH_SECRET: z.string(),
    GROQ_API_KEY: z.string(),
    OPENAI_API_KEY: z.string(),
    CONVEX_DEPLOYMENT: z.string(),
    OPENROUTER_API_KEY: z.string(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.url(),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
