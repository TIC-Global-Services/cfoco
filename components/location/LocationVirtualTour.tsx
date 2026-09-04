"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Compass, X, Sparkles, RectangleGoggles } from "lucide-react";
import { LocationData } from "@/data/locations";

interface LocationVirtualTourProps {
  location: LocationData;
}

export default function LocationVirtualTour({ location }: LocationVirtualTourProps) {
  const [showTourModal, setShowTourModal] = useState(false);

  return (
    <>
      {/* 3. VIRTUAL TOUR BANNER (Matches Bottom Card in Mockup) */}
      <div className="relative w-full aspect-[9/16] md:aspect-[16/8] rounded-[20px] sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
        // onClick={() => setShowTourModal(true)}
      >
        <Image
          src={"/cfc_ambience.jpg"}
          alt={`${location.name} Virtual Tour`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/50 transition-colors duration-500" />

        {/* Center Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-xs md:max-w-5xl leading-none">
            <h2 className="text-[2.125rem] sm:text-5xl lg:text-[4.375rem] font-bold text-[#F6B90B] tracking-tight drop-shadow-md">
              {location.tourTitle}
            </h2>

            <button
              type="button"
              className="mt-4 sm:mt-6 inline-flex items-center gap-2 text-base md:text-lg lg:text-xl font-semibold text-white"
            >
              <span>{location.tourSubtitle}</span>
              <RectangleGoggles />
            </button>
          </div>
        </div>
      </div>

      {/* 4. VIRTUAL TOUR INTERACTIVE MODAL */}
      {/* {showTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-neutral-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setShowTourModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#FFBF00] mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs uppercase font-bold tracking-widest">360° Kitchen View</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {location.name} Interactive Tour
            </h3>
            <p className="text-sm text-neutral-400 mt-1 mb-6">
              Experience the energy, aromas, and craftsmanship that goes into every piece of CFC chicken.
            </p>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10">
              <Image
                src={location.images.virtualTour}
                alt="360 Tour Preview"
                fill
                className="object-cover animate-pulse"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center p-4">
                <div className="w-16 h-16 rounded-full bg-[#FFBF00] flex items-center justify-center text-black shadow-lg cursor-pointer transform hover:scale-110 transition">
                  <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: "12s" }} />
                </div>
                <p className="text-white font-bold mt-4 text-base">Virtual 3D Space Loaded</p>
                <p className="text-xs text-neutral-300">Drag to look around or tap hotspots</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {location.features.map((feat) => (
                  <span
                    key={feat}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300"
                  >
                    {feat}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowTourModal(false)}
                className="text-xs font-semibold px-5 py-2 rounded-full bg-[#FFBF00] text-black hover:bg-[#F59E0B] transition"
              >
                Close Tour
              </button>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}
