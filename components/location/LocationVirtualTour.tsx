"use client";

import React from "react";
import Image from "next/image";
import { RectangleGoggles } from "lucide-react";
import { LocationData } from "@/data/locations";
import { useTranslation } from "react-i18next";
import { getLocalized } from "@/sanity/lib/localized";

interface LocationVirtualTourProps {
  location: LocationData;
}

export default function LocationVirtualTour({ location }: LocationVirtualTourProps) {
  const { t, i18n } = useTranslation("location");
  const backgroundImage = location.virtualTour?.backgroundImage || location.images?.virtualTour || "/cfc_ambience.jpg";
  const rawHeading = location.virtualTour?.heading || location.tourTitle;
  const heading = rawHeading ? getLocalized(rawHeading, i18n.language) : t("virtualTour.defaultHeading", "Step Inside The Crunch");
  const rawButtonText = location.virtualTour?.buttonText || location.tourSubtitle;
  const buttonText = rawButtonText ? getLocalized(rawButtonText, i18n.language) : t("virtualTour.defaultButtonText", "Take A Virtual Tour");
  const virtualTourUrl = location.virtualTour?.virtualTourUrl;

  const handleTourClick = () => {
    if (virtualTourUrl && virtualTourUrl.startsWith("http")) {
      window.open(virtualTourUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {/* 3. VIRTUAL TOUR BANNER (Matches Bottom Card in Mockup) */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleTourClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTourClick();
          }
        }}
        aria-label={`${heading} - ${buttonText}`}
        className="relative w-full aspect-[9/16] md:aspect-[16/8] rounded-[20px] sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBF00]"
      >
        <Image
          src={backgroundImage}
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
              {heading}
            </h2>

            <span
              className="mt-4 sm:mt-6 inline-flex items-center gap-2 text-base md:text-lg lg:text-xl font-semibold text-white group-hover:text-[#FFBF00] transition-colors"
            >
              <span>{buttonText}</span>
              <RectangleGoggles />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
