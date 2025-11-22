"use client";

import { useState, useMemo, useEffect } from "react";
import { type TimelineEvent } from "~/lib/mock-data";
import { PageTransition } from "../_components/page-transition";

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date(),
  });

  const fetchTimeline = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/timeline");
      if (!response.ok) throw new Error("Failed to fetch timeline");

      const timelineData = await response.json();

      // Transform API data to TimelineEvent format
      const transformedEvents: TimelineEvent[] = timelineData.map((event: any) => ({
        id: event.id,
        timestamp: new Date(event.timestamp),
        title: event.title,
        description: event.description,
        type: event.type as "error" | "deployment" | "incident",
      }));

      setEvents(transformedEvents);
    } catch (err) {
      console.error("Error fetching timeline:", err);
      setError(err instanceof Error ? err.message : "Failed to load timeline");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  // Filter events by time range
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventTime = event.timestamp.getTime();
      return (
        eventTime >= timeRange.start.getTime() &&
        eventTime <= timeRange.end.getTime()
      );
    });
  }, [events, timeRange]);

  // Group events by date for the horizontal timeline
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, TimelineEvent[]>();
    filteredEvents.forEach((event) => {
      const dateKey = event.timestamp.toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });
    return grouped;
  }, [filteredEvents]);

  // Get all unique dates for scrubbing
  const allDates = useMemo(() => {
    const dates = Array.from(eventsByDate.keys())
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());
    return dates;
  }, [eventsByDate]);

  const handleRefresh = async () => {
    await fetchTimeline();
  };

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "error":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f85149]/50 bg-gradient-to-br from-[#f85149]/30 to-[#da3633]/30 shadow-lg">
            <svg
              className="h-5 w-5 text-[#f85149]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case "deployment":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#58a6ff]/50 bg-gradient-to-br from-[#58a6ff]/30 to-[#bc8cff]/30 shadow-lg">
            <svg
              className="h-5 w-5 text-[#58a6ff]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
        );
      case "incident":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#3fb950]/50 bg-gradient-to-br from-[#3fb950]/30 to-[#2ea043]/30 shadow-lg">
            <svg
              className="h-5 w-5 text-[#3fb950]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#30363d] bg-[#30363d] shadow-lg">
            <svg
              className="h-5 w-5 text-[#c9d1d9]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-[#8b949e]">Loading timeline...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-[#f85149]">Error: {error}</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#f0f6fc]">Timeline</h1>
          <button
            onClick={handleRefresh}
            className="rounded-lg bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
          >
            Refresh
          </button>
        </div>

        {/* Time Range Controls */}
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-medium text-[#f0f6fc]">
            Time Range
          </h2>
          <div className="flex items-center space-x-4">
            <input
              type="datetime-local"
              value={timeRange.start.toISOString().slice(0, 16)}
              onChange={(e) =>
                setTimeRange({ ...timeRange, start: new Date(e.target.value) })
              }
              className="rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#f0f6fc] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] focus:outline-none"
            />
            <span className="text-[#8b949e]">to</span>
            <input
              type="datetime-local"
              value={timeRange.end.toISOString().slice(0, 16)}
              onChange={(e) =>
                setTimeRange({ ...timeRange, end: new Date(e.target.value) })
              }
              className="rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#f0f6fc] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] focus:outline-none"
            />
            <button
              onClick={() => {
                setTimeRange({
                  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  end: new Date(),
                });
                setSelectedDate(null);
              }}
              className="rounded-lg border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm font-medium text-[#c9d1d9] transition-colors hover:bg-[#30363d]"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Horizontal Timeline */}
        <div className="card p-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-[#58a6ff] via-[#bc8cff] to-[#3fb950] opacity-50"></div>

            {/* Timeline events */}
            <div className="space-y-8">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#8b949e]">
                    No events found in the selected time range
                  </p>
                </div>
              ) : (
                filteredEvents
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((event, index) => (
                    <div key={event.id} className="relative flex items-start space-x-6">
                      {/* Timeline node */}
                      <div className="relative z-10 flex-shrink-0">
                        {getEventIcon(event.type)}
                      </div>

                      {/* Event content */}
                      <div className="flex-1 min-w-0 pb-8">
                        <div className="group relative">
                          {/* Event card */}
                          <div className="card p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/10">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-sm font-semibold text-[#f0f6fc]">
                                    {event.title}
                                  </h3>
                                  <span className="text-xs text-[#8b949e]">
                                    {event.timestamp.toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-[#c9d1d9] line-clamp-2">
                                  {event.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Hover tooltip */}
                          <div className="absolute left-full top-0 ml-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl p-4 w-96 max-w-sm">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-[#f0f6fc] mb-1">
                                    {event.type === "error" ? "Error Message" : event.type === "deployment" ? "Deployment" : "Event"}
                                  </h4>
                                  <p className="text-xs text-[#c9d1d9] leading-relaxed">
                                    {event.description}
                                  </p>
                                </div>
                                <div className="pt-2 border-t border-[#30363d]">
                                  <div className="flex items-center justify-between text-xs text-[#8b949e]">
                                    <span>{event.timestamp.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              {/* Arrow pointing to the event */}
                              <div className="absolute right-full top-4 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-[#161b22]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
