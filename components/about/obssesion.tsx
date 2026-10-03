"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
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
  {
    year: "2019",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
  {
    year: "2020",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
  {
    year: "2022",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
];

interface ObsessionProps {
  items?: Milestone[];
}

const Obsession: React.FC<ObsessionProps> = ({ items }) => {
  const milestones = items && items.length > 0 ? items : defaultMilestones;
  const N = milestones.length;

  const [startIndex, setStartIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const newIndex = Math.min(N - 1, Math.floor(latest * N));
    if (newIndex !== startIndex) {
      setStartIndex(newIndex);
    }
  });

  const itemProgress = useTransform(scrollYProgress, (v) => {
    if (v >= 1) return 1;
    return (v * N) % 1;
  });

  const dotLeft = useTransform(itemProgress, [0, 1], ["0%", "100%"]);
  const dotOpacity = useTransform(itemProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const dotScale = useTransform(
    itemProgress,
    [0, 0.05, 0.1666, 0.5, 0.8333, 0.95, 1],
    [0.6, 1, 1.4, 1.4, 1.4, 1, 0.6]
  );

  const glowOpacities = [
    useTransform(itemProgress, [0, 0.05, 0.12, 0.24, 0.32, 1], [0, 0, 1, 1, 0, 0]),
    useTransform(itemProgress, [0, 0.38, 0.44, 0.58, 0.64, 1], [0, 0, 1, 1, 0, 0]),
    useTransform(itemProgress, [0, 0.72, 0.78, 0.90, 0.96, 1], [0, 0, 1, 1, 0, 0]),
  ];

  const glowScales = [
    useTransform(itemProgress, [0, 0.05, 0.12, 0.24, 0.32, 1], [0.92, 0.92, 1.05, 1.05, 0.92, 0.92]),
    useTransform(itemProgress, [0, 0.38, 0.44, 0.58, 0.64, 1], [0.92, 0.92, 1.05, 1.05, 0.92, 0.92]),
    useTransform(itemProgress, [0, 0.72, 0.78, 0.90, 0.96, 1], [0.92, 0.92, 1.05, 1.05, 0.92, 0.92]),
  ];

  const defaultShadow = "0 0 0px 0px rgba(255,255,255,0), 0 0 0px 0px rgba(0,212,255,0), 0 0 0px 0px rgba(2,136,255,0)";
  const activeShadow = "0 0 8px 2px rgba(255,255,255,1), 0 0 18px 4px rgba(0,212,255,1), 0 0 22px 6px rgba(2,136,255,0.6)";

  const dotBoxShadow = useTransform(
    itemProgress,
    [0, 0.1, 0.1666, 0.24, 0.32, 0.44, 0.5, 0.58, 0.64, 0.78, 0.8333, 0.90, 0.96, 1],
    [
      defaultShadow,
      defaultShadow,
      activeShadow,
      activeShadow,
      defaultShadow,
      defaultShadow,
      activeShadow,
      activeShadow,
      defaultShadow,
      defaultShadow,
      activeShadow,
      activeShadow,
      defaultShadow,
      defaultShadow,
    ]
  );

  const tailOpacity = useTransform(
    itemProgress,
    [0, 0.1, 0.1666, 0.24, 0.32, 0.44, 0.5, 0.58, 0.64, 0.78, 0.8333, 0.90, 0.96, 1],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0]
  );

  // Compute 3 visible items starting at startIndex with wrapping
  const visibleItems = useMemo(() => {
    const list = [];
    const count = Math.min(3, N);
    for (let i = 0; i < count; i++) {
      const idx = (startIndex + i) % N;
      list.push({
        data: milestones[idx],
        index: idx,
        slot: i, // 0 = left, 1 = center, 2 = right
      });
    }
    return list;
  }, [startIndex, milestones, N]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: `calc(100vh + ${N * 40}vh)` }}>
      <section
        className={`sticky top-0 w-full h-screen flex flex-col justify-center bg-transparent select-none overflow-hidden ${matter.className}`}
      >
        {/* Background Ambient Radial Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Section Header */}
      <div className="w-full text-center space-y-1 mb-16 sm:mb-20 md:mb-24 px-[5%]">
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
          13 Years
        </h2>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
          One Obsession
        </h2>
      </div>

      {/* Desktop Train View (3 Visible Slots) */}
      <div className="hidden md:block relative w-full px-[5%]">
        {/* Horizontal Laser Line */}
        <div className="absolute top-[44px] sm:top-[48px] left-[5%] right-[5%] h-[2px] -translate-y-1/2 z-0 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(2,136,255,0.4) 15%, rgba(2,136,255,0.4) 85%, transparent 100%)",
            }}
          />

          {/* Traveling Laser Beacon */}
          <motion.div
            className="absolute top-1/2"
            style={{
              left: dotLeft,
              opacity: dotOpacity,
              x: "-50%",
              y: "-50%",
              scale: dotScale,
            }}
          >
            <motion.div
              className="absolute top-1/2 right-1 -translate-y-1/2 w-20 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.95))",
                filter: "blur(0.5px)",
                opacity: tailOpacity,
              }}
            />
            <motion.div
              className="w-3.5 h-3.5 rounded-full bg-white relative z-10"
              style={{
                boxShadow: dotBoxShadow,
              }}
            />
          </motion.div>
        </div>

        {/* Train Track Container */}
        <div className="relative z-10 overflow-hidden py-4">
          <div className="grid grid-cols-3 gap-8 md:gap-12 relative min-h-[320px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleItems.map(({ data, index, slot }) => (
                <motion.div
                  key={`${data.year}-${index}`}
                  layout
                  initial={{ opacity: 0, x: 140 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -140 }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 26,
                    mass: 0.9,
                  }}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  {/* Badge Icon Area */}
                  <div className="relative mb-6 h-[88px] sm:h-[96px] flex items-center justify-center">
                    {/* Outer Charging Ring Glow (Glows when dot meets slot OR on hover) */}
                    <motion.div
                      className="absolute w-[104px] h-[104px] sm:w-[114px] sm:h-[114px] pointer-events-none z-0 
                        opacity-0 transition-transform duration-300 ease-out group-hover:!opacity-100 group-hover:!scale-105"
                      style={{
                        opacity: glowOpacities[slot],
                        scale: glowScales[slot],
                      }}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full overflow-visible"
                      >
                        <defs>
                          <filter
                            id={`trainRingGlow-${index}`}
                            x="-60%"
                            y="-60%"
                            width="220%"
                            height="220%"
                          >
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="41"
                          fill="none"
                          stroke="#00d4ff"
                          strokeWidth="4"
                          filter={`url(#trainRingGlow-${index})`}
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="41"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          opacity="0.95"
                        />
                      </svg>
                    </motion.div>

                    {/* Circular Badge Container */}
                    <div
                      className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full 
                        backdrop-blur-md border-t border-b border-white/90
                        shadow-[inset_-1px_-1px_4px_0_rgba(0,0,0,0.25)]
                        overflow-hidden flex items-center justify-center relative z-10 
                        transition-all duration-300 group-hover:scale-110 group-hover:border-cyan-400
                        group-hover:shadow-[0_0_25px_rgba(0,212,255,0.6)]"
                    >
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-110">
                        <Image
                          src="/chicken_logo.svg"
                          alt="CFOCO Chicken Icon"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Year */}
                  <div className="mb-2">
                    <span
                      className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-wider inline-block transition-transform duration-300 group-hover:scale-105"
                      style={{
                        color: "transparent",
                        WebkitTextStroke: "2px #E52528",
                        filter: "drop-shadow(0 0 6px rgba(229, 37, 40, 0.4))",
                      }}
                    >
                      {data.year}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white mb-2 tracking-tight transition-colors duration-300 group-hover:text-cyan-300">
                    {data.title}
                  </h3>

                  {/* Description */}
                  <div className="text-white text-sm font-normal leading-snug w-full max-w-xs opacity-90 transition-opacity duration-300 group-hover:opacity-100">
                    <p>{data.descLine1}</p>
                    <p>{data.descLine2}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Timeline View */}
      <div className="block md:hidden relative max-w-md mx-auto px-4">
        {/* Mobile Laser Track */}
        <div className="absolute top-[44px] left-0 right-0 h-[2px] -translate-y-1/2 z-0 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(2,136,255,0.4) 20%, rgba(2,136,255,0.4) 80%, transparent 100%)",
            }}
          />

          <motion.div
            className="absolute top-1/2"
            style={{
              left: dotLeft,
              opacity: dotOpacity,
              x: "-50%",
              y: "-50%",
              scale: dotScale,
            }}
          >
            <motion.div
              className="absolute top-1/2 right-1 -translate-y-1/2 w-16 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.95))",
                filter: "blur(0.5px)",
                opacity: tailOpacity,
              }}
            />
            <motion.div
              className="w-3.5 h-3.5 rounded-full bg-white relative z-10"
              style={{
                boxShadow: dotBoxShadow,
              }}
            />
          </motion.div>
        </div>

        {/* Center Node Badge on Mobile */}
        <div className="relative mb-6 h-[88px] flex items-center justify-center z-10">
          <motion.div
            className="absolute w-[100px] h-[100px] pointer-events-none z-0 opacity-0"
            style={{
              opacity: glowOpacities[1],
              scale: glowScales[1],
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
              <circle
                cx="50"
                cy="50"
                r="41"
                fill="none"
                stroke="#00d4ff"
                strokeWidth="4"
                filter="url(#mobileRingGlow)"
              />
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
          </motion.div>

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

        {/* Mobile Milestone Content */}
        <div className="relative min-h-[170px] flex items-center justify-center z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={milestones[startIndex].year}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-1.5">
                <span
                  className="font-extrabold text-3xl sm:text-4xl tracking-wider inline-block"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "2px #E52528",
                    filter: "drop-shadow(0 0 6px rgba(229, 37, 40, 0.4))",
                  }}
                >
                  {milestones[startIndex].year}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {milestones[startIndex].title}
              </h3>

              <div className="text-neutral-300 text-sm font-normal leading-[1.35] max-w-xs space-y-0.5">
                <p>{milestones[startIndex].descLine1}</p>
                <p>{milestones[startIndex].descLine2}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </section>
    </div>
  );
};

export default Obsession;