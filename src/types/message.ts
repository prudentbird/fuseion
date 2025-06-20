import { Model } from "~/data/models";

export type Role = "user" | "system" | "assistant";

export interface MessageInterface {
  id: string;
  role: Role;
  streamId?: string;
  parts: string;
  metadata?: string;
  createdAt: number;
  updatedAt: number;
  threadId: string;
}
export type MessageStatus = "submitted" | "streaming" | "ready" | "error";

export interface MessageMetadata {
  model?: Model;
  threadId?: string;
  streamId?: string;
  status?: MessageStatus;
}
