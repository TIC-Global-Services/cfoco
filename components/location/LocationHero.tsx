"use client";

import React from "react";
import Image from "next/image";
import { Navigation, MapPin, MapPinCheck, MapPinIcon } from "lucide-react";
import { LocationData } from "@/data/locations";
import Link from "next/link";

interface LocationHeroProps {
  location: LocationData;
}

export default function LocationHero({ location }: LocationHeroProps) {
  return (
    <div className="relative w-full h-[800px] rounded-2xl sm:rounded-[20px] overflow-hidden border border-white/10 shadow-2xl group">
      {/* 1. TOP HERO STOREFRONT BANNER (Matches Top Card in Mockup) */}
      <Image
        src={location.images.storefront}
        alt={`${location.name} Storefront`}
        fill
        priority
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient Overlays for readable text */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" /> */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" /> */}

      {/* Top Right Location Pin Badge */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center text-white text-xs sm:text-lg font-medium">
        <MapPinIcon className="w-5 h-5 text-[#232E45] mr-2" />
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
          <p className="text-xs sm:text-base lg:text-2xl text-[#FFFFFF] font-medium tracking-tight leading-none[1.2] mt-2 sm:mt-3 whitespace-pre-line">
            {location.tagline.prefix}{" "}
            <span className="text-[#CC1518] font-medium">{location.tagline.highlight}</span>{" "}
            {location.tagline.description}
          </p>
        </div>

        {/* Get Directions Button */}
        <Link
          href={location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start md:self-end inline-flex items-center gap-2 bg-white text-[#232E45] hover:bg-neutral-100 font-semibold px-5 py-2.5 sm:px-8 sm:py-2.5 rounded-full text-xs md:text-lg  transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
        >
          {/* <Navigation className="w-4 h-4 fill-black" /> */}
          <span>Get Directions</span>
        </Link>
      </div>
    </div>
  );
}
