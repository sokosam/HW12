"use client";

import * as React from "react";
import type { Incident } from "~/lib/mock-data";

type IncidentTimelineProps = {
  incidents: Incident[];
  days?: number; // default 90, must match TrendGraph's window
};

export function IncidentTimeline({
  incidents,
  days = 90,
}: IncidentTimelineProps) {
  const [selectedIncident, setSelectedIncident] =
    React.useState<Incident | null>(null);

  // Build fixed window + bucket incidents by day
  const dayBuckets = React.useMemo(() => {
    const allDays = getLastNDays(days); // oldest → newest
    const map = groupIncidentsByDay(incidents);

    return allDays.map((date) => {
      const key = dayKey(date);
      return {
        date,
        incidents: map.get(key) ?? [],
      };
    });
  }, [incidents, days]);

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold text-[#f0f6fc]">
        Incident Timeline
      </h2>

      {/* main timeline – height kept small like your original */}
      <div className="relative h-24">
        {/* horizontal axis */}
        <div className="absolute left-4 right-4 top-4 h-px bg-[#30363d]" />

        {/* 90 equal columns – must match the graph's day layout */}
        <div
          className="relative flex h-full items-start px-4"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))`,
          }}
        >
          {dayBuckets.map(({ date, incidents: dayIncidents }) => {
            const hasIncidents = dayIncidents.length > 0;

            return (
              <div
                key={dayKey(date)}
                className="flex flex-col items-center text-[10px]"
              >
                {/* tiny tick on axis for every day (optional) */}
                <div className="h-3 w-px bg-[#30363d]" />

                {/* only show stem + dots when there are incidents */}
                {hasIncidents && (
                  <div className="mt-1 flex flex-col items-center">
                    <div className="relative h-16 w-px bg-[#30363d]">
                      <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center gap-3">
                        {dayIncidents.map((incident) => (
                          <button
                            key={incident.id}
                            type="button"
                            className="h-3 w-3 rounded-full border border-[#f85149] bg-[#da3633] shadow-sm hover:scale-110 focus:outline-none focus:ring-1 focus:ring-[#f85149]"
                            title={`${incident.serverName} – ${incident.timestamp.toLocaleString()}`}
                            onClick={() => setSelectedIncident(incident)}
                          />
                        ))}
                      </div>
                    </div>
                    {/* label only under days with incidents to avoid clutter */}
                    <span className="mt-1 text-[#8b949e]">
                      {formatDayLabel(date)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* details panel on dot click */}
      {selectedIncident && (
        <div className="mt-4 rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">
                {selectedIncident.serverName}
              </h3>
              <p className="text-xs text-[#8b949e]">
                {selectedIncident.timestamp.toLocaleString()}
              </p>
              <p className="mt-3 text-xs font-semibold text-[#c9d1d9]">
                Incident details
              </p>
              <p className="mt-1 text-xs text-[#c9d1d9]">
                {selectedIncident.aiSummary || "No AI summary available."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIncident(null)}
              className="text-xs text-[#8b949e] hover:text-[#f0f6fc]"
            >
              ✕
            </button>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-[#c9d1d9]">
              Suggested fix
            </p>
            <p className="mt-1 text-xs text-[#c9d1d9] whitespace-pre-line">
              {selectedIncident.aiFix || "No suggested fix available."}
            </p>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-[#c9d1d9]">Log snippet</p>
            <pre className="mt-1 max-h-32 overflow-auto rounded bg-[#010409] p-2 text-[10px] text-[#c9d1d9]">
              {selectedIncident.logs || "No logs available."}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/* helpers */

function dayKey(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function getLastNDays(n: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

function groupIncidentsByDay(incidents: Incident[]): Map<string, Incident[]> {
  const map = new Map<string, Incident[]>();

  for (const incident of incidents) {
    const d = new Date(incident.timestamp);
    d.setHours(0, 0, 0, 0);
    const key = dayKey(d);

    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(incident);
  }

  // keep per-day incidents in time order
  map.forEach((list) =>
    list.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  );

  return map;
}

function formatDayLabel(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
