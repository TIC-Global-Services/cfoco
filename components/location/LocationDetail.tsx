"use client";

import React from "react";
import Link from "next/link";
import { LocationData } from "@/data/locations";
import { matter } from "@/font/fonts";
import { ArrowLeft } from "lucide-react";
import LocationHero from "./LocationHero";
import LocationBentoGrid from "./LocationBentoGrid";
import LocationVirtualTour from "./LocationVirtualTour";

interface LocationDetailProps {
  location: LocationData;
}

export default function LocationDetail({ location }: LocationDetailProps) {
  return (
    <div className={`relative w-full min-h-screen px-4 sm:px-6 lg:px-[5%] py-6 sm:py-10  flex flex-col gap-6 sm:gap-8 select-none ${matter.className}`}>
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/location"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-[#FFBF00] transition-colors py-1.5 px-3 rounded-full bg-white/5 border border-white/10 hover:border-[#FFBF00]/40 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Kitchens</span>
        </Link>
      </div>

      <LocationHero location={location} />
      <LocationBentoGrid location={location} />
      <LocationVirtualTour location={location} />
    </div>
  );
}
