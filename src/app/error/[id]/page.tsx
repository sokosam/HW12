"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { ResolveIncidentButton } from "~/app/_components/resolve-incident-button";
import { PageTransition } from "~/app/_components/page-transition";
import type { Incident } from "~/lib/mock-data";

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/error/${resolvedParams.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error("Failed to fetch incident");
        }

        const errorData = await response.json();

        // Transform API data to Incident interface
        const transformedIncident: Incident = {
          id: errorData.id?.toString() ?? "unknown",
          serverId: errorData.containerId?.toString() ?? "unknown",
          serverName: errorData.serviceName ?? "Unknown server",
          timestamp: new Date(errorData.occurredAt),
          logs: errorData.errorMessage ?? "",
          aiSummary: errorData.explaination ?? "",
          aiFix: errorData.suggestedFix ?? "",
          resolved: false, // Schema doesn't have resolved field yet
        };

        setIncident(transformedIncident);
      } catch (err) {
        console.error("Error fetching incident:", err);
        setError(err instanceof Error ? err.message : "Failed to load incident");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncident();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <div className="fixed inset-0 -z-10 gradient-bg opacity-50" />
        <PageTransition>
          <div className="w-full px-4 pt-6 pb-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <p className="text-[#8b949e]">Loading incident...</p>
            </div>
          </div>
        </PageTransition>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <div className="fixed inset-0 -z-10 gradient-bg opacity-50" />
        <PageTransition>
          <div className="w-full px-4 pt-6 pb-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <p className="text-[#f85149]">Error: {error}</p>
            </div>
          </div>
        </PageTransition>
      </div>
    );
  }

  if (!incident) {
    notFound();
  }
  
  return (
    <div className="min-h-screen w-full bg-[#0d1117]">
      <div className="fixed inset-0 -z-10 gradient-bg opacity-50" />
      <PageTransition>
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between pt-6">
            <div>
              <h1 className="text-3xl font-bold text-[#f0f6fc]">
                Incident Details
              </h1>
              <p className="mt-1 text-sm text-[#8b949e]">
                {incident.serverName} • {incident.timestamp.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {incident.resolved ? (
                <span className="badge-success inline-flex items-center rounded-full px-3 py-1 text-sm font-medium">
                  Resolved
                </span>
              ) : (
                <span className="badge-error inline-flex items-center rounded-full px-3 py-1 text-sm font-medium">
                  Active
                </span>
              )}
              {!incident.resolved && (
                <ResolveIncidentButton incidentId={incident.id} />
              )}
            </div>
          </div>

          {/* AI Summary */}
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#f0f6fc]">
              AI Summary
            </h2>
            <p className="text-sm leading-relaxed text-[#c9d1d9]">
              {incident.aiSummary}
            </p>
          </div>

          {/* Suggested Fix */}
          <div className="rounded-lg border border-[#58a6ff]/30 bg-gradient-to-br from-[#58a6ff]/10 to-[#bc8cff]/10 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#58a6ff]">
              Suggested Fix
            </h2>
            <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap text-[#c9d1d9]">
                {incident.aiFix}
              </pre>
            </div>
          </div>

          {/* Raw Logs */}
          <div className="card">
            <div className="border-b border-[#30363d] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#f0f6fc]">Raw Logs</h2>
            </div>
            <div className="px-6 py-4">
              <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0a0d14] p-4">
                <pre className="font-mono text-xs whitespace-pre text-[#c9d1d9]">
                  {incident.logs}
                </pre>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card flex items-center justify-between p-6">
            <div>
              <h3 className="text-sm font-medium text-[#f0f6fc]">
                Related Deployment
              </h3>
              <p className="mt-1 text-sm text-[#8b949e]">
                View deployment history for this server
              </p>
            </div>
            {/* INTEGRATION: Replace with actual link */}
            <button
              onClick={() => {
                // INTEGRATION: Navigate to deployment page
                alert(
                  "View related deployment - INTEGRATION: Add deployment page",
                );
              }}
              className="rounded-lg border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm font-medium text-[#c9d1d9] transition-colors hover:bg-[#30363d]"
            >
              View Deployment
            </button>
          </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
