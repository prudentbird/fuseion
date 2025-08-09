import type { Model } from "~/lib/ai/models";
import type { UserInterface } from "~/types/user";

interface Entitlements {
  maxMessagesPerDay: number;
  maxMessagesPerMonth: number;
  availableChatModelIds?: Array<Model["id"]>;
}

export const entitlementsByUserTier: Record<
  UserInterface["tier"],
  Entitlements
> = {
  /*
   * For users with a free account
   */
  free: {
    maxMessagesPerDay: 30,
    maxMessagesPerMonth: 900,
    availableChatModelIds: [
      "gemini-2.0-flash",
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
      "gemini-2.0-flash-lite",
      "moonshotai/kimi-k2-instruct",
      "deepseek-r1-distill-llama-70b",
      "deepseek/deepseek-chat-v3-0324:free",
    ],
  },

  /*
   * For users with a pro account
   */
  pro: {
    maxMessagesPerDay: 100,
    maxMessagesPerMonth: 1500,
  },
};
