import { z } from "zod/v4";

const textPartSchema = z.object({
  type: z.enum(["text"]),
  text: z.string().min(1).max(2000),
});

const filePartSchema = z.object({
  type: z.enum(["file"]),
  mediaType: z.enum(["image/jpeg", "image/png"]),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

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

export const postRequestBodySchema = z.object({
  id: z.uuid(),
  message: z.object({
    id: z.uuid(),
    role: z.enum(["user"]),
    parts: z.array(partSchema),
  }),
  model: modelSchema,
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
