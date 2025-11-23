"use client";

import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";
import type { Server, Incident } from "~/lib/mock-data";
import { PageTransition } from "../_components/page-transition";
import { TrendGraph } from "~/app/_components/trend-graph";
import { IncidentTimeline } from "~/app/_components/incident-timeline";
import { mockServers, mockIncidents } from "~/lib/mock-data";

export default function DashboardPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch servers
        const serversRes = await fetch("/api/servers");
        if (!serversRes.ok) throw new Error("Failed to fetch servers");
        const serversData = await serversRes.json();
        setServers(serversData);

        // Fetch errors/incidents
        const errorsRes = await fetch("/api/error");
        if (!errorsRes.ok) throw new Error("Failed to fetch errors");
        const errorsData = await errorsRes.json();

        // Transform errors to incidents format
        const incidentsData: Incident[] = errorsData.map((incident: any) => ({
          id: incident.id.toString(),
          serverId: incident.serverId?.toString() ?? "unknown",
          serverName: incident.serverName ?? "Unknown server",
          timestamp: new Date(incident.timestamp),
          logs: incident.logs ?? "",
          aiSummary: incident.aiSummary ?? "",
          aiFix: incident.aiFix ?? "",
          resolved: incident.resolved ?? false,
        }));

        setIncidents(incidentsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeServers = servers.filter((s) => s.status === "running").length;
  const crashedServers = servers.filter((s) => s.status === "crashed").length;
  const unresolvedIncidents = incidents.filter((i) => !i.resolved).length;
  const errorsToday = incidents.filter(
    (i) => i.timestamp.getTime() > Date.now() - 86400000,
  ).length;

  const recentIncidents = incidents
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="mx-52 flex items-center justify-center py-12">
        <p className="text-[#8b949e]">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-52 flex items-center justify-center py-12">
        <p className="text-[#f85149]">Error: {error}</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-52 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#f0f6fc]">Dashboard</h1>
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/stress-test", {
                  method: "POST",
                });
                if (!response.ok)
                  throw new Error("Failed to trigger stress test");
                alert("Stress test triggered successfully");
              } catch (err) {
                console.error("Error triggering stress test:", err);
                alert("Failed to trigger stress test");
              }
            }}
            className="rounded-lg bg-gradient-to-r from-[#f85149] to-[#da3633] px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/20"
          >
            Run Stress Test
          </button>
        </div>
        <TrendGraph incidents={incidents} />

        {/* NEW: Timeline Section */}
        <IncidentTimeline incidents={incidents} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#58a6ff]/30 bg-gradient-to-br from-[#58a6ff]/20 to-[#bc8cff]/20">
                  <svg
                    className="h-6 w-6 text-[#58a6ff]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#8b949e]">
                  Active Servers
                </p>
                <p className="text-2xl font-semibold text-[#f0f6fc]">
                  {activeServers}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#f85149]/30 bg-gradient-to-br from-[#f85149]/20 to-[#da3633]/20">
                  <svg
                    className="h-6 w-6 text-[#f85149]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#8b949e]">
                  Crashed Servers
                </p>
                <p className="text-2xl font-semibold text-[#f0f6fc]">
                  {crashedServers}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#d29922]/30 bg-gradient-to-br from-[#d29922]/20 to-[#bb8009]/20">
                  <svg
                    className="h-6 w-6 text-[#d29922]"
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
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#8b949e]">
                  Unresolved Incidents
                </p>
                <p className="text-2xl font-semibold text-[#f0f6fc]">
                  {unresolvedIncidents}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#30363d] bg-gradient-to-br from-[#30363d]/50 to-[#21262d]/50">
                  <svg
                    className="h-6 w-6 text-[#c9d1d9]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#8b949e]">
                  Errors Today
                </p>
                <p className="text-2xl font-semibold text-[#f0f6fc]">
                  {errorsToday}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="card">
          <div className="border-b border-[#30363d] px-6 py-4">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">
              Recent Incidents
            </h2>
          </div>
          <div className="divide-y divide-[#30363d]">
            {recentIncidents.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#8b949e]">
                No incidents found
              </div>
            ) : (
              recentIncidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  className="block px-6 py-4 transition-colors hover:bg-[#1f2937]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-[#f0f6fc]">
                          {incident.serverName}
                        </p>
                        {!incident.resolved && (
                          <span className="badge-error inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                            Active
                          </span>
                        )}
                        {incident.resolved && (
                          <span className="badge-success inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[#c9d1d9]">
                        {incident.aiSummary}
                      </p>
                      <p className="mt-1 text-xs text-[#8b949e]">
                        {incident.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <svg
                      className="h-5 w-5 text-[#8b949e]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Active Servers Preview */}
        <div className="card">
          <div className="border-b border-[#30363d] px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#f0f6fc]">
                Active Servers
              </h2>
              <Link
                href="/servers"
                className="text-sm font-medium text-[#58a6ff] transition-colors hover:text-[#79c0ff]"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-[#30363d]">
            {servers.slice(0, 5).map((server) => (
              <div key={server.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-[#f0f6fc]">
                        {server.name}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          server.status === "running"
                            ? "badge-success"
                            : server.status === "crashed"
                              ? "badge-error"
                              : "border border-[#30363d] bg-[#30363d] text-[#c9d1d9]"
                        }`}
                      >
                        {server.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-[#8b949e]">
                      <span>CPU: {server.cpu.toFixed(1)}%</span>
                      <span>Memory: {server.memory.toFixed(1)}%</span>
                    </div>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const response = await fetch(
                          `/api/servers/${server.id}/reset`,
                          {
                            method: "POST",
                          },
                        );
                        if (!response.ok)
                          throw new Error("Failed to reset server");
                        // Refresh servers list
                        const serversRes = await fetch("/api/servers");
                        const serversData = await serversRes.json();
                        setServers(serversData);
                      } catch (err) {
                        console.error("Error resetting server:", err);
                        alert(`Failed to reset ${server.name}`);
                      }
                    }}
                    className="rounded-lg bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] px-3 py-1.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
