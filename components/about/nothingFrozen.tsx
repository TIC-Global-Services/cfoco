"use client";

import React from "react";
import { matter } from "@/font/fonts";
import ChickenBucketCanvas from "@/components/about/ChickenBucketCanvas";

const NothingFrozen = () => {
  const marqueePhrases = [
    "Nothing Frozen. Nothing Fake.",
    "Nothing Frozen. Nothing Fake.",
    "Nothing Frozen. Nothing Fake.",
    "Nothing Frozen. Nothing Fake.",
  ];

  return (
    <section className={`relative w-full py-16 md:py-20 px-0 sm:px-0 lg:px-0 bg-transparent select-none overflow-hidden ${matter.className}`}>
      {/* Background Marquee Text */}
      <div className="relative w-full overflow-hidden py-10 pointer-events-none z-0">
        <div className="animate-marquee flex items-center space-x-12 sm:space-x-16">
          {marqueePhrases.concat(marqueePhrases).map((phrase, idx) => (
            <span
              key={idx}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight uppercase whitespace-nowrap"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px #E5A823",
                // textShadow: "0 0 20px rgba(229, 168, 35, 0.15)",
              }}
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>

      {/* 3D Chicken Bucket Interactive Area */}
      <div className="relative z-10 flex justify-center items-center -mt-14 xs:-mt-18 sm:-mt-24 md:-mt-32 lg:-mt-40 xl:-mt-48">
        <ChickenBucketCanvas modelPath="/chicken_bucket.glb" />
      </div>

      {/* Narrative Description */}
      <div className="relative z-10 md:max-w-4xl mx-auto text-center px-[3%] md:px-4 mt-2 xs:-mt-4 sm:-mt-6 md:-mt-8 lg:mt-1">
        <p className="text-base sm:text-lg md:text-xl font-normal leading-[1.2] text-neutral-200/95 max-w-4xl mx-auto">
          Great Chicken Has Nowhere To Hide. That&apos;s <br className="md:hidden"/>Why We Start With Fresh Cuts, Marinate In-House, And Hand-Breade Every Piece To <br className="md:hidden"/> Order. Our Oil Is Filtered Daily — Because <br className="md:hidden"/> Crispy Is Chemistry, And Chemistry Has Standards.
        </p>

        <p className="text-base sm:text-lg md:text-xl font-medium tracking-wide text-[#E5A823] pt-5">
          No Mystery. No Compromise. Just The Good Stuff, Done Right.
        </p>
      </div>
    </section>
  );
};

export default NothingFrozen;