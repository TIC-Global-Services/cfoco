"use client";

import React from "react";
import Image from "next/image";
import { LocationData } from "@/data/locations";

interface LocationBentoGridProps {
  location: LocationData;
}

export default function LocationBentoGrid({ location }: LocationBentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 py-10 md:py-20">
      
      {/* Kiosks Card */}
      <div className="relative w-full h-[260px] md:h-[300px] md:col-span-7 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-lg">
        <Image
          src={location.images.kiosks}
          alt="CFC Digital Ordering Kiosks"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Dining Room Card */}
      <div className="relative w-full h-[260px] md:h-[300px] md:col-span-5 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-lg">
        <Image
          src={location.images.dining}
          alt="CFC Dining Area"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Bar Stools / High-top Seating Card */}
      <div className="relative w-full h-[300px] md:h-full md:col-span-4 md:row-span-2 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-lg">
        <Image
          src={location.images.barStools}
          alt="CFC High Top Seating"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Signature Dish Card */}
      <div className="relative w-full h-[200px] md:h-[240px] md:col-span-8 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#2a2a2e] shadow-lg">
        {/* Floating Fried Chicken Graphics */}
        {/* <div className="absolute h-full w-full rotate-90 pointer-events-none "> */}
          <Image src="/fried-chickens.png" alt="Fried Chicken" fill className="object-cover  w-full" />
        {/* </div> */}

        <div className="relative z-10 flex w-full h-full items-end justify-end p-5 lg:p-8">
          <div className="flex items-end gap-3 md:gap-4 lg:gap-6">
            <div className="text-right mb-[2px] md:mb-1 lg:mb-1">
              <p className="text-[#CC1518] font-normal text-sm md:text-lg lg:text-2xl">
                {location.signatureDish.title}
              </p>
              <p className="text-white font-medium text-xs md:text-lg lg:text-2xl">
                {location.signatureDish.subtitle}
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
          src={location.images.counter}
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
                {location.openingHours.weekday} · {location.openingHours.weekend}
              </p>
              <p>{location.openingHours.sunday}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
