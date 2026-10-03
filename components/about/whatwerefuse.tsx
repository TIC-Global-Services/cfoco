"use client";

import React from "react";
import Image from "next/image";
import { Users, Rabbit, Star } from "lucide-react";
import { matter } from "@/font/fonts";

const WhatWeRefuse: React.FC = () => {
  const [isDesktop, setIsDesktop] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      className={`relative w-full min-h-screen py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between overflow-hidden select-none ${matter.className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 text-center mb-4 sm:mb-6 lg:mb-2">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-extrabold tracking-tight text-[#FFBF00] leading-none drop-shadow-md">
          What We Refuse
        </h2>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-extrabold tracking-tight text-[#FFBF00] leading-none mt-1 sm:mt-2 drop-shadow-md">
          To Compromise
        </h2>
      </header>

      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (>= lg): Floating Scene with Orbit GIF & Surrounding Cards */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex max-w-7xl relative w-full h-[650px] lg:h-[750px] items-center justify-center my-auto">
        {/* CENTER FRIED CHICKEN GIF (Rendered ONLY on desktop to prevent duplicate decoding in RAM) */}
        {isDesktop !== false && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[420px] lg:w-[920px] aspect-[16/9] flex items-center justify-center pointer-events-none">
            <Image
              src="/CHICKEN-orbit.gif"
              alt="Crispy Fried Chicken Orbit"
              fill
              unoptimized
              className="object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
            />
          </div>
        )}

        {/* CARDS (z-10 behind GIF initially, hover:z-50 pops cleanly on top) */}
        {/* Left Card: Speed */}
        <div className="absolute left-[2%] lg:left-[5%] xl:left-[8%] top-[38%] -translate-y-1/2 z-10 hover:z-50 group pointer-events-auto cursor-pointer">
          <div className="w-[270px] lg:w-[310px] bg-[#1d232e]/75 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFBF00]/60 group-hover:shadow-[0_0_35px_rgba(255,191,0,0.25)]">
            <Rabbit className="w-8 h-8 text-white mb-4 stroke-[1.5]" />
            <h3 className="text-2xl lg:text-[2.25rem] font-bold text-white mb-2">Speed</h3>
            <p className="text-sm lg:text-base text-neutral-300 font-normal leading-[1.3]">
              Fast Food Should Be Fast And Still Be Food.
            </p>
          </div>
        </div>

        {/* Right Card: Quality */}
        <div className="absolute right-[2%] lg:right-[5%] xl:right-[8%] top-[38%] -translate-y-1/2 z-10 hover:z-50 group pointer-events-auto cursor-pointer">
          <div className="w-[270px] lg:w-[310px] bg-[#1d232e]/75 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFBF00]/60 group-hover:shadow-[0_0_35px_rgba(255,191,0,0.25)]">
            <Star className="w-8 h-8 text-white mb-4 stroke-[1.5]" />
            <h3 className="text-2xl lg:text-[2.25rem] font-bold text-white mb-2">Quality</h3>
            <p className="text-sm lg:text-base text-neutral-300 font-normal leading-[1.3]">
              If It's Not Crispy Enough To Hear, It Doesn't Leave The Kitchen.
            </p>
          </div>
        </div>

        {/* Bottom Center Card: Conviviality */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[4%] lg:bottom-[6%] z-10 hover:z-50 group pointer-events-auto cursor-pointer">
          <div className="w-[290px] lg:w-[330px] bg-[#1d232e]/75 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFBF00]/60 group-hover:shadow-[0_0_35px_rgba(255,191,0,0.25)]">
            <Users className="w-8 h-8 text-white mb-4 stroke-[1.5]" />
            <h3 className="text-2xl lg:text-[2.25rem] font-bold text-white mb-2">Conviviality</h3>
            <p className="text-sm lg:text-base text-neutral-300 font-normal leading-[1.3]">
              Great Meals Are Meant To Be Shared. So Is A Good Time.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET LAYOUT (< lg): Stacked Graphic Stage + Responsive Cards */}
      {/* ========================================================================= */}
      <div className="flex lg:hidden flex-col items-center w-full max-w-lg mx-auto z-10 mt-2 sm:mt-4">
        {/* Mobile Graphic Centerpiece */}
        <div className="relative w-full h-[260px] sm:h-[320px] flex items-center justify-center overflow-hidden my-2">
          {/* Fried Chicken GIF (Rendered ONLY on mobile/tablet to prevent duplicate decoding) */}
          {isDesktop !== true && (
            <div className="relative w-[280px] sm:w-[320px] aspect-square z-10 flex items-center justify-center pointer-events-none">
              <Image
                src="/CHICKEN-orbit.gif"
                alt="Crispy Fried Chicken Orbit"
                fill
                unoptimized
                className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              />
            </div>
          )}
        </div>

        {/* Mobile Vertical Cards Stack */}
        <div className="flex flex-col gap-3.5 sm:gap-4 w-full px-2 mt-2 z-30">
          {/* Speed Card */}
          <div className="w-full bg-[#1d232e]/85 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-lg text-left">
            <Rabbit className="w-7 h-7 text-white mb-2.5 stroke-[1.5]" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Speed</h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
              Fast Food Should Be Fast And Still Be Food.
            </p>
          </div>

          {/* Quality Card */}
          <div className="w-full bg-[#1d232e]/85 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-lg text-left">
            <Star className="w-7 h-7 text-white mb-2.5 stroke-[1.5]" />
            <h3 className="text-1xl sm:text-2xl font-bold text-white mb-1">Quality</h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
              If It's Not Crispy Enough To Hear, It Doesn't Leave The Kitchen.
            </p>
          </div>

          {/* Conviviality Card */}
          <div className="w-full bg-[#1d232e]/85 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-lg text-left">
            <Users className="w-7 h-7 text-white mb-2.5 stroke-[1.5]" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Conviviality</h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
              Great Meals Are Meant To Be Shared. So Is A Good Time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeRefuse;