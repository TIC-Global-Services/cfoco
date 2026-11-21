"use client";

import React from "react";
import Image from "next/image";
import { MapPinIcon } from "lucide-react";
import { LocationData } from "@/data/locations";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { getLocalized } from "@/sanity/lib/localized";

interface LocationHeroProps {
  location: LocationData;
}

export default function LocationHero({ location }: LocationHeroProps) {
  const { t, i18n } = useTranslation("location");
  const heroImage = location.hero?.backgroundImage || location.images?.storefront || "/location_details-hero.jpg";
  const locationLabel = location.hero?.locationLabel ? getLocalized(location.hero.locationLabel, i18n.language) : (location.cityTag || location.city);
  const heading = location.hero?.heading ? getLocalized(location.hero.heading, i18n.language) : location.name;
  const rawDesc = location.hero?.description || (location.tagline ? `${location.tagline.prefix} ${location.tagline.highlight} ${getLocalized(location.tagline.description, i18n.language)}` : "");
  const description = getLocalized(rawDesc, i18n.language);
  const directionsUrl = location.hero?.directionsUrl || location.mapsUrl || "#";
  const subheading = location.hero?.subheading ? getLocalized(location.hero.subheading, i18n.language) : "CFC Tasty";

  const openingHours = location.experience?.openingHours || location.openingHours;
  const weekdayHours = openingHours?.weekday ? getLocalized(openingHours.weekday, i18n.language) : "";
  const weekendHours = openingHours?.weekend ? getLocalized(openingHours.weekend, i18n.language) : "";
  const sundayHours = openingHours?.sunday ? getLocalized(openingHours.sunday, i18n.language) : "";

  return (
    <div className="relative w-full aspect-[9/16] lg:h-[800px] rounded-2xl sm:rounded-[20px] overflow-hidden border border-white/10 shadow-2xl group">
      {/* 1. TOP HERO STOREFRONT BANNER (Matches Top Card in Mockup) */}
      <Image
        src={heroImage}
        alt={`${heading} Storefront`}
        fill
        priority
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient Overlays for readable text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-transparent" />

      {/* Top Header: Opening Hours & Badges (Mobile: Badges top, Opening Hours below; Desktop: Opening Hours left, Badges right) */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-10 flex flex-col md:flex-row items-start md:items-start md:justify-between gap-4 md:gap-4 pointer-events-none">
        {/* MOBILE ONLY: Rating & Location Pill (Top of Header on Mobile) */}
        <div className="flex flex-col items-start gap-2 md:hidden pointer-events-auto w-fit">

          <div className="inline-flex items-center w-fit self-start bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-white text-xs sm:text-sm font-medium shadow-lg">
            <MapPinIcon className="w-4 h-4 text-[#FFBF00] mr-2 shrink-0" />
            <span>{locationLabel}</span>
          </div>

        </div>

        {/* Opening Hours (Below Badges on Mobile, Left on Desktop) */}
        {openingHours && (
          <div className="text-left pointer-events-auto">
            <h3 className="text-[26px] sm:text-[26px] md:text-3xl font-bold text-[#F6B90B] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {t("bento.opening", "Opening")} {t("bento.hours", "Hours")}
            </h3>
            <div className="text-sm sm:text-sm md:text-[22px] font-medium text-white leading-[1.2] tracking-tight mt-0.5 sm:mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {(weekdayHours || weekendHours) && (
                <p>
                  {weekdayHours}
                  {weekdayHours && weekendHours ? " · " : ""}
                  {weekendHours}
                </p>
              )}
              {sundayHours && <p>{sundayHours}</p>}
            </div>
          </div>
        )}

        {/* DESKTOP ONLY: Location Pin & Rating Badges (Right on Desktop) */}
        <div className="hidden md:flex md:flex-wrap items-center gap-2 text-white text-xs sm:text-base font-medium justify-end pointer-events-auto">
          <div className="flex items-center bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg w-fit">
            <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFBF00] mr-2 shrink-0" />
            <span>{locationLabel}</span>
          </div>
          {location.rating && (
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[#FFBF00] font-semibold text-xs sm:text-sm shadow-lg w-fit">
              <span>★ {location.rating.toFixed(1)}</span>
              {location.reviewCount && (
                <span className="text-white/80 font-normal">
                  ({location.reviewCount.toLocaleString()} {t("locationHero.reviews", "avis")})
                </span>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Bottom Hero Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10 flex flex-col items-start justify-start gap-6">

        <div className="max-w-4xl">
          {location.rating && (
            <div className="flex items-center gap-1.5 text-sm mb-1 md:mb-0 sm:text-base font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <span className="text-[#FFBF00]">★ {location.rating.toFixed(1)}</span>
              {location.reviewCount && (
                <span className="text-white font-normal">
                  ({location.reviewCount.toLocaleString()} {t("locationHero.reviews", "avis")})
                </span>
              )}
            </div>
          )}
          <span className="text-[34px] md:text-[2rem] lg:text-[4.375rem] font-bold text-[#FFBF00] tracking-wide leading-none block">
            {subheading}
          </span>
          <h1 className="text-[34px] md:text-[4rem] lg:text-[6.25rem] font-extrabold text-[#FFBF00] tracking-tight leading-none whitespace-pre-line">
            {heading}
          </h1>
          <p className="text-base sm:text-base lg:text-2xl text-[#FFFFFF] font-medium tracking-tight leading-[1.2] mt-2 sm:mt-3 whitespace-pre-line">
            {description}
          </p>
        </div>

        {/* Get Directions Button */}
        <Link
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start md:self-end inline-flex items-center gap-2 bg-white text-[#232E45] hover:bg-neutral-100 font-semibold px-5 py-2.5 sm:px-8 sm:py-2.5 rounded-full text-xs md:text-lg transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
        >
          <span>{t("locationHero.getDirections", "Get Directions")}</span>
        </Link>
      </div>
    </div>
  );
}
