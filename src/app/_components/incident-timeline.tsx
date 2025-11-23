"use client";

import * as React from "react";
import type { Incident } from "~/lib/mock-data";

type IncidentTimelineProps = {
  incidents: Incident[];
};

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  const [selectedIncident, setSelectedIncident] =
    React.useState<Incident | null>(null);

  // Group incidents by calendar day (only days that actually have incidents)
  const daysWithIncidents = React.useMemo(() => {
    const map = new Map<string, { date: Date; incidents: Incident[] }>();

    for (const incident of incidents) {
      const d = new Date(incident.timestamp);
      d.setHours(0, 0, 0, 0);
      const key = dayKey(d);

      if (!map.has(key)) {
        map.set(key, { date: d, incidents: [incident] });
      } else {
        map.get(key)!.incidents.push(incident);
      }
    }

    // sort days chronologically
    return Array.from(map.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }, [incidents]);

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold text-[#f0f6fc]">
        Incident Timeline
      </h2>

      {/* compact timeline, similar height to original */}
      <div className="relative h-24">
        {/* single horizontal axis */}
        <div className="absolute left-4 right-4 top-4 h-px bg-[#30363d]" />

        {/* each day with incidents gets a stem + dots, spaced evenly */}
        <div className="relative flex h-full items-start justify-between px-4">
          {daysWithIncidents.map(({ date, incidents: dayIncidents }) => (
            <div
              key={dayKey(date)}
              className="flex flex-col items-center text-xs"
            >
              {/* hanging stem + dots */}
              <div className="mt-4 flex flex-col items-center">
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
              </div>

              {/* date label under stem */}
              <span className="mt-2 text-[11px] text-[#8b949e]">
                {formatDayLabel(date)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-[#8b949e]">
        Each vertical line represents a day with incidents; each red dot is a
        single incident on that day.
      </p>

      {/* details panel when a dot is clicked */}
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

function formatDayLabel(d: Date): string {
  // e.g. "11/22"
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
