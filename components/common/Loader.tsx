"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

// ── Inline Section / Component Spinner ─────────────────────────────────────
interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  text,
  className = "",
}) => {
  const sizeMap = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-[5px]",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-4 select-none ${className}`}
      role="status"
      aria-label={text || "Loading"}
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-[#FFBF00]/20 blur-md animate-pulse" />

        {/* Spinning Ring */}
        <div
          className={`${sizeMap[size]} rounded-full border-white/10 border-t-[#FFBF00] border-r-[#E52320] animate-spin`}
          style={{ animationDuration: "0.85s" }}
        />
      </div>

      {text && (
        <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase font-sans">
          {text}
        </span>
      )}
    </div>
  );
};

// ── Global Preloader & Route Transition Bar ────────────────────────────────
export const GlobalLoader: React.FC = () => {
  const pathname = usePathname();

  // Initial Fullscreen Preloader States
  const [initialLoading, setInitialLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Route Transition Progress Bar States
  const [isRouteNavigating, setIsRouteNavigating] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // 1. Initial Page Load Animation
  useEffect(() => {
    let currentPct = 0;
    let timer: ReturnType<typeof setInterval>;
    let isComplete = false;

    const onWindowLoad = () => {
      isComplete = true;
    };

    if (document.readyState === "complete") {
      isComplete = true;
    } else {
      window.addEventListener("load", onWindowLoad, { once: true });
    }

    timer = setInterval(() => {
      if (!isComplete) {
        // Increment steadily up to 88% while waiting for window load
        if (currentPct < 88) {
          const step = Math.max(1, Math.floor((90 - currentPct) / 8));
          currentPct = Math.min(88, currentPct + step);
          setProgress(currentPct);
        }
      } else {
        // Accelerate to 100% once ready
        currentPct += 12;
        if (currentPct >= 100) {
          currentPct = 100;
          setProgress(100);
          clearInterval(timer);

          // Graceful fadeout sequence
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
              setInitialLoading(false);
            }, 700);
          }, 200);
        } else {
          setProgress(currentPct);
        }
      }
    }, 30);

    // Failsafe timeout so the user is never stuck
    const fallback = setTimeout(() => {
      setProgress(100);
      setIsExiting(true);
      setTimeout(() => {
        setInitialLoading(false);
      }, 700);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearTimeout(fallback);
      window.removeEventListener("load", onWindowLoad);
    };
  }, []);

  // 2. Route Transition Listener
  useEffect(() => {
    if (pathname !== prevPathname) {
      setPrevPathname(pathname);
      setIsRouteNavigating(true);
      setRouteProgress(20);

      const t1 = setTimeout(() => setRouteProgress(65), 100);
      const t2 = setTimeout(() => setRouteProgress(100), 280);
      const t3 = setTimeout(() => {
        setIsRouteNavigating(false);
        setRouteProgress(0);
      }, 550);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [pathname, prevPathname]);

  return (
    <>
      {/* ── Top Navigation Bar (Route Transition) ── */}
      {isRouteNavigating && (
        <div
          className="fixed top-0 left-0 right-0 h-[3px] z-[999999] pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full bg-gradient-to-r from-[#E52320] via-[#FFBF00] to-[#0066FF] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(255,191,0,0.8)]"
            style={{
              width: `${routeProgress}%`,
              opacity: routeProgress === 100 ? 0 : 1,
            }}
          />
        </div>
      )}

      {/* ── Initial Fullscreen Preloader ── */}
      {initialLoading && (
        <div
          className={`fixed inset-0 z-[9999999] flex flex-col items-center justify-center bg-[#0b0d14] select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExiting
              ? "opacity-0 scale-[1.03] blur-sm pointer-events-none"
              : "opacity-100 scale-100"
            }`}
          style={{ willChange: "transform, opacity, filter" }}
        >
          {/* Ambient Background Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-gradient-to-tr from-[#E52320]/15 via-[#FFBF00]/15 to-[#0066FF]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
            {/* Logo Container */}
            <div className="relative w-44 sm:w-52 h-14 sm:h-16 mb-6">
              <Image
                src="/cfc_logo.svg"
                alt="CFOCO"
                fill
                priority
                className="object-contain drop-shadow-[0_4px_24px_rgba(255,191,0,0.35)]"
              />
            </div>

            {/* Tagline */}
            <div className="mb-8">
              <span className="text-[11px] sm:text-xs font-extrabold tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FFBF00] via-amber-100 to-[#E52320]">
                Crispy Since 2011
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-48 sm:w-56 h-[3px] bg-white/10 rounded-full overflow-hidden relative mb-3 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#E52320] via-[#FFBF00] to-[#0066FF] rounded-full transition-all duration-150 ease-out shadow-[0_0_10px_rgba(255,191,0,0.7)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Percentage Indicator */}
            <span className="text-[11px] font-mono font-medium tracking-wider text-neutral-400">
              {progress}%
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalLoader;
