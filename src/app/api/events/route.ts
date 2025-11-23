import { NextRequest } from "next/server";
import { dataUpdateEmitter } from "~/lib/websocket-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  console.log("SSE: New client connected");

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`),
      );
      console.log("SSE: Sent connected message to client");

      // Subscribe to data updates
      const unsubscribe = dataUpdateEmitter.subscribe(() => {
        console.log("SSE: Broadcasting data-update event to client");
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "data-update", timestamp: Date.now() })}\n\n`,
            ),
          );
        } catch (error) {
          console.error("SSE: Error sending update:", error);
        }
      });

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch (error) {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 30000); // Every 30 seconds

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        console.log("SSE: Client disconnected");
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
