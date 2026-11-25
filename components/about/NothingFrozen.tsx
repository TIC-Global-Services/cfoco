"use client";

import React from "react";
import { matter } from "@/font/fonts";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslation } from "react-i18next";

// Dynamically load the 3D canvas so it doesn't block the initial page load on mobile
const ChickenBucketCanvas = dynamic(
  () => import("@/components/about/ChickenBucketCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none z-10 min-h-[300px]">
        <div className="relative w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E5A823]/25 via-[#FFBF00]/10 to-transparent blur-2xl animate-pulse" />
          
          <div className="relative w-3/4 h-3/4 opacity-60">
            <Image
              src="/cfc_bucket.png"
              alt="Loading 3D Chicken Bucket..."
              fill
              sizes="(max-width: 768px) 240px, 320px"
              className="object-contain filter grayscale"
              priority
            />
          </div>

          <div className="absolute bottom-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-[#E5A823] rounded-full animate-spin" />
            <span className="text-[11px] font-medium tracking-wider text-neutral-300 uppercase">
              Loading 3D
            </span>
          </div>
        </div>
      </div>
    ),
  }
);

const NothingFrozen = () => {
  const { t } = useTranslation("about");
  const marqueePhrase = t("nothingFrozen.marquee", "Nothing Frozen. Nothing Fake.");
  const marqueePhrases = [marqueePhrase, marqueePhrase, marqueePhrase, marqueePhrase];

  return (
    <section className={`relative w-full py-10 sm:py-16 md:py-20 px-0 sm:px-0 lg:px-0 bg-transparent select-none overflow-hidden ${matter.className}`}>
      {/* Background Marquee Text */}
      <div className="relative w-full overflow-hidden py-6 sm:py-6 md:py-10 pointer-events-none z-0">
        <div className="animate-marquee flex items-center space-x-8 sm:space-x-16 will-change-transform transform-gpu">
          {marqueePhrases.concat(marqueePhrases).map((phrase, idx) => (
            <span
              key={idx}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight uppercase whitespace-nowrap transform-gpu"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px #E5A823",
              }}
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>

      {/* 3D Chicken Bucket Interactive Area: Balanced separation without overlapping upper or lower text on mobile */}
      <div className="relative z-10 flex justify-center items-center mt-2 xs:-mt-12 sm:-mt-24 md:-mt-36 lg:-mt-44 xl:-mt-52 transform-gpu">
        <ChickenBucketCanvas modelPath="/chicken_buket_new.glb" />
      </div>

      {/* Narrative Description: Safely positioned below the 3D model with clear separation */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 mt-4 xs:mt-5 sm:mt-6 md:mt-8">
        <p className="text-sm xs:text-base sm:text-lg md:text-xl font-normal leading-snug sm:leading-[1.2] text-neutral-200/95 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
          {t(
            "nothingFrozen.descP1",
            "Great Chicken Has Nowhere To Hide. That's Why We Start With Fresh Cuts, Marinate In-House, And Hand-Breade Every Piece To Order. Our Oil Is Filtered Daily — Because Crispy Is Chemistry, And Chemistry Has Standards."
          )}
        </p>

        <p className="text-sm xs:text-base sm:text-lg md:text-xl font-medium tracking-wide text-[#E5A823] pt-3 sm:pt-4">
          {t("nothingFrozen.descP2", "No Mystery. No Compromise. Just The Good Stuff, Done Right.")}
        </p>
      </div>
    </section>
  );
};

export default NothingFrozen;