"use client";

import React from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";

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
                WebkitTextStroke: "1.5px #E5A823",
                // textShadow: "0 0 20px rgba(229, 168, 35, 0.15)",
              }}
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>

      {/* Bucket Image Area */}
      <div className="relative z-10 flex justify-center items-start md:-mt-[12%]">
        <div className="w-full h-[30dvh] md:h-[50dvh] lg:h-[70dvh] transition-transform duration-500 hover:scale-105 ">
          <Image
            src="/cfc_bucket.png"
            alt="CFOCO Chicken Bucket with Dipping Sauce"
            fill
            priority
            className="object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>

      {/* Narrative Description */}
      <div className="relative z-10 md:max-w-4xl mx-auto text-center  px-[3%] md:px-4 mt-10">
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