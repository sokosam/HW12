"use client";

import { useState, useMemo } from "react";
import { mockTimelineEvents, type TimelineEvent } from "~/lib/mock-data";

export default function TimelinePage() {
  // INTEGRATION: Replace with tRPC call
  // const { data: events } = api.timeline.getAll.useQuery();
  const [events] = useState<TimelineEvent[]>(mockTimelineEvents);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date(),
  });

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, TimelineEvent[]>();
    events.forEach((event) => {
      const dateKey = event.timestamp.toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });
    return grouped;
  }, [events]);

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

  // Get all unique dates for scrubbing
  const allDates = useMemo(() => {
    const dates = Array.from(eventsByDate.keys())
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());
    return dates;
  }, [eventsByDate]);

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "error":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f85149]/30 bg-gradient-to-br from-[#f85149]/20 to-[#da3633]/20">
            <svg
              className="h-4 w-4 text-[#f85149]"
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#58a6ff]/30 bg-gradient-to-br from-[#58a6ff]/20 to-[#bc8cff]/20">
            <svg
              className="h-4 w-4 text-[#58a6ff]"
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#3fb950]/30 bg-gradient-to-br from-[#3fb950]/20 to-[#2ea043]/20">
            <svg
              className="h-4 w-4 text-[#3fb950]"
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#30363d] bg-[#30363d]">
            <svg
              className="h-4 w-4 text-[#c9d1d9]"
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#f0f6fc]">Timeline</h1>
        {/* INTEGRATION: Replace with tRPC subscription for real-time updates */}
        <button
          onClick={() => {
            // Real-time updates would come from tRPC subscription
            alert(
              "Timeline updates automatically - INTEGRATION: Add tRPC subscription",
            );
          }}
          className="rounded-lg bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
        >
          Refresh
        </button>
      </div>

      {/* Time Range Scrubber */}
      <div className="card p-6">
        <h2 className="mb-4 text-sm font-medium text-[#f0f6fc]">Time Range</h2>
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

      {/* Date Scrubber */}
      <div className="card p-6">
        <h2 className="mb-4 text-sm font-medium text-[#f0f6fc]">
          Jump to Date
        </h2>
        <div className="flex flex-wrap gap-2">
          {allDates.slice(0, 10).map((date) => {
            const dateStr = date.toDateString();
            const isSelected = selectedDate?.toDateString() === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => {
                  setSelectedDate(date);
                  setTimeRange({
                    start: new Date(date.setHours(0, 0, 0, 0)),
                    end: new Date(date.setHours(23, 59, 59, 999)),
                  });
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] text-white shadow-lg shadow-blue-500/20"
                    : "border border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
                }`}
              >
                {date.toLocaleDateString()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Events */}
      <div className="space-y-6">
        {Array.from(eventsByDate.entries())
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([dateStr, dayEvents]) => {
            const date = new Date(dateStr);
            const dayFilteredEvents = dayEvents.filter((event) =>
              filteredEvents.includes(event),
            );

            if (dayFilteredEvents.length === 0) return null;

            return (
              <div key={dateStr} className="card">
                <div className="border-b border-[#30363d] px-6 py-4">
                  <h2 className="text-lg font-semibold text-[#f0f6fc]">
                    {date.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                </div>
                <div className="divide-y divide-[#30363d]">
                  {dayFilteredEvents
                    .sort(
                      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
                    )
                    .map((event) => (
                      <div key={event.id} className="px-6 py-4">
                        <div className="flex items-start space-x-4">
                          {getEventIcon(event.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-[#f0f6fc]">
                                {event.title}
                              </p>
                              <span className="text-xs text-[#8b949e]">
                                {event.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-[#c9d1d9]">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-[#8b949e]">
            No events found in the selected time range
          </p>
        </div>
      )}
    </div>
  );
}
