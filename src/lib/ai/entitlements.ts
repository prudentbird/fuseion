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
      "gemini-3-flash-preview",
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
      "gemini-3.1-flash-lite-preview",
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
