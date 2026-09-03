"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Users, Rabbit, Star } from "lucide-react";
import { matter } from "@/font/fonts";
import { FallbackChicken } from "./FriedChickenCanvas";

// Dynamically import Three.js Canvas to prevent SSR issues, with fallback image
const FriedChickenCanvas = dynamic(
  () => import("./FriedChickenCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <FallbackChicken />
      </div>
    ),
  }
);

interface PillarItem {
  id: "conviviality" | "speed" | "quality";
  title: string;
  lines: string[];
  icon: React.ElementType;
}

const leftPillar: PillarItem = {
  id: "conviviality",
  title: "Conviviality",
  lines: ["Great Meals Are Meant To Be Shared.", "So Is A Good Time."],
  icon: Users,
};

const rightPillar: PillarItem = {
  id: "speed",
  title: "Speed",
  lines: ["Fast Food Should Be Fast And", "Still Be Food."],
  icon: Rabbit,
};

const bottomPillar: PillarItem = {
  id: "quality",
  title: "Quality",
  lines: [
    "If It's Not Crispy Enough To Hear, It Doesn't",
    "Leave The Kitchen.",
  ],
  icon: Star,
};

const WhatWeRefuse = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  // activePhase: 0: Quality (initial), 1: Conviviality, 2: Speed, 3: Quality (last)
  const [activePhase, setActivePhase] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);
    // 0.00 - 0.25: Quality (initial)
    // 0.25 - 0.55: Conviviality (scroll step 1)
    // 0.55 - 0.80: Speed (scroll step 2)
    // 0.80 - 1.00: Quality (at last, moves back to quality position)
    if (latest < 0.25) {
      setActivePhase(0);
    } else if (latest < 0.55) {
      setActivePhase(1);
    } else if (latest < 0.8) {
      setActivePhase(2);
    } else {
      setActivePhase(3);
    }
  });

  // Allow clicking on a pillar to scroll to that step
  const scrollToPhase = (phaseIndex: number) => {
    if (!containerRef.current) return;
    const containerTop =
      containerRef.current.getBoundingClientRect().top + window.scrollY;
    const containerHeight =
      containerRef.current.offsetHeight - window.innerHeight;
    const targets = [0.05, 0.4, 0.68, 0.95];
    window.scrollTo({
      top: containerTop + targets[phaseIndex] * containerHeight,
      behavior: "smooth",
    });
  };

  const isQualityActive = activePhase === 0 || activePhase === 3;
  const isConvivialityActive = activePhase === 1;
  const isSpeedActive = activePhase === 2;

  // Active pillar data for mobile single-view layout
  const currentPillar =
    activePhase === 1
      ? leftPillar
      : activePhase === 2
      ? rightPillar
      : bottomPillar;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[300vh] bg-transparent ${matter.className}`}
    >
      {/* Sticky Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 md:pb-10 px-4 sm:px-6 lg:px-8 select-none overflow-hidden">
        {/* Ambient Glow Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[750px] h-[500px] sm:h-[750px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[350px] h-[300px] sm:h-[350px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center z-20 shrink-0 mb-1 sm:mb-3">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-[3.125rem] font-bold tracking-tight text-[#E5A823] leading-[1.12]"
          >
            What We Refuse
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-[4.375rem] font-bold tracking-tight text-[#E5A823] leading-none"
          >
            To Compromise
          </motion.h2>
        </div>

        {/* Interactive Orbit Stage with 3D Model in Center */}
        <div className="relative w-full flex-1 flex flex-col justify-center items-center my-auto">
          {/* DESKTOP & TABLET LAYOUT (>= lg) */}
          <div className="hidden lg:flex w-full items-center justify-between gap-4 relative max-w-6xl mx-auto">
            {/* Left Pillar: Conviviality */}
            <div
              onClick={() => scrollToPhase(1)}
              className="w-full flex flex-col items-center text-center z-20 order-1 px-4 cursor-pointer group transition-transform duration-300 hover:scale-105"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all duration-300 mb-2 sm:mb-3 ${
                  isConvivialityActive
                    ? "bg-[#1f1013] border-[#E52320] shadow-[0_0_20px_rgba(229,35,32,0.45)] scale-110"
                    : "bg-[#0d1424]/80 border-white/10 hover:border-white/25"
                }`}
              >
                <Users
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                    isConvivialityActive ? "text-[#E52320]" : "text-[#E5A823]"
                  }`}
                />
              </div>
              <h3
                className={`text-2xl sm:text-3xl md:text-[2.5rem] font-bold mb-1.5 transition-all duration-300 ${
                  isConvivialityActive
                    ? "text-[#E52320] scale-105 drop-shadow-[0_0_15px_rgba(229,35,32,0.4)]"
                    : "text-white group-hover:text-[#E5A823]"
                }`}
              >
                {leftPillar.title}
              </h3>
              {leftPillar.lines.map((line, idx) => (
                <p
                  key={idx}
                  className={`text-sm text-center sm:text-base md:text-[22px] leading-[1.3] transition-colors duration-300 ${
                    isConvivialityActive ? "text-white font-medium" : "text-[#A0A5B5]"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Central Orbit Circle (Desktop) */}
            <div className="relative flex items-center justify-center order-2 shrink-0">
              <div className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px] flex items-center justify-center">
                {/* Thin Orbit Perimeter Ring */}
                <div className="absolute inset-0 rounded-full border-[1.5px] border-blue-400/35 shadow-[0_0_30px_rgba(56,189,248,0.18)] pointer-events-none" />
                <div className="absolute -inset-3 rounded-full border border-blue-500/10 pointer-events-none" />

                {/* Left Dot (Conviviality - 9 o'clock) */}
                <div
                  onClick={() => scrollToPhase(1)}
                  className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer p-2"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                      isConvivialityActive
                        ? "bg-[#E52320] shadow-[0_0_14px_#E52320] scale-150"
                        : "bg-[#38bdf8] shadow-[0_0_8px_#38bdf8] hover:scale-125"
                    }`}
                  />
                  {isConvivialityActive && (
                    <div className="absolute inset-0 m-auto w-6 h-6 rounded-full border border-[#E52320] animate-ping pointer-events-none" />
                  )}
                </div>

                {/* Right Dot (Speed - 3 o'clock) */}
                <div
                  onClick={() => scrollToPhase(2)}
                  className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer p-2"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                      isSpeedActive
                        ? "bg-[#E52320] shadow-[0_0_14px_#E52320] scale-150"
                        : "bg-[#38bdf8] shadow-[0_0_8px_#38bdf8] hover:scale-125"
                    }`}
                  />
                  {isSpeedActive && (
                    <div className="absolute inset-0 m-auto w-6 h-6 rounded-full border border-[#E52320] animate-ping pointer-events-none" />
                  )}
                </div>

                {/* Bottom Dot (Quality - 6 o'clock) */}
                <div
                  onClick={() => scrollToPhase(0)}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 cursor-pointer p-2"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isQualityActive
                        ? "border-[#E52320] bg-[#1a080a] scale-125 shadow-[0_0_15px_#E52320]"
                        : "border-[#38bdf8] bg-[#0d1424] hover:scale-110"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isQualityActive
                          ? "bg-[#E52320] shadow-[0_0_10px_#E52320]"
                          : "bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]"
                      }`}
                    />
                  </div>
                  {isQualityActive && (
                    <div className="absolute inset-0 m-auto w-6 h-6 rounded-full border border-[#E52320] animate-ping pointer-events-none" />
                  )}
                </div>

                {/* 3D Model Canvas */}
                <div className="relative w-full h-full z-10 flex items-center justify-center">
                  <FriedChickenCanvas
                    activePhase={activePhase}
                    scrollProgress={scrollProgress}
                  />
                </div>
              </div>
            </div>

            {/* Right Pillar: Speed */}
            <div
              onClick={() => scrollToPhase(2)}
              className="w-full flex flex-col items-center text-center z-20 order-3 px-4 cursor-pointer group transition-transform duration-300 hover:scale-105"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all duration-300 mb-2 sm:mb-3 ${
                  isSpeedActive
                    ? "bg-[#1f1013] border-[#E52320] shadow-[0_0_20px_rgba(229,35,32,0.45)] scale-110"
                    : "bg-[#0d1424]/80 border-white/10 hover:border-white/25"
                }`}
              >
                <Rabbit
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                    isSpeedActive ? "text-[#E52320]" : "text-[#E5A823]"
                  }`}
                />
              </div>
              <h3
                className={`text-2xl sm:text-3xl md:text-[2.5rem] font-bold mb-1.5 transition-all duration-300 ${
                  isSpeedActive
                    ? "text-[#E52320] scale-105 drop-shadow-[0_0_15px_rgba(229,35,32,0.4)]"
                    : "text-white group-hover:text-[#E5A823]"
                }`}
              >
                {rightPillar.title}
              </h3>
              {rightPillar.lines.map((line, idx) => (
                <p
                  key={idx}
                  className={`text-sm sm:text-base md:text-[22px] font-medium leading-[1.3] transition-colors duration-300 ${
                    isSpeedActive ? "text-white font-medium" : "text-[#A0A5B5]"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Desktop Bottom Pillar: Quality */}
          <div
            onClick={() => scrollToPhase(0)}
            className="hidden lg:flex flex-col items-center text-center z-20 mt-3 sm:mt-5 px-4 cursor-pointer group transition-transform duration-300 hover:scale-105"
          >
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all duration-300 mb-1.5 sm:mb-2 ${
                isQualityActive
                  ? "bg-[#1f1013] border-[#E52320] shadow-[0_0_20px_rgba(229,35,32,0.45)] scale-110"
                  : "bg-[#0d1424]/80 border-white/10 hover:border-white/25"
              }`}
            >
              <Star
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                  isQualityActive ? "text-[#E52320] fill-[#E52320]" : "text-[#E5A823]"
                }`}
              />
            </div>
            <h3
              className={`text-2xl sm:text-3xl md:text-[2.5rem] font-bold mb-1 transition-all duration-300 ${
                isQualityActive
                  ? "text-[#E52320] scale-105 drop-shadow-[0_0_15px_rgba(229,35,32,0.4)]"
                  : "text-white group-hover:text-[#E5A823]"
              }`}
            >
              {bottomPillar.title}
            </h3>
            {bottomPillar.lines.map((line, idx) => (
              <p
                key={idx}
                className={`text-sm sm:text-base md:text-[22px] leading-[1.3] max-w-xl transition-colors duration-300 ${
                  isQualityActive ? "text-white font-medium" : "text-[#A0A5B5]"
                }`}
              >
                {line}
              </p>
            ))}
          </div>

          {/* MOBILE LAYOUT (< lg) matching the mobile reference screenshot */}
          <div className="flex lg:hidden flex-col items-center justify-center w-full my-auto">
            {/* Center Orbit Ring */}
            <div className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] flex items-center justify-center mb-6">
              {/* Ring line */}
              <div className="absolute inset-0 rounded-full border-[1.5px] border-blue-400/35 shadow-[0_0_25px_rgba(56,189,248,0.2)] pointer-events-none" />

              {/* Left Anchor Dot (Conviviality) */}
              <div
                onClick={() => scrollToPhase(1)}
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-2 cursor-pointer"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                    isConvivialityActive
                      ? "bg-[#E52320] shadow-[0_0_14px_#E52320] scale-150"
                      : "bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]"
                  }`}
                />
              </div>

              {/* Right Anchor Dot (Speed) */}
              <div
                onClick={() => scrollToPhase(2)}
                className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-30 p-2 cursor-pointer"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                    isSpeedActive
                      ? "bg-[#E52320] shadow-[0_0_14px_#E52320] scale-150"
                      : "bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]"
                  }`}
                />
              </div>

              {/* Bottom Anchor Dot (Quality) */}
              <div
                onClick={() => scrollToPhase(0)}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 p-2 cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isQualityActive
                      ? "border-[#E52320] bg-[#1a080a] scale-125 shadow-[0_0_15px_#E52320]"
                      : "border-[#38bdf8] bg-[#0d1424]"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isQualityActive
                        ? "bg-[#E52320] shadow-[0_0_10px_#E52320]"
                        : "bg-[#38bdf8]"
                    }`}
                  />
                </div>
              </div>

              {/* 3D Model / Fallback Image Canvas */}
              <div className="relative w-full h-full z-10 flex items-center justify-center">
                <FriedChickenCanvas
                  activePhase={activePhase}
                  scrollProgress={scrollProgress}
                />
              </div>
            </div>

            {/* Mobile Active Pillar Text below orbit */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPillar.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center px-4"
              >
                <h3 className="text-3xl font-bold mb-2 text-[#E52320] drop-shadow-[0_0_15px_rgba(229,35,32,0.4)]">
                  {currentPillar.title}
                </h3>
                {currentPillar.lines.map((line, idx) => (
                  <p
                    key={idx}
                    className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-xs"
                  >
                    {line}
                  </p>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Floor Ambient Reflection */}
        <div className="w-full max-w-4xl mx-auto h-6 bg-gradient-to-t from-transparent via-blue-900/10 to-transparent blur-xl pointer-events-none shrink-0" />
      </div>
    </div>
  );
};

export default WhatWeRefuse;