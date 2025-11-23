"use client";

import { useEffect, useRef, useState } from "react";

export function useDataUpdates(onUpdate: () => void) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onUpdateRef = useRef(onUpdate);

  // Keep the latest callback reference
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    console.log("Initializing SSE connection...");
    // Create EventSource connection
    const eventSource = new EventSource("/api/events");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("✅ SSE connection established");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      console.log("📨 SSE message received:", event.data);
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          console.log("Connected to SSE server");
        } else if (data.type === "data-update") {
          console.log("🔄 Data update received, triggering refresh:", data);
          onUpdateRef.current();
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("❌ SSE connection error:", error);
      setIsConnected(false);
      eventSource.close();

      // Reconnect after 5 seconds
      setTimeout(() => {
        console.log("🔄 Attempting to reconnect...");
        const newEventSource = new EventSource("/api/events");
        eventSourceRef.current = newEventSource;
      }, 5000);
    };

    // Cleanup on unmount
    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, []); // Only run once on mount

  return { isConnected };
}
