"use client";

import React, { useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Users, Rabbit, Star, LucideIcon } from "lucide-react";
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

export type PillarId = "conviviality" | "speed" | "quality";

export interface PillarItem {
  id: PillarId;
  title: string;
  lines: string[];
  icon: LucideIcon;
  phaseIndex: number;
}

const PILLARS: Record<PillarId, PillarItem> = {
  conviviality: {
    id: "conviviality",
    title: "Conviviality",
    lines: ["Great Meals Are Meant To Be Shared.", "So Is A Good Time."],
    icon: Users,
    phaseIndex: 1,
  },
  speed: {
    id: "speed",
    title: "Speed",
    lines: ["Fast Food Should Be Fast And", "Still Be Food."],
    icon: Rabbit,
    phaseIndex: 2,
  },
  quality: {
    id: "quality",
    title: "Quality",
    lines: [
      "If It's Not Crispy Enough To Hear, It Doesn't",
      "Leave The Kitchen.",
    ],
    icon: Star,
    phaseIndex: 0,
  },
};

const PHASE_TARGETS = [0.05, 0.4, 0.68, 0.95];

// -----------------------------------------------------------------------------
// Sub-Components
// -----------------------------------------------------------------------------

/**
 * Section title header component with golden text matching reference mock.
 */
const SectionHeader = React.memo(function SectionHeader() {
  return (
    <header className="w-full text-center z-20 shrink-0 mb-1 sm:mb-2 md:mb-3">
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-[3.25rem] font-bold tracking-tight text-[#E5A823] leading-[1.1]"
      >
        What We Refuse
      </motion.h2>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        className="text-2xl sm:text-3xl md:text-4xl lg:text-[3.5rem] xl:text-[4.25rem] font-bold tracking-tight text-[#E5A823] leading-none mt-0.5 sm:mt-1"
      >
        To Compromise
      </motion.h2>
    </header>
  );
});

/**
 * Orbit Anchor Dot component for interactive phase selection around the 3D model.
 */
interface OrbitDotProps {
  isActive: boolean;
  positionClass: string;
  label: string;
  onClick: () => void;
  isLargeDot?: boolean;
}

const OrbitDot: React.FC<OrbitDotProps> = ({
  isActive,
  positionClass,
  label,
  onClick,
  isLargeDot = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Navigate to ${label}`}
      className={`absolute ${positionClass} z-30 p-2 cursor-pointer focus:outline-none rounded-full transition-transform duration-200 hover:scale-125`}
    >
      {isLargeDot ? (
        <div
          className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            isActive
              ? "border-[#E52320] bg-[#1a080a] scale-125 shadow-[0_0_16px_#E52320]"
              : "border-[#38bdf8] bg-[#0d1424] hover:scale-110"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-[#E52320] shadow-[0_0_10px_#E52320]"
                : "bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]"
            }`}
          />
        </div>
      ) : (
        <div
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-300 ${
            isActive
              ? "bg-[#E52320] shadow-[0_0_14px_#E52320] scale-150"
              : "bg-[#38bdf8] shadow-[0_0_8px_#38bdf8] hover:scale-125"
          }`}
        />
      )}
      {isActive && (
        <div className="absolute inset-0 m-auto w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[#E52320] animate-ping pointer-events-none" />
      )}
    </button>
  );
};

/**
 * Desktop Pillar Card rendering icon, title, and description lines.
 */
interface PillarBadgeProps {
  pillar: PillarItem;
  isActive: boolean;
  onSelect: () => void;
  extraClass?: string;
}

const PillarBadge: React.FC<PillarBadgeProps> = ({
  pillar,
  isActive,
  onSelect,
  extraClass = "",
}) => {
  const IconComponent = pillar.icon;

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`Select ${pillar.title} pillar`}
      className={`flex flex-col items-center text-center z-20 px-2 sm:px-4 cursor-pointer group transition-all duration-300 hover:scale-105 focus:outline-none ${extraClass}`}
    >
      {/* Circle Icon Container */}
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center border transition-all duration-300 mb-2 sm:mb-2.5 ${
          isActive
            ? "bg-[#1f1013] border-[#E52320] shadow-[0_0_20px_rgba(229,35,32,0.45)] scale-110"
            : "bg-[#141a26]/80 border-[#232d3f] hover:border-white/30"
        }`}
      >
        <IconComponent
          className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-colors duration-300 ${
            isActive ? "text-[#E52320]" : "text-[#E5A823]"
          }`}
        />
      </div>

      {/* Pillar Title */}
      <h3
        className={`text-xl sm:text-2xl lg:text-[1.85rem] xl:text-[2.25rem] font-bold mb-1 transition-all duration-300 ${
          isActive
            ? "text-[#E52320] drop-shadow-[0_0_14px_rgba(229,35,32,0.4)]"
            : "text-white group-hover:text-[#E5A823]"
        }`}
      >
        {pillar.title}
      </h3>

      {/* Pillar Subtitle Lines */}
      {pillar.lines.map((line, idx) => (
        <p
          key={idx}
          className={`text-xs sm:text-sm lg:text-base xl:text-[1.125rem] leading-[1.3] transition-colors duration-300 ${
            isActive ? "text-white font-medium" : "text-[#9098ab]"
          }`}
        >
          {line}
        </p>
      ))}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

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

  // Smooth scroll handler for clicking on any pillar or dot anchor
  const scrollToPhase = useCallback((phaseIndex: number) => {
    if (!containerRef.current) return;
    const containerTop =
      containerRef.current.getBoundingClientRect().top + window.scrollY;
    const containerHeight =
      containerRef.current.offsetHeight - window.innerHeight;
    const targetFraction = PHASE_TARGETS[phaseIndex] ?? 0;
    window.scrollTo({
      top: containerTop + targetFraction * containerHeight,
      behavior: "smooth",
    });
  }, []);

  const isQualityActive = activePhase === 0 || activePhase === 3;
  const isConvivialityActive = activePhase === 1;
  const isSpeedActive = activePhase === 2;

  const currentMobilePillar = useMemo(() => {
    if (activePhase === 1) return PILLARS.conviviality;
    if (activePhase === 2) return PILLARS.speed;
    return PILLARS.quality;
  }, [activePhase]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[300vh] bg-transparent ${matter.className}`}
    >
      {/* Sticky Viewport Container - Locks strictly to 100vh on all device heights */}
      <div className="sticky top-0 h-screen h-[100dvh] max-h-screen w-full flex flex-col justify-between items-center pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 lg:pb-8 px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto overflow-hidden select-none">
        {/* Ambient Glow Backdrops */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[650px] lg:w-[800px] h-[450px] sm:h-[650px] lg:h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[350px] h-[280px] sm:h-[350px] bg-amber-500/5 rounded-full blur-[110px] pointer-events-none" />

        {/* Section Header */}
        <SectionHeader />

        {/* Interactive Orbit Stage with 3D Model in Center */}
        <div className="relative w-full flex-1 flex flex-col justify-center items-center my-auto min-h-0 overflow-hidden">
          {/* DESKTOP LAYOUT (>= lg) */}
          <div className="hidden lg:flex w-full items-center justify-between gap-4 lg:gap-8 relative shrink-0 my-auto">
            {/* Left Pillar: Conviviality */}
            <div className="w-1/3 flex justify-center">
              <PillarBadge
                pillar={PILLARS.conviviality}
                isActive={isConvivialityActive}
                onSelect={() => scrollToPhase(1)}
              />
            </div>

            {/* Central Orbit Circle (Desktop) */}
            <div className="w-1/3 relative flex items-center justify-center shrink-0">
              <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[370px] xl:h-[370px] 2xl:w-[420px] 2xl:h-[420px] max-h-[38vh] max-w-[38vh] aspect-square flex items-center justify-center">
                {/* Thin Orbit Perimeter Rings */}
                <div className="absolute inset-0 rounded-full border-[1.5px] border-blue-400/30 shadow-[0_0_30px_rgba(56,189,248,0.18)] pointer-events-none" />
                <div className="absolute -inset-3 rounded-full border border-blue-500/10 pointer-events-none" />

                {/* Left Dot (Conviviality - 9 o'clock) */}
                <OrbitDot
                  isActive={isConvivialityActive}
                  positionClass="left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  label="Conviviality"
                  onClick={() => scrollToPhase(1)}
                />

                {/* Right Dot (Speed - 3 o'clock) */}
                <OrbitDot
                  isActive={isSpeedActive}
                  positionClass="right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
                  label="Speed"
                  onClick={() => scrollToPhase(2)}
                />

                {/* Bottom Dot (Quality - 6 o'clock) */}
                <OrbitDot
                  isActive={isQualityActive}
                  positionClass="bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                  label="Quality"
                  onClick={() => scrollToPhase(0)}
                  isLargeDot
                />

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
            <div className="w-1/3 flex justify-center">
              <PillarBadge
                pillar={PILLARS.speed}
                isActive={isSpeedActive}
                onSelect={() => scrollToPhase(2)}
              />
            </div>
          </div>

          {/* Desktop Bottom Pillar: Quality */}
          <div className="hidden lg:flex flex-col items-center text-center shrink-0 z-20 mt-2 xl:mt-3">
            <PillarBadge
              pillar={PILLARS.quality}
              isActive={isQualityActive}
              onSelect={() => scrollToPhase(0)}
            />
          </div>

          {/* MOBILE & TABLET LAYOUT (< lg) */}
          <div className="flex lg:hidden flex-col items-center justify-center w-full my-auto shrink-0">
            {/* Center Orbit Ring */}
            <div className="relative w-[210px] h-[210px] sm:w-[260px] sm:h-[260px] md:w-[300px] md:h-[300px] max-h-[32vh] aspect-square flex items-center justify-center mb-4 sm:mb-5">
              {/* Ring line */}
              <div className="absolute inset-0 rounded-full border-[1.5px] border-blue-400/30 shadow-[0_0_20px_rgba(56,189,248,0.18)] pointer-events-none" />

              {/* Left Anchor Dot (Conviviality) */}
              <OrbitDot
                isActive={isConvivialityActive}
                positionClass="left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
                label="Conviviality"
                onClick={() => scrollToPhase(1)}
              />

              {/* Right Anchor Dot (Speed) */}
              <OrbitDot
                isActive={isSpeedActive}
                positionClass="right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
                label="Speed"
                onClick={() => scrollToPhase(2)}
              />

              {/* Bottom Anchor Dot (Quality) */}
              <OrbitDot
                isActive={isQualityActive}
                positionClass="bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                label="Quality"
                onClick={() => scrollToPhase(0)}
                isLargeDot
              />

              {/* 3D Model / Fallback Image Canvas */}
              <div className="relative w-full h-full z-10 flex items-center justify-center">
                <FriedChickenCanvas
                  activePhase={activePhase}
                  scrollProgress={scrollProgress}
                />
              </div>
            </div>

            {/* Mobile Active Pillar Text below orbit ring */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMobilePillar.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center text-center px-4"
              >
                <h3 className="text-2xl sm:text-3xl font-bold mb-1.5 text-[#E52320] drop-shadow-[0_0_12px_rgba(229,35,32,0.4)]">
                  {currentMobilePillar.title}
                </h3>
                {currentMobilePillar.lines.map((line, idx) => (
                  <p
                    key={idx}
                    className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed"
                  >
                    {line}
                  </p>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Floor Ambient Reflection */}
        <div className="w-full h-4 bg-gradient-to-t from-transparent via-blue-900/10 to-transparent blur-lg pointer-events-none shrink-0" />
      </div>
    </div>
  );
};

export default WhatWeRefuse;