"use client";

import React from "react";
import Image from "next/image";
import { Users, Rabbit, Star, X } from "lucide-react";
import { matter } from "@/font/fonts";
import { motion, AnimatePresence } from "framer-motion";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

/* ── Orbit configuration ── */
const ORBIT_RX = 400;       // horizontal radius (px)
const ORBIT_RY = 240;       // vertical radius (px)
const ORBIT_PERIOD = 38000;  // ms per full revolution

interface RefuseCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  widthClass: string;
  offset: number;
}

const CARDS: RefuseCard[] = [
  {
    id: "speed",
    icon: Rabbit,
    title: "Speed",
    description: "Fast Food Should Be Fast And Still Be Food.",
    widthClass: "w-[270px] lg:w-[310px]",
    offset: 330, // Top-right when baseAngle = 0
  },
  {
    id: "quality",
    icon: Star,
    title: "Quality",
    description: "If It's Not Crispy Enough To Hear, It Doesn't Leave The Kitchen.",
    widthClass: "w-[270px] lg:w-[310px]",
    offset: 90, // Bottom-center (front foreground) when baseAngle = 0
  },
  {
    id: "conviviality",
    icon: Users,
    title: "Conviviality",
    description: "Great Meals Are Meant To Be Shared. So Is A Good Time.",
    widthClass: "w-[290px] lg:w-[330px]",
    offset: 210, // Top-left when baseAngle = 0
  },
];

