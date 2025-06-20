import { cors } from "./cors";
import { streamChat } from "./messages";
import { httpRouter } from "convex/server";

const http = httpRouter();

http.route({
  path: "/api/chat/stream",
  method: "POST",
  handler: streamChat,
});

http.route({
  path: "/api/chat/stream",
  method: "OPTIONS",
  handler: cors,
});

export default http;
