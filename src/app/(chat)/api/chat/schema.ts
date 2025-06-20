import { z } from "zod/v4";

const stepStartPartSchema = z.object({
  type: z.literal("step-start"),
});

const textPartSchema = z.object({
  type: z.enum(["text", "reasoning"]),
  text: z.string(),
});

const partSchema = z.union([stepStartPartSchema, textPartSchema]);

const modelMetadataSchema = z.object({
  shortDescription: z.string(),
  fullDescription: z.string(),
  provider: z.string(),
  developer: z.string(),
  type: z.string().optional(),
  apiKeySupport: z.enum(["optional", "required", "none"]).optional(),
  disabled: z.boolean(),
  experimental: z.boolean(),
  features: z.array(z.string()),
  streamChunking: z.enum(["word", "line"]).optional(),
  limits: z.object({
    maxInputTokens: z.number(),
    maxOutputTokens: z.number(),
  }),
  modelPickerDefault: z.boolean().optional(),
});

const modelSchema = z.object({
  id: z.string(),
  name: z.string(),
  metadata: modelMetadataSchema,
});

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  parts: z.array(partSchema),
  metadata: z
    .object({
      model: modelSchema.optional(),
      threadId: z.string().optional(),
      streamId: z.string().optional(),
      status: z.enum(["submitted", "streaming", "ready", "error"]).optional(),
    })
    .optional(),
});

export const postRequestBodySchema = z.object({
  messages: z.array(uiMessageSchema),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
