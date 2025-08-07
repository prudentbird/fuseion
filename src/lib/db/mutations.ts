import "server-only";
import { Logger } from "../logger";
import { ChatSDKError } from "../errors";
import { getErrorMessage } from "../utils";
import { api } from "~/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { Doc } from "~/convex/_generated/dataModel";
import { WithoutSystemFields } from "convex/server";

const logger = new Logger("db/mutations");

export const mutations = {
  updateUserCredits: async (userId: string, credits: number) => {
    try {
      return await fetchMutation(api.users.updateUserCredits, {
        userId,
        credits,
      });
    } catch (error) {
      logger.error("Error updating user credits:", getErrorMessage(error));
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to update user credits",
      );
    }
  },

  createThread: async (
    thread: Omit<
      WithoutSystemFields<Doc<"threads">>,
      "createdAt" | "updatedAt"
    >,
  ) => {
    try {
      return await fetchMutation(api.threads.createThread, thread);
    } catch (error) {
      logger.error("Error creating thread:", getErrorMessage(error));
      throw new ChatSDKError("bad_request:database", "Failed to create thread");
    }
  },

  createMessage: async (
    message: Omit<
      WithoutSystemFields<Doc<"messages">>,
      "createdAt" | "updatedAt"
    >,
  ) => {
    try {
      return await fetchMutation(api.messages.addMessage, message);
    } catch (error) {
      logger.error("Error creating message:", getErrorMessage(error));
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to create message",
      );
    }
  },

  createStream: async (
    stream: Omit<
      WithoutSystemFields<Doc<"streams">>,
      "createdAt" | "updatedAt"
    >,
  ) => {
    try {
      return await fetchMutation(api.streams.createStream, stream);
    } catch (error) {
      logger.error("Error creating stream:", getErrorMessage(error));
      throw new ChatSDKError("bad_request:database", "Failed to create stream");
    }
  },

  updateThreadWithId: async (
    thread: { id: string } & Partial<
      Omit<
        WithoutSystemFields<Doc<"threads">>,
        "createdAt" | "updatedAt" | "id"
      >
    >,
  ) => {
    try {
      return await fetchMutation(
        api.threads.updateThreadWithExternalId,
        thread,
      );
    } catch (error) {
      logger.error("Error updating thread with ID:", getErrorMessage(error));
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to update thread with ID",
      );
    }
  },
};
