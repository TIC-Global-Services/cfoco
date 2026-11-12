"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { matter } from "@/font/fonts";
import { locationsData, LocationData } from "@/data/locations";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";

import Globe from "./Globe";

const LiquidGlass = dynamic(
  () => import("@liquidglass/react").then((mod) => mod.LiquidGlass),
  { ssr: false }
);



const FALLBACK_LOCATION_IMAGE = "/locations/bordeaux_front.jpg";

interface StepInsideProps {
  locations?: LocationData[];
}

const StepInside: React.FC<StepInsideProps> = ({ locations = locationsData }) => {
  const data = locations && locations.length > 0 ? locations : locationsData;
  const total = data.length;

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
  }, []);

  // Sync virtualIndex if locations length changes
  useEffect(() => {
    setVirtualIndex(total);
  }, [total]);

  // The real data index (0..total-1) for map pin & detail card
  const realIndex = ((virtualIndex % total) + total) % total;
  const activeLocation: LocationData = data[realIndex] || data[0];
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const resolvedCardImage = activeLocation.cardImage || FALLBACK_LOCATION_IMAGE;
  const cardImageSrc =
    failedImageSrc === resolvedCardImage ? FALLBACK_LOCATION_IMAGE : resolvedCardImage;
  const cardDescription =
    activeLocation.hero?.description || activeLocation.tagline?.description || "";
  // Constants for the carousel track
  const ITEM_WIDTH = isMobile ? 210 : 380; // px width of each slot
  const ITEM_GAP = 20;    // px gap between items
  const STEP = ITEM_WIDTH + ITEM_GAP; // total distance per item
  // Tripled list for seamless looping
  const tripled = [...data, ...data, ...data];

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
        <div className="relative w-full my-4 sm:my-1 flex items-center justify-center min-h-[300px]">
          <div className="relative w-full max-w-[800px] flex items-center justify-center overflow-visible">
            <Globe location={activeLocation.coordinates} />

            {/* ACTIVE PINPOINT — Visible beacon dot + pulsing rings + detail card */}
            <div
              className="absolute transition-all duration-700 ease-out z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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

                <div className="w-[300px] sm:w-[440px] md:w-[480px]">
                  <LiquidGlass
                    borderRadius={24}
                    blur={18}
                    contrast={1.35}
                    brightness={1.2}
                    saturation={1.5}
                    shadowIntensity={0.4}
                    displacementScale={2}
                    elasticity={1.4}
                    className="w-full bg-[#141923]/80 text-white p-2.5 sm:p-4 border border-white/25 shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-300"
                  >
                    <div className="w-full flex items-stretch gap-3 sm:gap-5 text-left">
                      {/* Restaurant Image (Left) */}
                      <div className="relative w-24 sm:w-36 md:w-40 aspect-square shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border border-white/15 bg-[#232a3b]">
                        <Image
                          src={cardImageSrc}
                          alt={activeLocation.name}
                          fill
                          sizes="(max-width: 640px) 96px, 160px"
                          className="object-cover"
                          onError={() => setFailedImageSrc(resolvedCardImage)}
                        />
                      </div>

                      {/* Details & CTA (Right) */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          {/* Restaurant Name */}
                          <h4 className="text-lg sm:text-2xl font-extrabold text-[#FFBF00] leading-tight truncate drop-shadow-[0_0_6px_rgba(255,191,0,0.25)]">
                            {activeLocation.name}
                          </h4>

                          {/* Address */}
                          <p
                            className="text-xs sm:text-sm text-white/95 font-normal mt-0.5 truncate"
                            title={activeLocation.address}
                          >
                            {activeLocation.address}
                          </p>

                          {/* 2-line Description */}
                          {cardDescription && (
                            <p className="text-[11px] sm:text-xs text-neutral-300/85 font-normal leading-relaxed mt-2 sm:mt-2.5 line-clamp-2">
                              {cardDescription}
                            </p>
                          )}
                        </div>

                        {/* Explore Button */}
                        <div className="mt-2.5 sm:mt-3 flex justify-end">
                          <Link
                            href={`/location/${activeLocation.slug}`}
                            className="inline-flex items-center justify-center rounded-full bg-[#cfd6e2] hover:bg-white text-[#141923] font-bold text-[11px] sm:text-xs px-4 sm:px-5 py-1.5 sm:py-2 transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Explore more
                          </Link>
                        </div>
                      </div>
                    </div>
                  </LiquidGlass>
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
                        <span className="whitespace-nowrap text-4xl sm:text-3xl md:text-[40px] font-black tracking-tight text-[#F6B90B] transition-transform duration-300 group-hover:scale-105 leading-none">
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
