import { queries } from "~/lib/db";
import { auth } from "~/app/(auth)/auth";
import type { ChatMessage } from "~/types";
import { ChatSDKError } from "~/lib/errors";
import { getStreamContext } from "../../route";
import { differenceInSeconds } from "date-fns";
import { createUIMessageStream, JsonToSseTransformStream } from "ai";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: threadId } = await params;

  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  if (!threadId) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user || !session.user.id) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  // const thread = await queries.getThreadByUserIdAndThreadId(
  //     session.user.id,
  //     threadId,
  // );

  // if (!thread) {
  //   return new ChatSDKError("not_found:chat").toResponse();
  // }

  const streamIds = await queries.listStreamsByThreadId(threadId);

  if (!streamIds.length) {
    return new ChatSDKError("not_found:stream").toResponse();
  }

  const recentStreamId = streamIds.at(-1)?.id;

  if (!recentStreamId) {
    return new ChatSDKError("not_found:stream").toResponse();
  }

  const emptyDataStream = createUIMessageStream<ChatMessage>({
    execute: () => {},
  });

  const stream = await streamContext.resumableStream(recentStreamId, () =>
    emptyDataStream.pipeThrough(new JsonToSseTransformStream()),
  );

  /*
   * For when the generation is streaming during SSR
   * but the resumable stream has concluded at this point.
   */
  if (!stream) {
    const messages = await queries.listMessagesByThreadId(threadId);
    const mostRecentMessage = messages.at(-1);

    if (!mostRecentMessage) {
      return new Response(emptyDataStream, { status: 200 });
    }

    if (mostRecentMessage.role !== "assistant") {
      return new Response(emptyDataStream, { status: 200 });
    }

    const messageCreatedAt = new Date(mostRecentMessage.createdAt);

    if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
      return new Response(emptyDataStream, { status: 200 });
    }

    const restoredStream = createUIMessageStream<ChatMessage>({
      execute: ({ writer }) => {
        writer.write({
          type: "data-appendMessage",
          data: JSON.stringify(mostRecentMessage),
          transient: true,
        });
      },
    });

    return new Response(
      restoredStream.pipeThrough(new JsonToSseTransformStream()),
      { status: 200 },
    );
  }

  return new Response(stream, { status: 200 });
}
