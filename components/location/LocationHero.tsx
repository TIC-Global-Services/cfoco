"use client";

import React from "react";
import Image from "next/image";
import { Navigation, MapPin } from "lucide-react";
import { LocationData } from "@/data/locations";

interface LocationHeroProps {
  location: LocationData;
}

export default function LocationHero({ location }: LocationHeroProps) {
  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl group py-10">
      {/* 1. TOP HERO STOREFRONT BANNER (Matches Top Card in Mockup) */}
      <Image
        src={location.images.storefront}
        alt={`${location.name} Storefront`}
        fill
        priority
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient Overlays for readable text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

      {/* Top Right Location Pin Badge */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center text-white text-xs sm:text-lg font-medium">
        {/* <MapPin className="w-3.5 h-3.5 text-[#FFBF00]" /> */}
        <span>{location.cityTag}</span>
      </div>

      {/* Bottom Hero Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-4xl">
          <span className="text-xl md:text-[2rem] lg:text-[4.375rem] font-bold text-[#FFBF00] tracking-wide leading-none block">
            CFC Tasty
          </span>
          <h1 className="text-3xl md:text-[4rem] lg:text-[6.25rem] font-extrabold text-[#FFBF00] tracking-tight leading-none whitespace-pre-line">
            {location.name}
          </h1>
          <p className="text-xs sm:text-base lg:text-2xl text-neutral-200 font-normal leading-none mt-2 sm:mt-3">
            {location.tagline.prefix}{" "}
            <span className="text-[#CC1518] font-bold">{location.tagline.highlight}</span>{" "}
            {location.tagline.description}
          </p>
        </div>

        {/* Get Directions Button */}
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start md:self-end inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-100 font-semibold px-5 py-2.5 sm:px-6 sm:py-2 rounded-full text-xs md:text-lg lg:text-xl transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
        >
          {/* <Navigation className="w-4 h-4 fill-black" /> */}
          <span>Get Directions</span>
        </a>
      </div>
    </div>
  );
}
