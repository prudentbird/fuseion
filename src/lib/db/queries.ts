import "server-only";
import { Logger } from "../logger";
import { ChatSDKError } from "../errors";
import { getErrorMessage } from "../utils";
import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

const logger = new Logger("db/queries");

export const queries = {
  getDailyMessageCountByUserId: async (userId: string) => {
    try {
      return await fetchQuery(api.messages.getMessageCountByUserId, {
        userId,
        differenceInHours: 24,
      });
    } catch (error) {
      logger.error(
        "Error fetching daily message count:",
        getErrorMessage(error),
      );
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to get daily message count by user ID",
      );
    }
  },

  getMonthlyMessageCountByUserId: async (userId: string) => {
    try {
      return await fetchQuery(api.messages.getMessageCountByUserId, {
        userId,
        differenceInHours: 720,
      });
    } catch (error) {
      logger.error(
        "Error fetching monthly message count:",
        getErrorMessage(error),
      );
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to get monthly message count by user ID",
      );
    }
  },

  getUserCredits: async (userId: string) => {
    try {
      return await fetchQuery(api.users.getUserCredits, { userId });
    } catch (error) {
      logger.error("Error fetching user credits:", getErrorMessage(error));
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to get user credits",
      );
    }
  },

  getThreadByUserIdAndThreadId: async (userId: string, threadId: string) => {
    try {
      return await fetchQuery(api.threads.getThreadByUserIdAndThreadId, {
        userId,
        threadId,
      });
    } catch (error) {
      logger.error(
        "Error fetching thread by user ID and thread ID:",
        getErrorMessage(error),
      );
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to get thread by user ID and thread ID",
      );
    }
  },

  listMessagesByThreadId: async (threadId: string) => {
    try {
      return await fetchQuery(api.messages.listMessages, { threadId });
    } catch (error) {
      logger.error(
        "Error listing messages by thread ID:",
        getErrorMessage(error),
      );
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to list messages by thread ID",
      );
    }
  },

  listStreamsByThreadId: async (threadId: string) => {
    try {
      return await fetchQuery(api.streams.listStreamsByThreadId, { threadId });
    } catch (error) {
      logger.error(
        "Error listing streams by thread ID:",
        getErrorMessage(error),
      );
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to list streams by thread ID",
      );
    }
  },
};
