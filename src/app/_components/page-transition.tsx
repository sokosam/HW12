"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTransition } from "./transition-provider";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  const { duration, isTransitioning, showLoadingIndicator, loadingThreshold } =
    useTransition();
  const [isVisible, setIsVisible] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // Fade in when component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show loading indicator if transition takes too long
    if (isTransitioning && showLoadingIndicator) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, loadingThreshold);

      return () => {
        clearTimeout(timer);
        setShowLoading(false);
      };
    } else {
      setShowLoading(false);
    }
  }, [isTransitioning, showLoadingIndicator, loadingThreshold]);

  return (
    <>
      {/* Loading indicator overlay */}
      {showLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1117]/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="loading-spinner h-10 w-10 rounded-full border-4 border-[#30363d] border-t-[#58a6ff]" />
            <p className="text-sm text-[#8b949e]">Loading...</p>
          </div>
        </div>
      )}

      {/* Page content with fade animation */}
      <div
        className={`page-transition-enter flex flex-1 ${className}`}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: `opacity ${duration}ms ease-in-out`,
        }}
      >
        {children}
      </div>
    </>
  );
}
