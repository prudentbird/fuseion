"use client";

import { ChatMessage } from "~/types";
import { memo } from "react";
import { Model } from "~/lib/ai/models";
import type { Session } from "next-auth";
import ModelPicker from "./model-picker";
import type { UseChatHelpers } from "@ai-sdk/react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "~/components/ai-elements/prompt-input";

interface ChatInputProps {
  id: string;
  session: Session;
  selectedModel: Model;
  stop: UseChatHelpers<ChatMessage>["stop"];
  status: UseChatHelpers<ChatMessage>["status"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
}

const ChatInput = ({
  id,
  stop,
  status,
  session,
  sendMessage,
  selectedModel,
}: ChatInputProps) => {
  return (
    <div className="border-t bg-background/90 px-2 pb-2 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <PromptInput
          onSubmit={({ text }) => {
            window.history.replaceState({}, "", `/chat/${id}`);
            sendMessage({
              role: "user",
              parts: [{ type: "text", text }],
            });
          }}
        >
          <PromptInputBody className="rounded-[28px] border bg-card px-4 py-3 shadow-lg shadow-black/5">
            <PromptInputTextarea
              autoFocus
              id="chat-input"
              placeholder="Type your message here..."
            />
            <PromptInputFooter>
              <PromptInputTools className="flex-wrap">
                <ModelPicker session={session} selectedModel={selectedModel} />
                <span className="text-xs text-muted-foreground">
                  Shift + Enter for a new line
                </span>
              </PromptInputTools>
              <PromptInputSubmit
                className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                onStop={stop}
                status={status}
              />
            </PromptInputFooter>
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
};

export default memo(
  ChatInput,
  (prev, next) =>
    prev.id === next.id &&
    prev.status === next.status &&
    prev.session?.user?.tier === next.session?.user?.tier &&
    prev.selectedModel.id === next.selectedModel.id,
);
