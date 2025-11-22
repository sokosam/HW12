"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageTransition } from "./_components/page-transition";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setIsRedirecting(true);
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking auth or redirecting
  if (!isLoaded || isRedirecting) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[hsl(280,100%,70%)] border-t-transparent"></div>
          <p className="text-lg text-white/70">
            {isRedirecting ? "Redirecting to dashboard..." : "Loading..."}
          </p>
        </div>
      </main>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <PageTransition>
      <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Sentric
          </h1>
          <p className="text-xl text-white/70">
            Incident Management Dashboard
          </p>
        </div>
      </main>
    </PageTransition>
  );
}
