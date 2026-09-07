"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { matter } from "@/font/fonts";

export interface Milestone {
  year: string;
  title: string;
  descLine1: string;
  descLine2: string;
}

export const defaultMilestones: Milestone[] = [
  {
    year: "2011",
    title: "The First Fry",
    descLine1: "One Kitchen In Bordeaux.",
    descLine2: "One Recipe Worth Arguing Over.",
  },
  {
    year: "2014",
    title: "Word Gets Out",
    descLine1: "Lines Out The Door. Turns Out We",
    descLine2: "Weren't The Ones Tired Of Average.",
  },
  {
    year: "2018",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
];

interface ObsessionProps {
  items?: Milestone[];
}

const MOBILE_CYCLE_DURATION = 4000; // 4 seconds total (1s enter, 2s pause & glow, 1s exit)

const Obsession: React.FC<ObsessionProps> = ({ items }) => {
  const milestones = items && items.length > 0 ? items : defaultMilestones;
  const N = milestones.length;

  // 2 seconds pause & glow at each node, 1 second travel between nodes
  const travelTimeSec = 1.0;
  const pauseTimeSec = 1;
  const desktopDurationSec = (N + 1) * travelTimeSec + N * pauseTimeSec;

  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  // Auto-advance mobile milestone in sync with mobile laser loop
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMobileIndex((prev) => (prev + 1) % milestones.length);
    }, MOBILE_CYCLE_DURATION);

    return () => clearInterval(timer);
  }, [milestones.length]);

  const currentMobileMilestone = milestones[activeMobileIndex] || milestones[0];

  // Dynamically generate styles based on milestones length:
  // Dot moves to each icon, pauses and glows for 2 seconds, then moves to the next
  const dynamicStyles = useMemo(() => {
    // Calculate arrive and depart times for each node
    const nodeTimings: Array<{
      arriveTime: number;
      departTime: number;
      arrivePct: number;
      departPct: number;
      centerPosPct: number;
    }> = [];

    let currentTime = travelTimeSec;
    for (let i = 0; i < N; i++) {
      const arriveTime = currentTime;
      const departTime = arriveTime + pauseTimeSec;
      nodeTimings.push({
        arriveTime,
        departTime,
        arrivePct: (arriveTime / desktopDurationSec) * 100,
        departPct: (departTime / desktopDurationSec) * 100,
        centerPosPct: ((i + 0.5) / N) * 100,
      });
      currentTime = departTime + travelTimeSec;
    }

    // Keyframes for the traveling laser beacon: pauses at each node for 2 seconds
    let laserSteps = `
      0% {
        left: 0%;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.6);
      }
      ${((0.2 / desktopDurationSec) * 100).toFixed(2)}% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    `;

    for (let i = 0; i < N; i++) {
      const { arrivePct, departPct, centerPosPct } = nodeTimings[i];
      const midPct = (arrivePct + departPct) / 2;

      laserSteps += `
        ${arrivePct.toFixed(2)}% {
          left: ${centerPosPct.toFixed(2)}%;
          transform: translate(-50%, -50%) scale(1.4);
        }
        ${midPct.toFixed(2)}% {
          left: ${centerPosPct.toFixed(2)}%;
          transform: translate(-50%, -50%) scale(1.45);
        }
        ${departPct.toFixed(2)}% {
          left: ${centerPosPct.toFixed(2)}%;
          transform: translate(-50%, -50%) scale(1.4);
        }
      `;
    }

    laserSteps += `
      ${(100 - (0.2 / desktopDurationSec) * 100).toFixed(2)}% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        left: 100%;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.6);
      }
    `;

    // Keyframes for each node's outer ring: 0 glow initially, glows for 2s while dot meets it, then fades
    let nodeKeyframes = "";
    for (let i = 0; i < N; i++) {
      const { arrivePct, departPct } = nodeTimings[i];
      const fadeDurationPct = (0.25 / desktopDurationSec) * 100;
      const fadeStartPct = Math.max(0, arrivePct - fadeDurationPct);
      const fadeEndPct = Math.min(100, departPct + fadeDurationPct);
      const midPct = (arrivePct + departPct) / 2;

      nodeKeyframes += `
        @keyframes nodeOuterGlow_${i} {
          0%, ${fadeStartPct.toFixed(2)}% {
            opacity: 0;
            transform: scale(0.92);
          }
          ${arrivePct.toFixed(2)}% {
            opacity: 1;
            transform: scale(1.04);
          }
          ${midPct.toFixed(2)}% {
            opacity: 1;
            transform: scale(1.06);
          }
          ${departPct.toFixed(2)}% {
            opacity: 1;
            transform: scale(1.04);
          }
          ${fadeEndPct.toFixed(2)}%, 100% {
            opacity: 0;
            transform: scale(0.92);
          }
        }
      `;
    }

    return `
      @keyframes laserPulseMove {
        ${laserSteps}
      }

      ${nodeKeyframes}

      /* Mobile: travels to center in 1s, pauses and glows for 2s, moves away in 1s (4s total) */
      @keyframes mobileLaserMove {
        0% {
          left: 0%;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.6);
        }
        5% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        25% {
          left: 50%;
          transform: translate(-50%, -50%) scale(1.4);
        }
        50% {
          left: 50%;
          transform: translate(-50%, -50%) scale(1.45);
        }
        75% {
          left: 50%;
          transform: translate(-50%, -50%) scale(1.4);
        }
        95% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        100% {
          left: 100%;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.6);
        }
      }

      @keyframes mobileOuterGlow {
        0%, 20% {
          opacity: 0;
          transform: scale(0.92);
        }
        25% {
          opacity: 1;
          transform: scale(1.04);
        }
        50% {
          opacity: 1;
          transform: scale(1.06);
        }
        75% {
          opacity: 1;
          transform: scale(1.04);
        }
        80%, 100% {
          opacity: 0;
          transform: scale(0.92);
        }
      }
    `;
  }, [N, desktopDurationSec]);

  return (
    <section
      className={`relative w-full py-20 md:py-28 bg-transparent select-none overflow-hidden ${matter.className}`}
    >
      {/* Background Ambient Radial Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Laser & Outer Glow Dynamic Keyframe Animations */}
      <style>{dynamicStyles}</style>

      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center space-y-1 mb-16 sm:mb-20 md:mb-28">
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
          13 Years
        </h2>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
          One Obsession
        </h2>
      </div>

      {/* Desktop Timeline View */}
      <div className="hidden md:block relative">
        {/* Horizontal Glowing Track */}
        <div className="absolute top-[44px] sm:top-[48px] left-0 right-0 h-[2px] -translate-y-1/2 z-0 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(2,136,255,0.4) 5%, rgba(2,136,255,0.9) 25%, rgba(0,212,255,1) 50%, rgba(2,136,255,0.9) 75%, rgba(2,136,255,0.4) 95%, transparent 100%)",
            }}
          />

          {/* Flowing Laser Beacon (Left to Right, pausing 2s on each milestone) */}
          <div
            className="absolute top-1/2"
            style={{
              animation: `laserPulseMove ${desktopDurationSec}s linear infinite`,
            }}
          >
            <div
              className="absolute top-1/2 right-1 -translate-y-1/2 w-20 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.95))",
                filter: "blur(0.5px)",
              }}
            />
            <div
              className="w-3 h-3 rounded-full bg-white relative z-10"
              style={{
                boxShadow:
                  "0 0 8px 2px #ffffff, 0 0 18px 4px #00d4ff, 0 0 22px 6px rgba(2,136,255,0.6)",
              }}
            />
          </div>
        </div>

        {/* Milestones Grid (Dynamically adapts to any count of milestones) */}
        <div
          className="grid gap-8 relative z-10"
          style={{
            gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))`,
          }}
        >
          {milestones.map((item, index) => {
            return (
              <div
                key={`${item.year}-${index}`}
                className="flex flex-col items-center text-center group"
              >
                {/* Badge Icon Area */}
                <div className="relative mb-6 h-[88px] sm:h-[96px] flex items-center justify-center">
                  {/* Outer Glowing Charging Ring (Activated for 2 seconds while dot pauses at this icon) */}
                  <div
                    className="absolute w-[100px] h-[100px] sm:w-[108px] sm:h-[108px] pointer-events-none z-0"
                    style={{
                      animation: `nodeOuterGlow_${index} ${desktopDurationSec}s linear infinite`,
                    }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <defs>
                        <filter id={`nodeRingGlow-${index}`} x="-60%" y="-60%" width="220%" height="220%">
                          <feGaussianBlur stdDeviation="3.5" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Soft outer cyan halo */}
                      <circle
                        cx="50"
                        cy="50"
                        r="41"
                        fill="none"
                        stroke="#00d4ff"
                        strokeWidth="4"
                        filter={`url(#nodeRingGlow-${index})`}
                      />
                      {/* Crisp bright core ring on top, no blur */}
                      <circle
                        cx="50"
                        cy="50"
                        r="41"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        opacity="0.9"
                      />
                    </svg>
                  </div>

                  {/* Circular Badge Container */}
                  <div
                    className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full 
                      backdrop-blur-md border-t border-b border-white/90
                      shadow-[inset_-1px_-1px_4px_0_rgba(0,0,0,0.25)]
                      overflow-hidden flex items-center justify-center relative z-10 transition-all duration-300"
                  >
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                      <Image
                        src="/chicken_logo.svg"
                        alt="CFOCO Chicken Icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Year with Red Neon Stroke */}
                <div className="mb-2">
                  <span
                    className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-wider inline-block"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: "2px #E52528",
                    }}
                  >
                    {item.year}
                  </span>
                </div>

                {/* Milestone Title */}
                <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white mb-2 tracking-tight">
                  {item.title}
                </h3>

                {/* Description */}
                <div className="text-white text-sm md:text-base font-normal leading-snug w-full max-w-xs opacity-90">
                  <p>{item.descLine1}</p>
                  <p>{item.descLine2}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Timeline View */}
      <div className="block md:hidden relative max-w-md mx-auto px-4">
        {/* Horizontal Laser Line across Mobile View */}
        <div className="absolute top-[44px] left-0 right-0 h-[2px] -translate-y-1/2 z-0 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(2,136,255,0.4) 15%, rgba(2,136,255,0.9) 40%, rgba(0,212,255,1) 50%, rgba(2,136,255,0.9) 60%, rgba(2,136,255,0.4) 85%, transparent 100%)",
              boxShadow:
                "0 0 10px 1px rgba(2,136,255,0.6), 0 0 25px 4px rgba(2,136,255,0.3)",
            }}
          />

          {/* Traveling Laser Dot on Mobile */}
          <div
            className="absolute top-1/2"
            style={{
              animation: "mobileLaserMove 4s linear infinite",
            }}
          >
            <div
              className="absolute top-1/2 right-1 -translate-y-1/2 w-16 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.95))",
                filter: "blur(0.5px)",
              }}
            />
            <div
              className="w-3.5 h-3.5 rounded-full bg-white relative z-10"
              style={{
                boxShadow:
                  "0 0 8px 3px #ffffff, 0 0 18px 6px #00d4ff, 0 0 32px 10px rgba(2,136,255,0.9)",
              }}
            />
          </div>
        </div>

        {/* Center Node Badge on Mobile */}
        <div className="relative mb-6 h-[88px] flex items-center justify-center z-10">
          {/* Outer Glowing Charging Ring on Mobile (Glows for 2s while dot pauses) */}
          <div
            className="absolute w-[100px] h-[100px] pointer-events-none z-0"
            style={{
              animation: "mobileOuterGlow 4s linear infinite",
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              <defs>
                <filter id="mobileRingGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Soft outer cyan halo */}
              <circle
                cx="50"
                cy="50"
                r="41"
                fill="none"
                stroke="#00d4ff"
                strokeWidth="4"
                filter="url(#mobileRingGlow)"
              />
              {/* Crisp bright core ring on top, no blur */}
              <circle
                cx="50"
                cy="50"
                r="41"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.9"
              />
            </svg>
          </div>

          <div className="w-[72px] h-[72px] rounded-full bg-transparent backdrop-blur-md border-t border-b border-white/90 shadow-[inset_-1px_-1px_4px_0_rgba(0,0,0,0.25)] flex items-center justify-center relative z-10 transition-all duration-300">
            <div className="relative w-9 h-9 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <Image
                src="/chicken_logo.svg"
                alt="CFOCO Chicken Icon"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Auto-Changing Milestone Content with Smooth Fade Transitions */}
        <div className="relative min-h-[170px] flex items-center justify-center z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMobileMilestone.year}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="flex flex-col items-center text-center"
            >
              {/* Year with Red Neon Stroke */}
              <div className="mb-1.5">
                <span
                  className="font-extrabold text-3xl sm:text-4xl tracking-wider inline-block"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "2px #E52528",
                    filter: "drop-shadow(0 0 6px rgba(229, 37, 40, 0.4))",
                  }}
                >
                  {currentMobileMilestone.year}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {currentMobileMilestone.title}
              </h3>

              {/* Description */}
              <div className="text-neutral-300 text-sm font-normal leading-[1.35] max-w-xs space-y-0.5">
                <p>{currentMobileMilestone.descLine1}</p>
                <p>{currentMobileMilestone.descLine2}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Obsession;