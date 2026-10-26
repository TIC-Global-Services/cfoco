"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { LocationData } from "@/data/locations";

interface LocationBentoGridProps {
  location: LocationData;
}

export default function LocationBentoGrid({ location }: LocationBentoGridProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const kioskImg = location.experience?.orderingKioskImage || location.images?.kiosks || "/locations/kiosks.jpg";
  const diningImg = location.experience?.interiorImages?.dining || location.images?.dining || "/locations/dining.jpg";
  const barStoolsImg = location.experience?.interiorImages?.barStools || location.images?.barStools || "/locations/bar_stools.jpg";
  const counterImg = location.experience?.interiorImages?.counter || location.images?.counter || "/locations/counter.jpg";
  const signatureDish = location.experience?.signatureDish || location.signatureDish;
  const openingHours = location.experience?.openingHours || location.openingHours;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return;

      setActiveSlide((prev) => {
        const nextSlide = (prev + 1) % 5;
        const clientWidth = scrollRef.current!.clientWidth;

        scrollRef.current!.scrollTo({
          left: nextSlide * clientWidth,
          behavior: "smooth",
        });

        return nextSlide;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== activeSlide && newIndex >= 0 && newIndex < 5) {
        setActiveSlide(newIndex);
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      const clientWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: index * clientWidth,
        behavior: "smooth",
      });
      setActiveSlide(index);
    }
  };

  return (
    <div className="py-10 md:py-20">
      {/* MOBILE SLIDER (< md) */}
      <div className="md:hidden w-full">
        {/* Slider Viewport */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 touch-pan-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Slide 1: Kiosks Card */}
          <div className="w-full shrink-0 snap-center">
            <div className="relative w-full h-[280px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={kioskImg}
                alt="CFC Digital Ordering Kiosks"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Slide 2: Dining Room Card */}
          <div className="w-full shrink-0 snap-center">
            <div className="relative w-full h-[300px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={diningImg}
                alt="CFC Dining Area"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Slide 3: Bar Stools Card */}
          <div className="w-full shrink-0 snap-center">
            <div className="relative w-full h-[280px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={barStoolsImg}
                alt="CFC High Top Seating"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Slide 4: Signature Dish Card */}
          <div className="w-full shrink-0 snap-center">
            <div className="relative w-full h-[300px] rounded-2xl overflow-hidden bg-[#2a2a2e] shadow-lg">
              <Image
                src="/fried-chickens.png"
                alt="Fried Chicken"
                fill
                className="object-cover w-full"
              />
              <div className="relative z-10 flex w-full h-full items-end justify-end p-5">
                <div className="flex items-end gap-3">
                  <div className="text-right mb-[2px]">
                    <p className="text-[#CC1518] font-normal text-sm">
                      {signatureDish.title}
                    </p>
                    <p className="text-white font-medium text-xs">
                      {signatureDish.subtitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-white tracking-tight">
                      Signature
                    </span>
                    <span className="block text-2xl font-bold text-white tracking-tight">
                      Dish
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 5: Opening Hours Card */}
          <div className="w-full shrink-0 snap-center">
            <div className="relative w-full h-[300px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={counterImg}
                alt="CFC Service Counter"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative z-10 w-full h-full flex flex-col justify-end p-5">
                <div className="flex items-end gap-4">
                  <div className="text-left leading-none">
                    <h3 className="text-2xl font-bold text-[#F6B90B] tracking-tight">
                      Opening
                    </h3>
                    <h3 className="text-2xl font-bold text-[#F6B90B] tracking-tight">
                      Hours
                    </h3>
                  </div>
                  <div className="text-sm leading-snug text-white font-medium mb-[2px]">
                    <p>
                      {openingHours.weekday} · {openingHours.weekend}
                    </p>
                    <p>{openingHours.sunday}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {[0, 1, 2, 3, 4].map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${activeSlide === index
                ? "w-7 bg-[#CC1518]"
                : "w-2 bg-[#CC1518]/40 hover:bg-white/50"
                }`}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP BENTO GRID (>= md) */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 sm:gap-6">
        {/* Kiosks Card */}
        <div className="relative w-full h-[260px] md:h-[300px] md:col-span-7 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-lg">
          <Image
            src={kioskImg}
            alt="CFC Digital Ordering Kiosks"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Dining Room Card */}
        <div className="relative w-full h-[260px] md:h-[300px] md:col-span-5 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-lg">
          <Image
            src={diningImg}
            alt="CFC Dining Area"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Bar Stools / High-top Seating Card */}
        <div className="relative w-full h-[300px] md:h-full md:col-span-4 md:row-span-2 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-lg">
          <Image
            src={barStoolsImg}
            alt="CFC High Top Seating"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Signature Dish Card */}
        <div className="relative w-full h-[200px] md:h-[240px] md:col-span-8 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#22242a] shadow-lg">
          <Image
            src="/fried-chickens.png"
            alt="Fried Chicken"
            fill
            style={{objectPosition:"52% 50%"}}
            className="object-contain object-top pointer-events-none rotate-90 scale-[3.8] w-full"
          />
          <div className="relative z-10 flex w-full h-full items-end justify-end p-5 lg:p-8">
            <div className="flex items-end gap-3 md:gap-4 lg:gap-6">
              <div className="text-right mb-[2px] md:mb-1 lg:mb-1">
                <p className="text-[#CC1518] font-normal text-sm md:text-lg lg:text-2xl">
                  {signatureDish.title}
                </p>
                <p className="text-white font-medium text-xs md:text-lg lg:text-2xl">
                  {signatureDish.subtitle}
                </p>
              </div>
              <div className="text-right lg:leading-[12]">
                <span className="block text-3xl lg:text-[2.5rem] font-bold text-white tracking-tight">
                  Signature
                </span>
                <span className="block text-3xl lg:text-[2.5rem] font-bold text-white tracking-tight">
                  Dish
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Opening Hours Card */}
        <div className="relative w-full h-[200px] md:h-[240px] md:col-span-8 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg group">
          <Image
            src={counterImg}
            alt="CFC Service Counter"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 w-full h-full flex flex-col justify-end p-5 sm:p-8">
            <div className="flex items-end gap-4 sm:gap-4">
              <div className="text-left leading-none">
                <h3 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-[#F6B90B] tracking-tight">
                  Opening
                </h3>
                <h3 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-[#F6B90B] tracking-tight">
                  Hours
                </h3>
              </div>
              <div className="text-sm md:text-lg lg:text-2xl leading-snug text-white font-medium mb-[2px] sm:mb-1">
                <p>
                  {openingHours.weekday} · {openingHours.weekend}
                </p>
                <p>{openingHours.sunday}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