const WhatWeRefuse: React.FC = () => {
  const [isDesktop, setIsDesktop] = React.useState<boolean | null>(null);
  const [activeCard, setActiveCard] = React.useState<number | null>(null);

  /* ── Mobile single-card slider state ── */
  const [mobileIndex, setMobileIndex] = React.useState(0);
  const [isMobilePaused, setIsMobilePaused] = React.useState(false);
  const [slideDirection, setSlideDirection] = React.useState<1 | -1>(1);

  // Auto-advance interval for mobile slider (4 seconds)
  React.useEffect(() => {
    if (isDesktop === true || isMobilePaused) return;

    const timer = setInterval(() => {
      setSlideDirection(1);
      setMobileIndex((prev) => (prev + 1) % CARDS.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isDesktop, isMobilePaused]);

  const handleNextMobile = React.useCallback(() => {
    setSlideDirection(1);
    setMobileIndex((prev) => (prev + 1) % CARDS.length);
  }, []);

  const handlePrevMobile = React.useCallback(() => {
    setSlideDirection(-1);
    setMobileIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
  }, []);

  const handleSelectMobile = React.useCallback((idx: number) => {
    setSlideDirection(idx > mobileIndex ? 1 : -1);
    setMobileIndex(idx);
  }, [mobileIndex]);

  /* ── Orbit animation refs ── */
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const angleRef = React.useRef(0);
  const targetAngleRef = React.useRef(0);
  const isRotatingToTargetRef = React.useRef(false);
  const lastTimeRef = React.useRef(0);
  const isPausedRef = React.useRef(false);
  const hoveredCardRef = React.useRef<number | null>(null);
  const activeCardRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── 3D Elliptical orbit carousel driven by requestAnimationFrame ── */
  React.useEffect(() => {
    if (!isDesktop) return;

    lastTimeRef.current = 0;
    let animId: number;

    const animate = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;

      const dt = Math.min(now - lastTimeRef.current, 100);
      lastTimeRef.current = now;

      // When a card is clicked, smoothly rotate the carousel to align it at front-center (90°)
      if (isRotatingToTargetRef.current) {
        const angleDiff = targetAngleRef.current - angleRef.current;
        const lerp = 1 - Math.exp(-dt * 0.007);
        angleRef.current += angleDiff * lerp;

        if (Math.abs(angleDiff) < 0.15) {
          angleRef.current = targetAngleRef.current;
          isRotatingToTargetRef.current = false;
        }
      } else if (!isPausedRef.current && activeCardRef.current === null) {
        // Continuous gentle orbit
        angleRef.current += (dt / ORBIT_PERIOD) * 360;
      }

      const baseAngle = angleRef.current;
      const focusedIdx = activeCardRef.current;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const angleDeg = (baseAngle + CARDS[i].offset) % 360;
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = ORBIT_RX * Math.cos(angleRad);
        const y = ORBIT_RY * Math.sin(angleRad);

        // Depth scale: larger when closer to camera (sin > 0 at bottom front)
        const depthScale = 1 + 0.09 * Math.sin(angleRad);
        const isAtFront = Math.sin(angleRad) > 0.25;
        const isFocused = focusedIdx === i;

        // Dynamic z-index layering:
        // - Focused card stopped at front: highest (60)
        // - Hovered card: 50
        // - Front cards: 35 (always above Chicken GIF z-20 so spices/chilies never overlap)
        // - Back cards: 5..14 (behind Chicken GIF z-20 for authentic 3D depth)
        let z: number;
        if (isFocused) {
          z = 60;
        } else if (hoveredCardRef.current === i) {
          z = 50;
        } else if (isAtFront) {
          z = 35;
        } else {
          z = Math.round(5 + 8 * ((Math.sin(angleRad) + 1) / 2));
        }

        el.style.transform = `translate(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px)) scale(${depthScale.toFixed(3)})`;
        el.style.zIndex = `${z}`;
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isDesktop]);

  /** Resume continuous orbit */
  const resumeOrbit = React.useCallback(() => {
    if (activeCardRef.current !== null) {
      activeCardRef.current = null;
      isRotatingToTargetRef.current = false;
      isPausedRef.current = hoveredCardRef.current !== null;
      setActiveCard(null);
    }
  }, []);

  /** Click card to rotate it to front-center (90°) and stop there, or toggle to resume */
  const handleCardClick = React.useCallback((cardIndex: number, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (activeCardRef.current === cardIndex) {
      // Toggle off -> resume orbit
      activeCardRef.current = null;
      isRotatingToTargetRef.current = false;
      isPausedRef.current = hoveredCardRef.current !== null;
      setActiveCard(null);
      return;
    }

    // Normalize angle helper
    const normalize = (deg: number) => ((deg % 360) + 360) % 360;
    const cardCurrentAngle = normalize(angleRef.current + CARDS[cardIndex].offset);
    // Shortest angular difference to reach 90° (front-center)
    const diff = ((90 - cardCurrentAngle) % 360 + 540) % 360 - 180;

    targetAngleRef.current = angleRef.current + diff;
    isRotatingToTargetRef.current = true;
    activeCardRef.current = cardIndex;
    setActiveCard(cardIndex);
  }, []);

  /** Pause orbit on card hover */
  const handleCardHover = React.useCallback((cardIndex: number, hovering: boolean) => {
    hoveredCardRef.current = hovering ? cardIndex : null;
    if (activeCardRef.current === null && !isRotatingToTargetRef.current) {
      isPausedRef.current = hovering;
    }
  }, []);

  /** Close/resume on Escape key */
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeCardRef.current !== null) {
        resumeOrbit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resumeOrbit]);

  return (
    <section
      onClick={resumeOrbit}
      className={`relative w-full min-h-screen py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between overflow-hidden select-none ${matter.className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 text-center mt-8 sm:mt-12 md:mt-20 mb-4 sm:mb-6 lg:mb-2 pointer-events-none">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-extrabold tracking-tight text-[#FFBF00] leading-none drop-shadow-md">
          What We Refuse
        </h2>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-extrabold tracking-tight text-[#FFBF00] leading-none mt-1 sm:mt-2 drop-shadow-md">
          To Compromise
        </h2>
      </header>

      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (>= lg): Floating Scene with Orbit GIF & Surrounding Cards */}
      {/* ========================================================================= */}
      <div
        className="hidden lg:flex max-w-7xl relative w-full h-[650px] lg:h-[700px] items-center justify-center my-auto cursor-default"
        onClick={resumeOrbit}
      >
        {/* CENTER FRIED CHICKEN GIF (Rendered ONLY on desktop to prevent duplicate decoding in RAM) */}
        {isDesktop !== false && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[420px] lg:w-[920px] aspect-[16/9] flex items-center justify-center pointer-events-none select-none">
            <Image
              src="/CHICKEN-orbit.gif"
              alt="Crispy Fried Chicken Orbit"
              fill
              unoptimized
              className="object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.9)] pointer-events-none select-none"
            />
          </div>
        )}

        {/* ORBITING CARDS — animated via requestAnimationFrame in useEffect */}
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          const isActive = activeCard === i;
          const hasActive = activeCard !== null;

          return (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute top-1/2 left-1/2 group pointer-events-auto cursor-pointer will-change-transform select-none"
              onMouseEnter={() => handleCardHover(i, true)}
              onMouseLeave={() => handleCardHover(i, false)}
              onClick={(e) => handleCardClick(i, e)}
            >
              <div
                className={`${card.widthClass} relative backdrop-blur-xl rounded-2xl p-6 transition-[border-color,box-shadow,background-color,opacity] duration-300 ${
                  isActive
                    ? "bg-[#1d232e]/95 border-2 border-[#FFBF00] shadow-[0_0_40px_rgba(255,191,0,0.35),0_25px_60px_rgba(0,0,0,0.95)] ring-2 ring-[#FFBF00]/30"
                    : hasActive
                    ? "bg-[#1d232e]/75 border border-white/15 opacity-65 hover:opacity-100 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                    : "bg-[#1d232e]/75 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] group-hover:border-[#FFBF00]/60 group-hover:shadow-[0_0_35px_rgba(255,191,0,0.25)]"
                }`}
              >
                {/* Header with Icon and Close Button */}
                <div className="flex items-start justify-between mb-4">
                  <Icon
                    className={`w-8 h-8 stroke-[1.5] transition-colors duration-300 ${
                      isActive ? "text-[#FFBF00]" : "text-white"
                    }`}
                  />
                  {/* {isActive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resumeOrbit();
                      }}
                      className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                      aria-label="Close"
                      title="Resume orbit"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )} */}
                </div>

                <h3 className="text-2xl lg:text-[2.25rem] font-bold text-white mb-2 leading-tight">
                  {card.title}
                </h3>
                <p className="text-sm lg:text-base text-neutral-300 font-normal leading-[1.35]">
                  {card.description}
                </p>

                {/* {isActive && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#FFBF00]/90">
                    <span className="font-semibold tracking-wide">CF&amp;CO Principle</span>
                    <span className="text-neutral-400">Click to resume orbit</span>
                  </div>
                )} */}
              </div>
            </div>
          );
        })}
      </div>


      <div className="flex lg:hidden flex-col items-center w-full max-w-lg mx-auto z-10 mt-2 sm:mt-0">
        {/* Mobile Graphic Centerpiece */}
        <div className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-center overflow-hidden my-2">
          {/* Fried Chicken GIF (Rendered ONLY on mobile/tablet to prevent duplicate decoding) */}
          {isDesktop !== true && (
            <div className="relative w-[340px] sm:w-[320px] aspect-square z-10 flex items-center justify-center pointer-events-none">
              <Image
                src="/chicken-orbit-v2.gif"
                alt="Crispy Fried Chicken Orbit"
                fill
                unoptimized
                className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] pointer-events-none"
              />
            </div>
          )}
        </div>

        {/* Mobile Single Card Slider with Indicator */}
        <div
          className="relative w-full px-2 mt-2 z-40 max-w-[390px] flex flex-col items-center"
          onMouseEnter={() => setIsMobilePaused(true)}
          onMouseLeave={() => setIsMobilePaused(false)}
          onTouchStart={() => setIsMobilePaused(true)}
          onTouchEnd={() => setIsMobilePaused(false)}
        >
          {/* Card Showcase with AnimatePresence */}
          <div className="relative w-full min-h-[195px] sm:min-h-[210px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={CARDS[mobileIndex].id}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -40 || info.velocity.x < -150) {
                    handleNextMobile();
                  } else if (info.offset.x > 40 || info.velocity.x > 150) {
                    handlePrevMobile();
                  }
                }}
                className="w-full relative backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.7)] text-left bg-[#1d232e]/95 border border-[#FFBF00]/50 shadow-[0_0_30px_rgba(255,191,0,0.22)] cursor-grab active:cursor-grabbing overflow-hidden"
              >
                {/* Auto-advance progress line at top edge of card */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
                  <motion.div
                    key={`bar-${mobileIndex}-${isMobilePaused}`}
                    initial={{ width: "0%" }}
                    animate={{ width: isMobilePaused ? undefined : "100%" }}
                    transition={{ duration: 4.0, ease: "linear" }}
                    className="h-full bg-[#FFBF00]"
                  />
                </div>

                {/* Card Header with Icon and Principle number */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFBF00]/10 border border-[#FFBF00]/25 flex items-center justify-center">
                      {React.createElement(CARDS[mobileIndex].icon, {
                        className: "w-5 h-5 stroke-[1.8] text-[#FFBF00]",
                      })}
                    </div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#FFBF00]/90">
                      CF&amp;CO Principle 0{mobileIndex + 1}
                    </span>
                  </div>
                  {/* <span className="text-xs font-mono text-white/50">
                    {mobileIndex + 1} / {CARDS.length}
                  </span> */}
                </div>

                <h3 className="text-2xl sm:text-[1.75rem] font-bold text-white mb-2 leading-tight">
                  {CARDS[mobileIndex].title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 font-normal leading-[1.35]">
                  {CARDS[mobileIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider Indicators and Arrow Controls */}
          <div className="flex items-center justify-center gap-3 mt-4 z-40">
            {/* <button
              type="button"
              onClick={handlePrevMobile}
              aria-label="Previous card"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button> */}

            {/* Indicator Dots */}
            <div className="flex items-center gap-2">
              {CARDS.map((c, i) => {
                const isActive = i === mobileIndex;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectMobile(i)}
                    aria-label={`Go to ${c.title}`}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "w-8 bg-[#FFBF00] shadow-[0_0_12px_rgba(255,191,0,0.7)]"
                        : "w-2.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                );
              })}
            </div>

            {/* <button
              type="button"
              onClick={handleNextMobile}
              aria-label="Next card"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeRefuse;