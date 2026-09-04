"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { matter } from "@/font/fonts";

interface Milestone {
  year: string;
  title: string;
  descLine1: string;
  descLine2: string;
}

const milestones: Milestone[] = [
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

const CYCLE_DURATION = 3600; // 3.6s per cycle

const Obsession = () => {
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  // Auto-advance mobile milestone in sync with the laser loop
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMobileIndex((prev) => (prev + 1) % milestones.length);
    }, CYCLE_DURATION);

    return () => clearInterval(timer);
  }, []);

  const currentMobileMilestone = milestones[activeMobileIndex];

  return (
    <section
      className={`relative w-full py-20 md:py-28 bg-transparent select-none overflow-hidden ${matter.className}`}
    >
      {/* Laser & Flare Synchronized Keyframe Animations */}
      <style>{`
        /* Desktop Laser Beacon Traveling Left to Right (16.6% -> 50% -> 83.3%) */
        @keyframes laserPulseMove {
          0% {
            left: 0%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6);
          }
          5% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          16.66% {
            left: 16.66%;
            transform: translate(-50%, -50%) scale(1.4);
          }
          50% {
            left: 50%;
            transform: translate(-50%, -50%) scale(1.4);
          }
          83.33% {
            left: 83.33%;
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

        /* Mobile Single Laser Traveling across center */
        @keyframes mobileLaserMove {
          0% {
            left: 0%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6);
          }
          10% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            left: 50%;
            transform: translate(-50%, -50%) scale(1.5);
          }
          90% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            left: 100%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6);
          }
        }

        /* Desktop Node 1 Flare (2011 at 16.66%) - Scales up only when dot meets */
        @keyframes node1Flare {
          0%, 8% {
            transform: scale(1);
            border-color: rgba(2, 136, 255, 0.35);
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
          }
          16.66% {
            transform: scale(1.22);
            border-color: #00d4ff;
            box-shadow: 0 0 28px 8px #00d4ff, 0 0 55px 16px rgba(2,136,255,0.9), inset 0 0 20px rgba(0,212,255,0.7);
          }
          26%, 100% {
            transform: scale(1);
            border-color: rgba(2, 136, 255, 0.35);
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
          }
        }

        /* Desktop Node 2 Flare (2014 at 50%) - Scales up only when dot meets */
        @keyframes node2Flare {
          0%, 41% {
            transform: scale(1);
            border-color: rgba(2, 136, 255, 0.35);
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
          }
          50% {
            transform: scale(1.22);
            border-color: #00d4ff;
            box-shadow: 0 0 28px 8px #00d4ff, 0 0 55px 16px rgba(2,136,255,0.9), inset 0 0 20px rgba(0,212,255,0.7);
          }
          59%, 100% {
            transform: scale(1);
            border-color: rgba(2, 136, 255, 0.35);
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
          }
        }

        /* Desktop Node 3 Flare (2018 at 83.33%) - Scales up only when dot meets */
        @keyframes node3Flare {
          0%, 74% {
            transform: scale(1);
            border-color: rgba(2, 136, 255, 0.35);
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
          }
          83.33% {
            transform: scale(1.22);
            border-color: #00d4ff;
            box-shadow: 0 0 28px 8px #00d4ff, 0 0 55px 16px rgba(2,136,255,0.9), inset 0 0 20px rgba(0,212,255,0.7);
          }
          92%, 100% {
            transform: scale(1);
            border-color: rgba(2, 136, 255, 0.35);
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
          }
        }

        /* Mobile Node Flare (Pulsing at 50% when dot hits center) */
        @keyframes mobileNodeFlare {
          0%, 40% {
            transform: scale(1);
            border-color: rgba(2, 136, 255, 0.35);
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
          }
          50% {
            transform: scale(1.2);
            border-color: #00d4ff;
            box-shadow: 0 0 30px 8px #00d4ff, 0 0 60px 18px rgba(2,136,255,0.9), inset 0 0 22px rgba(0,212,255,0.7);
          }
          60%, 100% {
            transform: scale(1);
            border-color: rgba(2, 136, 255, 0.35);
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
          }
        }

        /* Ambient Glow Flares */
        @keyframes node1Bloom {
          0%, 8% { opacity: 0; transform: scale(0.8); }
          16.66% { opacity: 0.95; transform: scale(1.6); }
          26%, 100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes node2Bloom {
          0%, 41% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 0.95; transform: scale(1.6); }
          59%, 100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes node3Bloom {
          0%, 74% { opacity: 0; transform: scale(0.8); }
          83.33% { opacity: 0.95; transform: scale(1.6); }
          92%, 100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes mobileBloom {
          0%, 40% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.6); }
          60%, 100% { opacity: 0; transform: scale(0.8); }
        }
      `}</style>

      {/* Background Ambient Spotlight */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-full  h-[320px] rounded-full pointer-events-none blur-[140px]"
        style={{
          // background:
          //   "radial-gradient(ellipse at center, rgba(2, 136, 255, 0.18) 0%, rgba(13, 27, 62, 0.08) 50%, transparent 80%)",
        }}
      />

      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center space-y-1 mb-16 sm:mb-20 md:mb-28">
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
          13 Years
        </h2>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
          One Obsession
        </h2>
      </div>

   
      <div className="hidden md:block relative">
        {/* Horizontal Glowing Track */}
        <div className="absolute top-[44px] sm:top-[48px] left-0 right-0 h-[2px] -translate-y-1/2 z-0 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(2,136,255,0.4) 10%, rgba(2,136,255,0.9) 30%, rgba(0,212,255,1) 50%, rgba(2,136,255,0.9) 70%, rgba(2,136,255,0.4) 90%, transparent 100%)",
              boxShadow:
                "0 0 10px 1px rgba(2,136,255,0.6), 0 0 25px 4px rgba(2,136,255,0.3)",
            }}
          />

          {/* Flowing Laser Beacon (Left to Right) */}
          <div
            className="absolute top-1/2"
            style={{
              animation: "laserPulseMove 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
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
              className="w-3.5 h-3.5 rounded-full bg-white relative z-10"
              style={{
                boxShadow:
                  "0 0 8px 3px #ffffff, 0 0 18px 6px #00d4ff, 0 0 32px 10px rgba(2,136,255,0.9)",
              }}
            />
          </div>
        </div>

        {/* 3 Milestones Grid (All Equal Base Sizing) */}
        <div className="grid grid-cols-3 gap-8 relative z-10">
          {milestones.map((item, index) => {
            const flareAnimation =
              index === 0
                ? "node1Flare 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite"
                : index === 1
                ? "node2Flare 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite"
                : "node3Flare 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite";

            const bloomAnimation =
              index === 0
                ? "node1Bloom 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite"
                : index === 1
                ? "node2Bloom 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite"
                : "node3Bloom 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite";

            return (
              <div
                key={item.year}
                className="flex flex-col items-center text-center group"
              >
                {/* Equal Base Sized Badge Icon Area */}
                <div className="relative mb-6 h-[88px] sm:h-[96px] flex items-center justify-center">
                  {/* Ambient Glow Bloom */}
                  <div
                    className="absolute w-[110px] h-[110px] rounded-full blur-[25px] pointer-events-none"
                    style={{
                      background: "rgba(2, 136, 255, 0.6)",
                      animation: bloomAnimation,
                    }}
                  />

                  {/* Uniform Metallic Node Disc (Scales up when dot meets) */}
                  <div
                    className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full 
          bg-transparent
          backdrop-blur-md
          border-t border-b border-white/90
          shadow-[inset_-1px_-1px_4px_0_rgba(0,0,0,0.25)]
          transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center"
                    style={{
                      // background:
                      //   "radial-gradient(circle at 35% 30%, #1e2638 0%, #0d121c 65%, #070a10 100%)",
                      // border: "2px solid rgba(2, 136, 255, 0.35)",
                      boxShadow:
                        "0 6px 20px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.8)",
                      animation: flareAnimation,
                    }}
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
                <div className="mb-1.5 sm:mb-2">
                  <span
                    className="font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-wider inline-block"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: "1.5px #E52528",
                    }}
                  >
                    {item.year}
                  </span>
                </div>

                {/* Milestone Title */}
                <h3 className="text-xl md:text-xl lg:text-[2.25rem] font-bold text-white mb-2 tracking-tight">
                  {item.title}
                </h3>

                {/* Description */}
                <div className="text-white text-sm md:text-sm lg:text-[1.125rem] font-medium leading-[1.3] w-full max-w-sm">
                  <p>{item.descLine1}</p>
                  <p>{item.descLine2}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
              animation: "mobileLaserMove 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
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

        {/* Center Node Badge on Mobile (Flares when laser hits at 50%) */}
        <div className="relative mb-6 h-[88px] flex items-center justify-center z-10">
          <div
            className="absolute w-[110px] h-[110px] rounded-full blur-[25px] pointer-events-none"
            style={{
              background: "rgba(2, 136, 255, 0.6)",
              animation: "mobileBloom 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #1e2638 0%, #0d121c 65%, #070a10 100%)",
              border: "2px solid rgba(2, 136, 255, 0.35)",
              boxShadow:
                "0 6px 20px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.8)",
              animation:
                "mobileNodeFlare 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          >
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
                  className="font-extrabold text-3xl tracking-wider inline-block"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "1.5px #E52528",
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