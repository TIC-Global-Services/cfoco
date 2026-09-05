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
      {/* Background Ambient Radial Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none" />
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

        /* Desktop Node 1 Flare (2011 at 16.66%) - Glows blue cyan by default, extra surge when dot meets */
        @keyframes node1Flare {
          0%, 8% {
            transform: scale(1);
            border-color: #00d4ff;
            box-shadow: 0 0 12px 2px #00d4ff, 0 0 25px 5px rgba(2,136,255,0.7), inset 0 0 8px rgba(0,212,255,0.4);
          }
          16.66% {
            transform: scale(1.18);
            border-color: #ffffff;
            box-shadow: 0 0 28px 7px #00d4ff, 0 0 55px 14px rgba(2,136,255,0.95), inset 0 0 16px rgba(0,212,255,0.8);
          }
          26%, 100% {
            transform: scale(1);
            border-color: #00d4ff;
            box-shadow: 0 0 12px 2px #00d4ff, 0 0 25px 5px rgba(2,136,255,0.7), inset 0 0 8px rgba(0,212,255,0.4);
          }
        }

        /* Desktop Node 2 Outer Charging Glow (2014 Center at 50%) */
        @keyframes node2Charging {
          0%, 40% {
            transform: scale(1);
            opacity: 0.95;
            border-color: #00d4ff;
            box-shadow: 0 0 8px 2px #ffffff, 0 0 18px 5px #00d4ff, 0 0 32px 8px rgba(2,136,255,0.9);
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
            border-color: #ffffff;
            box-shadow: 0 0 12px 4px #ffffff, 0 0 26px 8px #00d4ff, 0 0 50px 14px rgba(2,136,255,1);
          }
          60%, 100% {
            transform: scale(1);
            opacity: 0.95;
            border-color: #00d4ff;
            box-shadow: 0 0 8px 2px #ffffff, 0 0 18px 5px #00d4ff, 0 0 32px 8px rgba(2,136,255,0.9);
          }
        }

        /* Desktop Node 3 Flare (2018 at 83.33%) - Glows blue cyan by default, extra surge when dot meets */
        @keyframes node3Flare {
          0%, 74% {
            transform: scale(1);
            border-color: #00d4ff;
            box-shadow: 0 0 12px 2px #00d4ff, 0 0 25px 5px rgba(2,136,255,0.7), inset 0 0 8px rgba(0,212,255,0.4);
          }
          83.33% {
            transform: scale(1.18);
            border-color: #ffffff;
            box-shadow: 0 0 28px 7px #00d4ff, 0 0 55px 14px rgba(2,136,255,0.95), inset 0 0 16px rgba(0,212,255,0.8);
          }
          92%, 100% {
            transform: scale(1);
            border-color: #00d4ff;
            box-shadow: 0 0 12px 2px #00d4ff, 0 0 25px 5px rgba(2,136,255,0.7), inset 0 0 8px rgba(0,212,255,0.4);
          }
        }

        /* Mobile Node Flare */
        @keyframes mobileNodeFlare {
          0%, 40% {
            transform: scale(1);
            border-color: #00d4ff;
            box-shadow: 0 0 18px 4px #00d4ff, 0 0 35px 8px rgba(2,136,255,0.7), inset 0 0 10px rgba(0,212,255,0.5);
          }
          50% {
            transform: scale(1.18);
            border-color: #ffffff;
            box-shadow: 0 0 35px 12px #00d4ff, 0 0 70px 22px rgba(2,136,255,1), inset 0 0 25px rgba(255,255,255,0.9);
          }
          60%, 100% {
            transform: scale(1);
            border-color: #00d4ff;
            box-shadow: 0 0 18px 4px #00d4ff, 0 0 35px 8px rgba(2,136,255,0.7), inset 0 0 10px rgba(0,212,255,0.5);
          }
        }

        /* Ambient Glow Flares */
        @keyframes node1Bloom {
          0%, 8% { opacity: 0.5; transform: scale(1.1); }
          16.66% { opacity: 1; transform: scale(1.8); }
          26%, 100% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes node2Bloom {
          0%, 40% { opacity: 0.7; transform: scale(1.2); }
          50% { opacity: 1; transform: scale(2); }
          60%, 100% { opacity: 0.7; transform: scale(1.2); }
        }
        @keyframes node3Bloom {
          0%, 74% { opacity: 0.5; transform: scale(1.1); }
          83.33% { opacity: 1; transform: scale(1.8); }
          92%, 100% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes mobileBloom {
          0%, 40% { opacity: 0.7; transform: scale(1.2); }
          50% { opacity: 1; transform: scale(2); }
          60%, 100% { opacity: 0.7; transform: scale(1.2); }
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
                  ? "node2Charging 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite"
                  : "node3Flare 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite";

            const bloomAnimation =
              index === 0
                ? "node1Bloom 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite"
                : index === 1
                  ? "node2Bloom 3.6s cubic-bezier(0.2, 0, 0.2, 1) infinite"
                  : "node3Bloom 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite";

            const isCenter = index === 1;

            return (
              <div
                key={item.year}
                className="flex flex-col items-center text-center group"
              >
                {/* Badge Icon Area */}
                <div className="relative mb-6 h-[88px] sm:h-[96px] flex items-center justify-center">
                  {/* Ambient Glow Bloom */}
                  <div
                    className="absolute w-[1px] h-[1px] rounded-full blur-[5px] pointer-events-none"
                    style={{
                      background: isCenter
                        ? "rgba(0, 212, 255, 0.8)"
                        : "rgba(2, 136, 255, 0.6)",
                      animation: bloomAnimation,
                    }}
                  />

                  {/* Outer Glowing Charging Ring (Center Node Only) */}
                  {isCenter && (
                    <div
                      className="absolute w-[90px] h-[90px] sm:w-[98px] sm:h-[98px] rounded-full border-4 border-white pointer-events-none z-0"
                      style={{
                        boxShadow:
                          "0 0 8px 2px #ffffff, 0 0 18px 10px rgba(2,136,255,0.9), 0 0 32px 8px rgba(2,136,255,0.9)",
                        animation:
                          "node2Charging 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                      }}
                    />
                  )}

                  {/* Circular Badge Container */}
                  <div
                    className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full 
                      backdrop-blur-md border-t border-b border-white/90
                      shadow-[inset_-1px_-1px_4px_0_rgba(0,0,0,0.25)]
                      overflow-hidden flex items-center justify-center relative z-10 transition-all duration-300"
                    style={{
                      animation: isCenter ? undefined : flareAnimation,
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
                <div className="mb-2">
                  <span
                    className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-wider inline-block"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: "2px #E52528",
                      filter: "drop-shadow(0 0 6px rgba(229, 37, 40, 0.4))",
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

        {/* Center Node Badge on Mobile */}
        <div className="relative mb-6 h-[88px] flex items-center justify-center z-10">
          <div
            className="absolute w-[110px] h-[110px] rounded-full blur-[25px] pointer-events-none"
            style={{
              background: "rgba(0, 212, 255, 0.8)",
              animation: "mobileBloom 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />

          {/* Outer Glowing Charging Ring on Mobile */}
          <div
            className="absolute w-[90px] h-[90px] rounded-full border-4 border-[#00d4ff] pointer-events-none z-0"
            style={{
              boxShadow:
                "0 0 8px 2px #ffffff, 0 0 18px 5px #00d4ff, 0 0 32px 8px rgba(2, 136, 255, 0.9)",
              animation:
                "node2Charging 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />

          <div
            className="w-[72px] h-[72px] rounded-full bg-transparent backdrop-blur-md border-t border-b border-white/90 shadow-[inset_-1px_-1px_4px_0_rgba(0,0,0,0.25)] flex items-center justify-center relative z-10 transition-all duration-300"
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