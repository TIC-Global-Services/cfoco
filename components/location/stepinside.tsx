"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { matter } from "@/font/fonts";
import { locationsData, LocationData } from "@/data/locations";
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Constants for the carousel track
const ITEM_WIDTH = 320; // px width of each slot
const ITEM_GAP = 20;    // px gap between items (gap-20 = 5rem = 80px)
const STEP = ITEM_WIDTH + ITEM_GAP; // total distance per item

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

  // The real data index (0..total-1) for map pin & detail card
  const realIndex = ((virtualIndex % total) + total) % total;
  const activeLocation: LocationData = locationsData[realIndex] || locationsData[0];

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

  // Track transform: shift so that virtualIndex item is centered
  const trackTranslateX = `calc(-${virtualIndex * STEP}px - ${ITEM_WIDTH / 2}px)`;

  return (
    <section
      className={`relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden select-none ${matter.className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#FFBF00]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center text-center">
       <div className="mb-10">
         {/* Title */}
        <h2 className="text-4xl sm:text-5xl md:text-[4.375rem] font-extrabold tracking-tight text-[#FFBF00] drop-shadow-sm">
          Step Inside.
        </h2>

        {/* Subtitle */}
        <p className="mt-4 max-w-4xl text-sm sm:text-base md:text-2xl text-neutral-300 font-normal leading-[1.2]">
          Same Recipe, Same Crispy Standard, But Every CFC Takes On The Character Of Its
          Neighbourhood. Pick A City, Or Let Us Find The One Closest To You.
        </p>

       </div>
        {/* World Map with Animated Moving Pinpoint & Detail Card */}
        <div className="relative w-full my-8 sm:mt-20 flex items-center justify-center">
          <div className="relative w-full aspect-[2/1] max-h-[380px]">
            <Image
              src="/step_inside.png"
              alt="CFC Global Locations World Map"
              fill
              className="object-contain opacity-90 transition-opacity duration-500 hover:opacity-100"
              priority
            />

            {/* Inactive kitchen anchor dots */}
            {locationsData.map((loc, i) => {
              if (i === realIndex) return null;
              return (
                <button
                  key={loc.slug}
                  type="button"
                  onClick={() => {
                    // Jump to this location in the middle set
                    setVirtualIndex(total + i);
                  }}
                  style={{
                    top: loc.mapCoords.top,
                    left: loc.mapCoords.left,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40 hover:bg-[#FFBF00] hover:scale-150 transition-all duration-300 cursor-pointer z-10"
                  title={loc.name}
                />
              );
            })}

            {/* ACTIVE MOVING PINPOINT BEACON & DETAIL CARD */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-30"
              style={{
                top: activeLocation.mapCoords.top,
                left: activeLocation.mapCoords.left,
              }}
            >
              {/* FLOATING PINPOINT DETAIL CARD */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-8 sm:bottom-10 flex flex-col items-center w-[230px] pointer-events-auto">
                <div className="w-full bg-black/90 backdrop-blur-xl text-white rounded-2xl p-3 sm:p-4 border border-[#FFBF00]/50 shadow-[0_10px_35px_rgba(0,0,0,0.9)] text-left transform transition-all duration-300 hover:scale-105">
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-[#FFBF00]">
                      <MapPin className="w-3.5 h-3.5 fill-[#FFBF00]" />
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        {activeLocation.cityTag}
                      </span>
                    </div>
                    {activeLocation.badge && (
                      <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-[#FFBF00]/15 text-[#FFBF00] font-semibold border border-[#FFBF00]/30">
                        {activeLocation.badge}
                      </span>
                    )}
                  </div>

                  {/* Location Title */}
                  <h4 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                    CFC {activeLocation.name}
                  </h4>

                  {/* Address preview */}
                  <p className="text-[11px] sm:text-xs text-neutral-300 font-light mt-1 line-clamp-1">
                    {activeLocation.address}
                  </p>

                  {/* Action Link to Slug Page */}
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400">
                      {activeLocation.stats?.capacity || "Dine-In & Takeaway"}
                    </span>
                    <Link
                      href={`/location/${activeLocation.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#FFBF00] hover:text-white transition-colors group"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Downward triangle pointer notch */}
                <div className="w-3 h-3 bg-black/90 border-r border-b border-[#FFBF00]/50 transform rotate-45 -mt-1.5 shadow-md" />
              </div>
            </div>
          </div>
        </div>

        {/* INFINITE LOOPING CENTER-HIGHLIGHTED CAROUSEL */}
        <div className="w-full relative py-0 px-4 sm:px-12 flex items-center justify-center max-w-5xl">
          {/* Previous / Next Arrow Controls */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Location"
            className="absolute left-2 sm:left-4 z-30 p-2 sm:p-2.5 rounded-full border border-white/10 hover:border-[#FFBF00]/50 text-neutral-400 hover:text-[#FFBF00] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Location"
            className="absolute right-2 sm:right-4 z-30 p-2 sm:p-2.5 rounded-full border border-white/10 hover:border-[#FFBF00]/50 text-neutral-400 hover:text-[#FFBF00] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Carousel Viewport */}
          <div className="relative w-full h-24 sm:h-28 flex items-center justify-center overflow-hidden">
            <div
              ref={trackRef}
              className={`flex items-center absolute left-1/2 ${
                isTransitioning
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
                    className="shrink-0 flex flex-col items-center justify-center cursor-pointer px-2"
                  >
                    {isCenter ? (
                      <Link
                        href={`/location/${loc.slug}`}
                        className="group flex flex-col items-center justify-center transition-all duration-500 scale-110 sm:scale-125"
                      >
                        <span className="whitespace-nowrap text-3xl sm:text-4xl md:text-[3.125rem] font-black tracking-tight text-[#FFBF00] transition-transform duration-300 group-hover:scale-105">
                          {loc.name}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex flex-col items-center justify-center opacity-30 hover:opacity-75 transition-all duration-300 scale-90 sm:scale-95">
                        <span className="whitespace-nowrap text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-neutral-400 hover:text-white transition-colors">
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
