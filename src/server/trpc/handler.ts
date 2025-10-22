import { defineEventHandler, toWebRequest } from "@tanstack/react-start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./root";
import { validateRequiredEnv } from "../env";

// Validate environment variables on startup
try {
  validateRequiredEnv();
} catch (error) {
  console.error("Environment validation failed:", error);
  // Don't throw here to allow graceful degradation
}

export default defineEventHandler((event) => {
  const request = toWebRequest(event);
  if (!request) {
    return new Response("No request", { status: 400 });
  }

  return fetchRequestHandler({
    endpoint: "/trpc",
    req: request,
    router: appRouter,
    createContext() {
      return {};
    },
    onError({ error, path }) {
      console.error(`tRPC error on '${path}':`, error);
    },
  });
});
