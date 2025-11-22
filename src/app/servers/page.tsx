"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Server } from "~/lib/mock-data";
import { PageTransition } from "../_components/page-transition";

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/servers");
      if (!response.ok) throw new Error("Failed to fetch servers");

      const serversData = await response.json();
      setServers(serversData);
    } catch (err) {
      console.error("Error fetching servers:", err);
      setError(err instanceof Error ? err.message : "Failed to load servers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/servers/refresh", { method: "POST" });
      if (!response.ok) throw new Error("Failed to refresh servers");

      await fetchServers(); // Refresh the list
      alert("Servers refreshed successfully");
    } catch (err) {
      console.error("Error refreshing servers:", err);
      alert("Failed to refresh servers");
    }
  };

  const handleReset = async (serverId: string, serverName: string) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/reset`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reset server");

      await fetchServers(); // Refresh the list
      alert(`Server ${serverName} reset successfully`);
    } catch (err) {
      console.error("Error resetting server:", err);
      alert(`Failed to reset ${serverName}`);
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-[#8b949e]">Loading servers...</p>
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
        <div className="flex items-center justify-between pt-6">
          <h1 className="text-3xl font-bold text-[#f0f6fc]">Servers</h1>
          <button
            onClick={handleRefresh}
            className="rounded-lg bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
          >
            Refresh
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#30363d]">
              <thead className="bg-[#161b22]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-[#8b949e] uppercase">
                    Container Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-[#8b949e] uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-[#8b949e] uppercase">
                    CPU Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-[#8b949e] uppercase">
                    Memory Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-[#8b949e] uppercase">
                    Last Crash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-[#8b949e] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d] bg-[#161b22]">
                {servers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-[#8b949e]"
                    >
                      No servers found
                    </td>
                  </tr>
                ) : (
                  servers.map((server) => (
                    <tr
                      key={server.id}
                      className="transition-colors hover:bg-[#1f2937]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#f0f6fc]">
                          {server.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            server.status === "running"
                              ? "badge-success"
                              : server.status === "crashed"
                                ? "badge-error"
                                : "border border-[#30363d] bg-[#30363d] text-[#c9d1d9]"
                          }`}
                        >
                          {server.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#30363d]">
                              <div
                                className={`h-full transition-all ${
                                  server.cpu > 80
                                    ? "bg-gradient-to-r from-[#f85149] to-[#da3633]"
                                    : server.cpu > 60
                                      ? "bg-gradient-to-r from-[#d29922] to-[#bb8009]"
                                      : "bg-gradient-to-r from-[#3fb950] to-[#2ea043]"
                                }`}
                                style={{
                                  width: `${Math.min(server.cpu, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="ml-2 text-sm text-[#f0f6fc]">
                            {server.cpu.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#30363d]">
                              <div
                                className={`h-full transition-all ${
                                  server.memory > 80
                                    ? "bg-gradient-to-r from-[#f85149] to-[#da3633]"
                                    : server.memory > 60
                                      ? "bg-gradient-to-r from-[#d29922] to-[#bb8009]"
                                      : "bg-gradient-to-r from-[#3fb950] to-[#2ea043]"
                                }`}
                                style={{
                                  width: `${Math.min(server.memory, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="ml-2 text-sm text-[#f0f6fc]">
                            {server.memory.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-[#8b949e]">
                        {server.lastCrashTime
                          ? server.lastCrashTime.toLocaleString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleReset(server.id, server.name)}
                            className="text-[#58a6ff] transition-colors hover:text-[#79c0ff]"
                          >
                            Reset
                          </button>
                          <span className="text-[#30363d]">|</span>
                          <Link
                            href={`/servers/${server.id}/logs`}
                            className="text-[#58a6ff] transition-colors hover:text-[#79c0ff]"
                          >
                            View Logs
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
