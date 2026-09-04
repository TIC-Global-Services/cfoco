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

// -----------------------------------------------------------------------------
// Domain Types & Data Models
// -----------------------------------------------------------------------------

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
 * Section title header component with golden text and motion intro.
 */
const SectionHeader = React.memo(function SectionHeader() {
  return (
    <header className="w-full text-center z-20 shrink-0 mb-2 sm:mb-4">
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-bold tracking-tight text-[#E5A823] leading-[1.12]"
      >
        What We Refuse
      </motion.h2>
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.25rem] xl:text-[5rem] font-bold tracking-tight text-[#E5A823] leading-none"
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
      className={`absolute ${positionClass} z-30 p-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52320] rounded-full transition-transform duration-200 hover:scale-125`}
    >
      {isLargeDot ? (
        <div
          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            isActive
              ? "border-[#E52320] bg-[#1a080a] scale-125 shadow-[0_0_18px_#E52320]"
              : "border-[#38bdf8] bg-[#0d1424] hover:scale-110"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-[#E52320] shadow-[0_0_12px_#E52320]"
                : "bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]"
            }`}
          />
        </div>
      ) : (
        <div
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
            isActive
              ? "bg-[#E52320] shadow-[0_0_16px_#E52320] scale-150"
              : "bg-[#38bdf8] shadow-[0_0_8px_#38bdf8] hover:scale-125"
          }`}
        />
      )}
      {isActive && (
        <div className="absolute inset-0 m-auto w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-[#E52320] animate-ping pointer-events-none" />
      )}
    </button>
  );
};

/**
 * Desktop Pillar Card rendering icon, bold title, and description text.
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
      className={`w-full flex flex-col items-center text-center z-20 px-3 sm:px-5 cursor-pointer group transition-transform duration-300 hover:scale-105 focus:outline-none ${extraClass}`}
    >
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center border transition-all duration-300 mb-2 sm:mb-3 ${
          isActive
            ? "bg-[#1f1013] border-[#E52320] shadow-[0_0_24px_rgba(229,35,32,0.5)] scale-110"
            : "bg-[#95C1E20A]/80 border-[#00000033] border-2 hover:border-white/25"
        }`}
      >
        <IconComponent
          className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-colors duration-300 ${
            isActive ? "text-[#E52320]" : "text-[#E5A823]"
          }`}
        />
      </div>
      <h3
        className={`text-2xl sm:text-3xl lg:text-[2.25rem] xl:text-[2.75rem] font-bold mb-1.5 transition-all duration-300 ${
          isActive
            ? "text-[#E52320] scale-105 drop-shadow-[0_0_18px_rgba(229,35,32,0.4)]"
            : "text-white group-hover:text-[#E5A823]"
        }`}
      >
        {pillar.title}
      </h3>
      {pillar.lines.map((line, idx) => (
        <p
          key={idx}
          className={`text-sm sm:text-base lg:text-lg xl:text-[22px] leading-[1.35] transition-colors duration-300 ${
            isActive ? "text-white font-medium" : "text-[#A0A5B5]"
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
      {/* Sticky Viewport Container - Flexible min-h-screen layout with full unconstrained typography */}
      <div className="sticky top-0 min-h-screen w-full flex flex-col justify-between pt-10 sm:pt-14 md:pt-18 lg:pt-20 pb-6 sm:pb-8 md:pb-10 px-4 sm:px-6 lg:px-8 select-none">
        {/* Ambient Glow Backdrops */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] lg:w-[850px] h-[500px] sm:h-[700px] lg:h-[850px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[380px] h-[300px] sm:h-[380px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Section Header */}
        <SectionHeader />

        {/* Interactive Orbit Stage with 3D Model in Center */}
        <div className="relative w-full flex-1 flex flex-col justify-center items-center my-auto">
          {/* DESKTOP & TABLET LAYOUT (>= lg) */}
          <div className="hidden lg:flex w-full items-center justify-between gap-4 lg:gap-6 relative shrink-0">
            {/* Left Pillar: Conviviality */}
            <PillarBadge
              pillar={PILLARS.conviviality}
              isActive={isConvivialityActive}
              onSelect={() => scrollToPhase(1)}
              extraClass="order-1"
            />

            {/* Central Orbit Circle (Desktop) */}
            <div className="relative flex items-center justify-center order-2 shrink-0">
              <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[380px] lg:h-[380px] xl:w-[430px] xl:h-[430px] 2xl:w-[480px] 2xl:h-[480px] flex items-center justify-center">
                {/* Thin Orbit Perimeter Rings */}
                <div className="absolute inset-0 rounded-full border-[1.5px] border-blue-400/35 shadow-[0_0_35px_rgba(56,189,248,0.2)] pointer-events-none" />
                <div className="absolute -inset-3 sm:-inset-4 rounded-full border border-blue-500/10 pointer-events-none" />

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
            <PillarBadge
              pillar={PILLARS.speed}
              isActive={isSpeedActive}
              onSelect={() => scrollToPhase(2)}
              extraClass="order-3"
            />
          </div>

          {/* Desktop Bottom Pillar: Quality */}
          <div className="hidden lg:flex flex-col items-center text-center shrink-0 z-20 mt-3 sm:mt-4 lg:mt-5">
            <PillarBadge
              pillar={PILLARS.quality}
              isActive={isQualityActive}
              onSelect={() => scrollToPhase(0)}
            />
          </div>

          {/* MOBILE LAYOUT (< lg) */}
          <div className="flex lg:hidden flex-col items-center justify-center w-full my-auto shrink-0">
            {/* Center Orbit Ring */}
            <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] flex items-center justify-center mb-5 sm:mb-6">
              {/* Ring line */}
              <div className="absolute inset-0 rounded-full border-[1.5px] border-blue-400/35 shadow-[0_0_25px_rgba(56,189,248,0.2)] pointer-events-none" />

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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center px-4"
              >
                <h3 className="text-3xl font-bold mb-2 text-[#E52320] drop-shadow-[0_0_15px_rgba(229,35,32,0.4)]">
                  {currentMobilePillar.title}
                </h3>
                {currentMobilePillar.lines.map((line, idx) => (
                  <p
                    key={idx}
                    className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed"
                  >
                    {line}
                  </p>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Floor Ambient Reflection */}
        <div className="w-full h-6 bg-gradient-to-t from-transparent via-blue-900/10 to-transparent blur-xl pointer-events-none shrink-0" />
      </div>
    </div>
  );
};

export default WhatWeRefuse;