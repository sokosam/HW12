"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

interface TransitionConfig {
  duration: number;
  easing: string;
  showLoadingIndicator: boolean;
  loadingThreshold: number;
}

interface TransitionContextValue extends TransitionConfig {
  isTransitioning: boolean;
  supportsViewTransitions: boolean;
  setIsTransitioning: (value: boolean) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useTransition must be used within TransitionProvider");
  }
  return context;
}

interface TransitionProviderProps {
  children: ReactNode;
  duration?: number;
  easing?: string;
  showLoadingIndicator?: boolean;
  loadingThreshold?: number;
}

export function TransitionProvider({
  children,
  duration = 350,
  easing = "ease-in-out",
  showLoadingIndicator = true,
  loadingThreshold = 150,
}: TransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [supportsViewTransitions, setSupportsViewTransitions] = useState(false);
  const pathname = usePathname();

  // Check for View Transitions API support
  useEffect(() => {
    if (typeof document !== "undefined") {
      setSupportsViewTransitions("startViewTransition" in document);
    }
  }, []);

  // Reset transition state when route changes
  useEffect(() => {
    setIsTransitioning(false);
  }, [pathname]);

  const value: TransitionContextValue = {
    duration,
    easing,
    showLoadingIndicator,
    loadingThreshold,
    isTransitioning,
    supportsViewTransitions,
    setIsTransitioning,
  };

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}
