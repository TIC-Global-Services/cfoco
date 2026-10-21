"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Users, Rabbit, Star } from "lucide-react";
import { matter } from "@/font/fonts";
import { motion, AnimatePresence } from "framer-motion";

interface PrincipleCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const CARDS: PrincipleCard[] = [
  {
    id: "speed",
    icon: Rabbit,
    title: "Speed",
    description: "Fast Food Should Be Fast And Still Be Food.",
  },
  {
    id: "conviviality",
    icon: Users,
    title: "Conviviality",
    description: "Great Meals Are Meant To Be Shared. So Is A Good Time.",
  },
  {
    id: "quality",
    icon: Star,
    title: "Quality",
    description: "If It's Not Crispy Enough To Hear, It Doesn't Leave The Kitchen.",
  },
];

const AUTOPLAY_INTERVAL = 4000; // 4 seconds per tab

const WhatWeRefuse: React.FC = () => {
  // Default to 1 (Conviviality in the middle, matching the reference screenshot)
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check viewport width for responsive card spacing
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Automatic tab rotation timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % CARDS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
  }, []);

  const handleSelect = useCallback((idx: number) => {
    setActiveIndex(idx);
  }, []);

  /**
   * Calculate slot for each card relative to activeIndex:
   *  0  -> Center (Selected)
   * -1  -> Left
   * +1  -> Right
   */
  const getSlot = (idx: number): -1 | 0 | 1 => {
    const diff = idx - activeIndex;
    if (diff === 0) return 0;
    if (diff === 1 || diff === -2) return 1;
    return -1;
  };

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <section
      aria-label="What We Refuse To Compromise"
      className={`relative w-full py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between overflow-hidden select-none ${matter.className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(255,191,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 55%, rgba(255,191,0,0.11) 0%, rgba(20,30,50,0.2) 45%, transparent 75%)",
        }}
      />

      {/* Glossy floor reflection like the reference studio lighting */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] max-w-5xl h-36 rounded-full pointer-events-none blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,191,0,0.2) 0%, rgba(30,58,138,0.22) 45%, transparent 75%)",
        }}
      />

      {/* ── HEADER ── */}
      <header className="relative z-20 text-center max-w-3xl mx-auto flex flex-col items-center pointer-events-none">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold tracking-tight text-[#FFBF00] leading-none drop-shadow-[0_4px_16px_rgba(255,191,0,0.22)]">
          What We Refuse
        </h2>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold tracking-tight text-[#FFBF00] leading-none mt-1 sm:mt-1.5 drop-shadow-[0_4px_16px_rgba(255,191,0,0.22)]">
          To Compromise
        </h2>

        {/* Ornamental Gold Divider with Center Diamond */}
        <div className="flex items-center justify-center gap-2.5 my-3 sm:my-3.5">
          <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-[#FFBF00]/70 to-[#FFBF00]" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#FFBF00] shadow-[0_0_8px_#FFBF00]" />
          <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-l from-transparent via-[#FFBF00]/70 to-[#FFBF00]" />
        </div>

        {/* Subtitle */}
        <p className="text-neutral-400 text-xs sm:text-sm md:text-base font-normal text-center leading-[1.2] max-w-md sm:max-w-lg">
          We believe great food starts with non-negotiables.
          <br className="hidden sm:inline" />
          {" "}Here are the principles we stand by, every single day.
        </p>

        {/* Interactive Pill Tabs */}
        {/* <nav
          aria-label="Principles tabs"
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mt-4 shadow-[0_8px_25px_rgba(0,0,0,0.5)]"
        >
          {CARDS.map((card, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#FFBF00] text-black shadow-[0_0_16px_rgba(255,191,0,0.6)] scale-105"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {card.title}
              </button>
            );
          })}
        </nav> */}
      </header>

      {/* ── 3D OVERLAPPING CARDS CAROUSEL ── */}
      <div className="relative w-full max-w-6xl h-[420px] sm:h-[460px] md:h-[490px] flex items-center justify-center my-6 md:my-8">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          const slot = getSlot(i);
          const isSelected = slot === 0;

          // Responsive offsets:
          // Desktop: 310px, Tablet: 260px, Mobile: 190px
          const offsetPx = isMobile ? 190 : 305;
          const targetX = slot === 0 ? 0 : slot === -1 ? -offsetPx : offsetPx;

          return (
            <motion.div
              key={card.id}
              onClick={() => handleSelect(i)}
              initial={false}
              animate={{
                x: targetX,
                scale: isSelected ? 1.05 : 0.92,
                opacity: isSelected ? 1 : 0.72,
                zIndex: isSelected ? 35 : 15,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform cursor-pointer select-none"
            >
              {/* Card Container with Glassmorphism and Active Amber Highlight */}
              <div
                className={`w-[265px] xs:w-[290px] sm:w-[325px] md:w-[355px] lg:w-[375px] min-h-[375px] sm:min-h-[405px] md:min-h-[430px] rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-9 flex flex-col items-center justify-between text-center transition-all duration-500 ${
                  isSelected
                    ? "bg-gradient-to-b from-[#151c2a]/95 via-[#101623]/95 to-[#0b0e16]/98 border-2 border-[#FFBF00]/55 shadow-[0_0_40px_rgba(255,191,0,0.28),0_25px_65px_rgba(0,0,0,0.92)] ring-1 ring-[#FFBF00]/25 backdrop-blur-2xl"
                    : "bg-gradient-to-b from-[#111724]/85 via-[#0d121c]/85 to-[#080b12]/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] hover:border-white/20 backdrop-blur-xl"
                }`}
              >
                {/* Circular Neumorphic Icon Badge with Ambient Glow */}
                <div className="relative w-20 h-20 sm:w-34 sm:h-34 flex items-center justify-center my-2 shrink-0">
                  {/* Ambient Glow Halo */}
                  {/* <div
                    className={`absolute -inset-4 sm:-inset-6 rounded-full transition-all duration-500 pointer-events-none ${
                      isSelected
                        ? "bg-gradient-to-tr from-amber-500/45 via-yellow-400/35 to-amber-600/30 blur-2xl opacity-100 scale-125"
                        : "bg-amber-500/15 blur-xl opacity-40 scale-100"
                    }`}
                  /> */}

                  {/* Badge Disc */}
                  <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#1d273a] via-[#121927] to-[#0a0e17]  shadow-[inset_0_2px_4px_rgba(255,255,255,0.16),inset_0_-3px_6px_rgba(0,0,0,0.65),0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-center">
                    {/* Inner gold accent rim */}
                    {/* <div className="absolute inset-[3px] rounded-full border border-amber-400/15 pointer-events-none" /> */}

                    {/* Original Lucide Icon with Ambient Gold Color & Glow */}
                    <div className={`transition-transform duration-500 ${isSelected ? "scale-105" : "scale-95"}`}>
                      <Icon
                        className={`w-10 h-10 sm:w-20 sm:h-20 stroke-[1.8] text-[#FFBF00] transition-colors duration-300`}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Title */}
                <div className="flex flex-col items-center mt-10 mb-auto">
                  <h3 className="text-2xl sm:text-[1.85rem] lg:text-3xl font-bold text-white tracking-tight leading-tight">
                    {card.title}
                  </h3>

                  {/* Small Gold Accent Bar */}
                  <div
                    className={`w-7 sm:w-8 h-[2.5px] rounded-full my-2.5 sm:my-3 transition-all duration-500 ${
                      isSelected
                        ? "bg-[#FFBF00] shadow-[0_0_10px_rgba(255,191,0,0.8)] scale-110"
                        : "bg-[#FFBF00]/60"
                    }`}
                  />

                  {/* Principle Description */}
                  <p className="text-xs sm:text-sm lg:text-[0.95rem] text-neutral-300 font-normal leading-[1.2] max-w-[240px] sm:max-w-[260px] mx-auto">
                    {card.description}
                  </p>
                </div>

                {/* Card Footer Principle Indicator */}
                {/* <div className="mt-4 pt-3 border-t border-white/5 w-full flex items-center justify-center text-[11px] sm:text-xs">
                  {isSelected ? (
                    <span className="font-semibold text-[#FFBF00] tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFBF00] animate-pulse" />
                      CF&amp;CO Principle 0{i + 1}
                    </span>
                  ) : (
                    <span className="text-neutral-500 hover:text-neutral-300 transition-colors">
                      Click to focus
                    </span>
                  )}
                </div> */}
              </div>
            </motion.div>
          );
        })}
      </div>

     
      {/* <footer className="relative z-20 flex flex-col items-center gap-3">
        
        <div className="flex items-center gap-3">
          
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous principle"
            className="w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/15 hover:border-amber-400/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

        
          <div className="flex items-center gap-2 px-2">
            {CARDS.map((c, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  aria-label={`Go to ${c.title}`}
                  className={`relative h-2 rounded-full overflow-hidden transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "w-8 bg-[#FFBF00] shadow-[0_0_12px_rgba(255,191,0,0.8)]"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                >
                  
                  {isSelected && (
                    <motion.div
                      key={`progress-${activeIndex}-${isPaused}`}
                      initial={{ width: "0%" }}
                      animate={{ width: isPaused ? undefined : "100%" }}
                      transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
                      className="absolute inset-0 bg-white/40"
                    />
                  )}
                </button>
              );
            })}
          </div>

         
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next principle"
            className="w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/15 hover:border-amber-400/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

       
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400/80 font-mono tracking-wider uppercase">
          <span>{isPaused ? "Paused" : "Auto-rotating"}</span>
          <span className="text-[#FFBF00]">·</span>
          <span className="text-white/60">0{activeIndex + 1} / 03</span>
        </div>
      </footer> */}
    </section>
  );
};

export default WhatWeRefuse;