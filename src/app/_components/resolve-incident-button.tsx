"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResolveIncidentButton({ incidentId }: { incidentId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResolve = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/error/${incidentId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to resolve incident");
      }

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      console.error("Error resolving incident:", error);
      alert("Failed to resolve incident. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleResolve}
      disabled={isLoading}
      className="rounded-lg bg-gradient-to-r from-[#3fb950] to-[#2ea043] px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Resolving..." : "Mark Resolved"}
    </button>
  );
}

