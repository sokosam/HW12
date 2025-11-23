"use client";

import type { Incident } from "~/lib/mock-data";

type TimelineProps = {
  incidents: Incident[];
  /**
   * How many days back to show. Should match TrendGraph's days prop.
   * Default: 90
   */
  days?: number;
};

export function IncidentTimeline({ incidents, days = 90 }: TimelineProps) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const today = new Date();

  // Calculate the time range (same as TrendGraph)
  const oldestDate = new Date(today.getTime() - (days - 1) * MS_PER_DAY);
  const totalTimeRange = today.getTime() - oldestDate.getTime();

  // Sort incidents chronologically
  const sorted = [...incidents].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  // Calculate position percentage for each incident
  const incidentsWithPosition = sorted.map((incident) => {
    const incidentTime =
      incident.timestamp instanceof Date
        ? incident.timestamp
        : new Date(incident.timestamp);

    // Calculate how far into the time range this incident occurred (0-100%)
    const timeOffset = incidentTime.getTime() - oldestDate.getTime();
    const positionPercent = Math.max(
      0,
      Math.min(100, (timeOffset / totalTimeRange) * 100),
    );

    return {
      ...incident,
      positionPercent,
    };
  });

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold text-[#f0f6fc]">
        Incident Timeline
      </h2>

      <div className="relative h-20">
        {/* horizontal line */}
        <div className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-[#30363d]" />

        {/* markers - positioned absolutely based on timestamp */}
        <div className="relative h-full">
          {incidentsWithPosition.map((incident) => (
            <div
              key={incident.id}
              className="absolute flex -translate-x-1/2 flex-col items-center"
              style={{
                left: `${incident.positionPercent}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="h-4 w-px bg-[#30363d]" />
              <div
                className="mt-1 h-3 w-3 rounded-full border border-[#f85149] bg-[#da3633]"
                title={`${incident.serverName} - ${incident.timestamp instanceof Date ? incident.timestamp.toLocaleDateString() : new Date(incident.timestamp).toLocaleDateString()}${incident.resolved ? " (Resolved)" : " (Active)"}`}
              />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-[#8b949e]">
        Each marker represents an incident positioned by its timestamp over the
        last {days} days.
      </p>
    </div>
  );
}
