"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { matter } from "@/font/fonts";
import { locationsData, LocationData } from "@/data/locations";
import { MapPin, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";



const StepInside = () => {
  const total = locationsData.length;

  // We render 3 copies: [set0][set1][set2]. The "real" center set is set1.
  // virtualIndex tracks position inside the full tripled array.
  // It starts in the middle set at index `total` (i.e. first item of set1).
  const [virtualIndex, setVirtualIndex] = useState<number>(total);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [])

  // The real data index (0..total-1) for map pin & detail card
  const realIndex = ((virtualIndex % total) + total) % total;
  const activeLocation: LocationData = locationsData[realIndex] || locationsData[0];
  // Constants for the carousel track
  const ITEM_WIDTH = isMobile ? 210 : 380; // px width of each slot
  const ITEM_GAP = 20;    // px gap between items
  const STEP = ITEM_WIDTH + ITEM_GAP; // total distance per item
  // Tripled list for seamless looping
  const tripled = [...locationsData, ...locationsData, ...locationsData];

  // After a transition ends, silently snap back to the middle set if we drifted out
  const handleTransitionEnd = useCallback(() => {
    if (virtualIndex < total || virtualIndex >= total * 2) {
      // Disable transition, snap to equivalent position in middle set
      setIsTransitioning(false);
      setVirtualIndex(total + realIndex);
    }
  }, [virtualIndex, total, realIndex]);

  // Re-enable transition after a snap reset
  useEffect(() => {
    if (!isTransitioning) {
      // Use requestAnimationFrame to ensure the snap is painted before re-enabling transition
      const raf = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  // Auto-advance every 3.5s
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setVirtualIndex((prev) => prev + 1);
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = () => {
    setVirtualIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setVirtualIndex((prev) => prev + 1);
  };

  // Click any visible item to make it center
  const handleItemClick = (tripledIdx: number) => {
    setVirtualIndex(tripledIdx);
  };

  // Touch Swipe Handling for Mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 30; // threshold in px

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // Track transform: shift so that virtualIndex item is centered
  const trackTranslateX = `calc(-${virtualIndex * STEP}px - ${ITEM_WIDTH / 2}px)`;

  return (
    <section
      className={`relative w-full py-8 sm:py-12 md:py-10 px-0 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden select-none min-h-screen ${matter.className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Pulse keyframes for the active beacon */}
      <style>{`
        @keyframes beacon-pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.7;
          }
          70% {
            transform: translate(-50%, -50%) scale(3.5);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(3.5);
            opacity: 0;
          }
        }
        @keyframes beacon-pulse-outer {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.4;
          }
          70% {
            transform: translate(-50%, -50%) scale(5);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(5);
            opacity: 0;
          }
        }
        @keyframes beacon-glow {
          0%, 100% {
            box-shadow: 0 0 6px 2px rgba(255, 191, 0, 0.6), 0 0 16px 4px rgba(255, 191, 0, 0.25);
          }
          50% {
            box-shadow: 0 0 10px 4px rgba(255, 191, 0, 0.8), 0 0 24px 8px rgba(255, 191, 0, 0.35);
          }
        }
        .beacon-ring-1 {
          animation: beacon-pulse 2s ease-out infinite;
        }
        .beacon-ring-2 {
          animation: beacon-pulse-outer 2s ease-out 0.4s infinite;
        }
        .beacon-dot {
          animation: beacon-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center text-center max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6 md:mb-8 px-[5%] sm:px-0">
          {/* Title */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] font-extrabold tracking-tight text-[#FFBF00] drop-shadow-sm">
            Step Inside.
          </h2>

          {/* Subtitle - exactly 2 lines on desktop */}
          <p className="mt-3 md:max-w-5xl mx-auto text-base md:text-2xl text-neutral-300 font-normal leading-[1.3]">
            Same Recipe, Same Crispy Standard, But <br className="sm:hidden"/> Every CFC Takes On The Character Of Its Neighbourhood.
            Pick A City, Or Let Us Find The One Closest To You.
          </p>
        </div>

        {/* World Map with Animated Moving Pinpoint & Detail Card */}
        <div className="relative w-full my-4 sm:my-6 flex items-center justify-center">
          <div className="relative w-full aspect-[2.1/1] max-h-[280px] sm:max-h-[340px] md:max-h-[400px]">
            <Image
              src="/new-map.png"
              alt="CFC Global Locations World Map"
              fill
              className="object-cover md:object-contain opacity-90 transition-opacity duration-500 hover:opacity-100"
              priority
            />

            {/* ACTIVE PINPOINT — Visible beacon dot + pulsing rings + detail card */}
            <div
              className="absolute transition-all duration-700 ease-out z-30"
              style={{
                top: activeLocation.mapCoords.top,
                left: activeLocation.mapCoords.left,
              }}
            >
              
              <span
                className="beacon-ring-2 absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-[#FFBF00]/30 pointer-events-none"
              />
              <span
                className="beacon-ring-1 absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-[#FFBF00]/50 pointer-events-none"
              />
              {/* Solid center dot */}
              <span
                className="beacon-dot absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FFBF00] z-[2] pointer-events-none"
              />

              {/* ===== FLOATING DETAIL CARD (below the dot so it never overlaps top text) ===== */}
              <div className="absolute left-1/2 -translate-x-1/2 top-4 sm:top-5 flex flex-col items-center pointer-events-auto z-40">
                {/* Connector line from dot down to card */}
                <div className="w-px h-3 bg-gradient-to-b from-[#FFBF00] to-[#1e82e6]" />

                <div className="w-[220px] sm:w-[270px] bg-[#3a3f47] text-white rounded-2xl p-2.5 sm:p-3.5 border border-[#1e82e6] shadow-[0_14px_40px_rgba(0,0,0,0.85)] text-left transition-all duration-300">
                  {/* City / Tag Header */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFBF00] fill-[#FFBF00] shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white truncate">
                      {activeLocation.cityTag}
                    </span>
                  </div>

                  {/* Location Title */}
                  <h4 className="text-sm sm:text-base font-bold text-[#FFBF00] leading-snug">
                    CFC {activeLocation.name}
                  </h4>

                  {/* Address preview */}
                  <p className="text-[11px] sm:text-xs text-slate-200 font-normal mt-0.5 mb-2.5 leading-tight line-clamp-2">
                    {activeLocation.address}
                  </p>

                  {/* Action Link Button */}
                  <div>
                    <Link
                      href={`/location/${activeLocation.slug}`}
                      className="inline-flex items-center gap-1.5 bg-[#96a0ad] hover:bg-[#a5afbc] transition-colors rounded-full pl-3 pr-1 py-0.5 group"
                    >
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#1a212d]">
                        EXPLORE
                      </span>
                      <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-[#18202d] flex items-center justify-center text-white transition-transform group-hover:scale-105">
                        <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INFINITE LOOPING CENTER-HIGHLIGHTED CAROUSEL */}
        <div className="w-full relative py-0 px-0 sm:px-12 flex items-center justify-center max-w-4xl mt-2 sm:mt-0">
          {/* Previous / Next Arrow Controls (Desktop only) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Location"
            className="hidden md:flex absolute left-2 sm:left-4 z-30 p-2 cursor-pointer rounded-full border border-white/10 hover:border-[#FFBF00]/50 bg-black/30 hover:bg-black/50 text-neutral-400 hover:text-[#FFBF00] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Location"
            className="hidden md:flex absolute right-2 sm:right-4 z-30 p-2 cursor-pointer rounded-full border border-white/10 hover:border-[#FFBF00]/50 bg-black/30 hover:bg-black/50 text-neutral-400 hover:text-[#FFBF00] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Carousel Viewport with Touch Drag/Swipe Support */}
          <div
            className="relative w-full h-20 sm:h-20 md:h-24 flex items-center justify-center overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              ref={trackRef}
              className={`flex items-center absolute left-1/2 ${isTransitioning
                ? "transition-transform duration-500 ease-out"
                : ""
                }`}
              style={{
                gap: `${ITEM_GAP}px`,
                transform: `translate3d(${trackTranslateX}, 0, 0)`,
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {tripled.map((loc, tripledIdx) => {
                const isCenter = tripledIdx === virtualIndex;

                return (
                  <div
                    key={`${loc.slug}-${tripledIdx}`}
                    onClick={() => handleItemClick(tripledIdx)}
                    style={{ width: `${ITEM_WIDTH}px` }}
                    className="shrink-0 flex flex-col items-center justify-center cursor-pointer px-2 py-1"
                  >
                    {isCenter ? (
                      <Link
                        href={`/location/${loc.slug}`}
                        className="group flex flex-col items-center justify-center transition-all duration-500 scale-105 sm:scale-110 py-1"
                      >
                        <span className="whitespace-nowrap text-4xl sm:text-3xl md:text-[50px] font-black tracking-tight text-[#F6B90B] transition-transform duration-300 group-hover:scale-105 leading-none">
                          {loc.name}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex flex-col items-center justify-center opacity-30 hover:opacity-75 transition-all duration-300 scale-90 sm:scale-95 py-1">
                        <span className="whitespace-nowrap text-2xl sm:text-xl md:text-3xl font-bold tracking-tight text-neutral-400 hover:text-white transition-colors leading-none">
                          {loc.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepInside;
