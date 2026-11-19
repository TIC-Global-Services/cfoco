"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { matter } from "@/font/fonts";

export interface LocationGalleryItem {
  alt: string;
  imagesrc: string;
  title?: string;
}

export interface LocationGalleryProps {
  items?: LocationGalleryItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export const defaultGalleryItems: LocationGalleryItem[] = [
  {
    alt: "Bordeaux Centre",
    imagesrc: "/locations/bordeaux_front.jpg",
    title: "Bordeaux Centre",
  },
  {
    alt: "Mérignac",
    imagesrc: "/location_details-hero.jpg",
    title: "Mérignac",
  },
  {
    alt: "Bordeaux Bastide",
    imagesrc: "/cfc_ambience.jpg",
    title: "Bordeaux Bastide",
  },
  {
    alt: "Talence",
    imagesrc: "/locations/dining.jpg",
    title: "Talence",
  },
  {
    alt: "Le Bouscat",
    imagesrc: "/locations/counter.jpg",
    title: "Le Bouscat",
  },
];

const LocationGallery: React.FC<LocationGalleryProps> = ({
  items = defaultGalleryItems,
  title,
  subtitle,
  className = "",
  autoPlay = false,
  interval = 5000,
}) => {
  const galleryItems = items && items.length > 0 ? items : defaultGalleryItems;
  const total = galleryItems.length;

  // Start with index 1 ("Mérignac") if available, matching the preview design
  const initialIndex = Math.min(1, Math.max(0, total - 1));
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const touchStartX = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handleSelect = (index: number) => {
    setActiveIndex(index);
  };

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Autoplay support (paused on user hover)
  useEffect(() => {
    if (!autoPlay || isPaused || total <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, total, handleNext]);

  // Touch Swipe Handling for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX;

    if (distance > 35) {
      handleNext();
    } else if (distance < -35) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <section
      className={`relative w-full py-10 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 overflow-hidden select-none bg-transparent ${matter.className} ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient background glow matching CFOCO theme */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,191,0,0.12) 0%, rgba(255,191,0,0.02) 50%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* Optional Header */}
      {(title || subtitle) && (
        <div className="relative z-10 max-w-4xl mx-auto text-center mb-8 sm:mb-12">
          {subtitle && (
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#FFBF00] uppercase block mb-2">
              {subtitle}
            </span>
          )}
          {title && (
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.3]">
              {title}
            </h2>
          )}
        </div>
      )}

      {/* Main 3D Cover Flow Carousel Container */}
      <div className="relative w-full max-w-7xl mx-auto flex items-center justify-center">
        {/* Previous Navigation Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-4 md:left-8 lg:left-12 z-40 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-[#FFBF00]/60 hover:border-[#FFBF00] bg-black/50 hover:bg-[#FFBF00]/15 text-[#FFBF00] backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {/* 3D Viewport Stage */}
        <div
          className="relative w-full h-[250px] xs:h-[290px] sm:h-[380px] md:h-[440px] lg:h-[480px] flex items-center justify-center"
          style={{
            perspective: "1200px",
            transformStyle: "preserve-3d",
          }}
        >
          {galleryItems.map((item, index) => {
            // Calculate cyclic distance from activeIndex
            let offset = index - activeIndex;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCenter = offset === 0;
            const isImmediateLeft = offset === -1;
            const isImmediateRight = offset === 1;
            const isOuterLeft = offset === -2;
            const isOuterRight = offset === 2;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) return null;

            // Compute dynamic 3D transform values
            let translateX = "0%";
            let translateZ = "0px";
            let rotateY = "0deg";
            let scale = 1;
            let zIndex = 30;
            let opacity = 1;
            let brightness = "100%";

            if (isCenter) {
              translateX = "0%";
              translateZ = "0px";
              rotateY = "0deg";
              scale = 1;
              zIndex = 35;
              opacity = 1;
              brightness = "100%";
            } else if (isImmediateLeft) {
              translateX = "-58%";
              translateZ = "-90px";
              rotateY = "12deg";
              scale = 0.86;
              zIndex = 25;
              opacity = 0.85;
              brightness = "75%";
            } else if (isImmediateRight) {
              translateX = "58%";
              translateZ = "-90px";
              rotateY = "-12deg";
              scale = 0.86;
              zIndex = 25;
              opacity = 0.85;
              brightness = "75%";
            } else if (isOuterLeft) {
              translateX = "-100%";
              translateZ = "-180px";
              rotateY = "18deg";
              scale = 0.72;
              zIndex = 15;
              opacity = 0.45;
              brightness = "50%";
            } else if (isOuterRight) {
              translateX = "100%";
              translateZ = "-180px";
              rotateY = "-18deg";
              scale = 0.72;
              zIndex = 15;
              opacity = 0.45;
              brightness = "50%";
            }

            const imageSrc = failedImages[index]
              ? "/locations/bordeaux_front.jpg"
              : item.imagesrc || "/locations/bordeaux_front.jpg";

            const displayName = item.title || item.alt || "Location";

            return (
              <div
                key={`${item.alt}-${index}`}
                onClick={() => !isCenter && handleSelect(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelect(index);
                  }
                }}
                className={`absolute top-1/2 left-1/2 w-[270px] xs:w-[320px] sm:w-[460px] md:w-[560px] lg:w-[640px] aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCenter
                  ? "border-2 border-[#FFBF00] shadow-[0_0_35px_rgba(255,191,0,0.5),0_20px_50px_rgba(0,0,0,0.9)] cursor-default ring-1 ring-[#FFBF00]/50"
                  : "border border-white/15 hover:border-white/35 shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
                  }`}
                style={{
                  transform: `translate3d(calc(-50% + ${translateX}), -50%, ${translateZ}) scale(${scale}) rotateY(${rotateY})`,
                  zIndex,
                  opacity,
                  filter: `brightness(${brightness})`,
                  transformOrigin: "center center",
                  willChange: "transform, opacity, filter",
                }}
              >
                {/* Background Image */}
                <Image
                  src={imageSrc}
                  alt={item.alt || displayName}
                  fill
                  sizes="(max-width: 640px) 320px, (max-width: 1024px) 560px, 640px"
                  className="object-cover"
                  priority={isCenter}
                  onError={() => handleImageError(index)}
                />

                {/* Subtle dark gradient overlay for text readability */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                {/* Bottom Left Location Label Badge */}
                {/* <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-3 sm:left-4 md:left-6 z-20 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 shadow-lg">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFBF00] fill-[#FFBF00] shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base font-bold text-white tracking-wide leading-none truncate max-w-[200px] sm:max-w-[300px]">
                    {displayName}
                  </span>
                </div> */}
              </div>
            );
          })}
        </div>

        {/* Next Navigation Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-4 md:right-8 lg:right-12 z-40 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-[#FFBF00]/60 hover:border-[#FFBF00] bg-black/50 hover:bg-[#FFBF00]/15 text-[#FFBF00] backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Horizontal Pagination Indicators */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 mt-6 sm:mt-8 md:mt-10">
        {galleryItems.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={`dot-${item.alt}-${index}`}
              type="button"
              onClick={() => handleSelect(index)}
              aria-label={`Go to slide ${index + 1}: ${item.title || item.alt}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${isActive
                ? "w-8 sm:w-10 h-1.5 sm:h-2 bg-[#FFBF00] shadow-[0_0_12px_rgba(255,191,0,0.65)]"
                : "w-3 sm:w-3.5 h-1.5 sm:h-2 bg-neutral-600/70 hover:bg-neutral-500"
                }`}
            />
          );
        })}
      </div>
    </section>
  );
};

export default LocationGallery;
