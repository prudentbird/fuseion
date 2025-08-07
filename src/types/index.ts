import { z } from "zod";
import type { UIMessage, UIMessagePart, UITools } from "ai";

const modelSchema = z.object({
  id: z.string(),
  name: z.string(),
  metadata: z.object({
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
  }),
});

export const messageMetadataSchema = z.object({
  model: modelSchema,
  threadId: z.string(),
  createdAt: z.string(),
});

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  appendMessage: string;
  id: string;
  title: string;
  clear: null;
  finish: null;
};
export type DataPart = { type: "append-message"; message: string };

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type MessagePart = UIMessagePart<CustomUIDataTypes, UITools>;

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  UITools
>;

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}
