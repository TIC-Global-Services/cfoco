"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users, Rabbit, Star } from "lucide-react";
import { matter } from "@/font/fonts";

const WhatWeRefuse: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
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
      {/* DESKTOP LAYOUT (>= lg): Floating 3D Scene with Mouse Parallax & Hover Z-Index */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex relative w-full max-w-7xl h-[650px] lg:h-[720px] items-center justify-center my-auto">
        {/* LAYER 1: CENTER FRIED CHICKEN (z-10 - Behind cards and masala) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[420px] lg:w-[520px] aspect-square flex items-center justify-center">
          <Image
            src="/fried-chicken.png"
            alt="Crispy Fried Chicken"
            fill
            className="object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
            priority
          />
        </div>

        {/* LAYER 2: CARDS (z-20 normally, z-50 on hover to bring to front) */}
        {/* Left Card: Speed */}
        <div className="absolute left-[2%] lg:left-[5%] xl:left-[8%] top-[38%] -translate-y-1/2 z-20 hover:z-50 group transition-all duration-300">
          <div className="w-[270px] lg:w-[310px] bg-[#1d232e]/75 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFBF00]/60 group-hover:shadow-[0_0_35px_rgba(255,191,0,0.25)]">
            <Rabbit className="w-8 h-8 text-white mb-4 stroke-[1.5]" />
            <h3 className="text-2xl lg:text-[2.25rem] font-bold text-white mb-2">Speed</h3>
            <p className="text-sm lg:text-base text-neutral-300 font-normal leading-[1.3]">
              Fast Food Should Be Fast And Still Be Food.
            </p>
          </div>
        </div>

        {/* Right Card: Quality */}
        <div className="absolute right-[2%] lg:right-[5%] xl:right-[8%] top-[38%] -translate-y-1/2 z-20 hover:z-50 group transition-all duration-300">
          <div className="w-[270px] lg:w-[310px] bg-[#1d232e]/75 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFBF00]/60 group-hover:shadow-[0_0_35px_rgba(255,191,0,0.25)]">
            <Star className="w-8 h-8 text-white mb-4 stroke-[1.5]" />
            <h3 className="text-2xl lg:text-[2.25rem] font-bold text-white mb-2">Quality</h3>
            <p className="text-sm lg:text-base text-neutral-300 font-normal leading-[1.3]">
              If It's Not Crispy Enough To Hear, It Doesn't Leave The Kitchen.
            </p>
          </div>
        </div>

        {/* Bottom Center Card: Conviviality */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[4%] lg:bottom-[6%] z-20 hover:z-50 group transition-all duration-300">
          <div className="w-[290px] lg:w-[330px] bg-[#1d232e]/80 backdrop-blur-xl border border-[#1e82e6]/70 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFBF00] group-hover:shadow-[0_0_40px_rgba(255,191,0,0.35)]">
            <Users className="w-8 h-8 text-[#FFBF00] mb-4 stroke-[1.5]" />
            <h3 className="text-2xl lg:text-[2.25rem] font-bold text-[#FFBF00] mb-2">Conviviality</h3>
            <p className="text-sm lg:text-base text-neutral-200 font-normal leading-[1.3]">
              Great Meals Are Meant To Be Shared. So Is A Good Time.
            </p>
          </div>
        </div>

        {/* LAYER 3: MASALA & SPICE OVERLAY (z-30, mouse parallax interactive depth) */}
        <div
          className="absolute top-[50%] left-[50%] z-30 pointer-events-none transition-transform duration-300 ease-out w-[850px] lg:w-[1050px] aspect-square"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 20}px), calc(-50% + ${mousePos.y * 20}px))`,
          }}
        >
          <Image
            src="/masala.png"
            alt="Masala Dust Explosion"
            fill
            className="object-contain opacity-95"
          />
        </div>

        {/* Floating Spices (Desktop Parallax) */}
        <div
          className="absolute left-[14%] top-[22%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px) rotate(${mousePos.x * 20}deg)`,
          }}
        >
          <Image src="/chili-left.png" alt="Chili Left" width={65} height={65} className="w-14 lg:w-16 object-contain drop-shadow-xl" />
        </div>

        <div
          className="absolute right-[14%] top-[20%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 45}px, ${mousePos.y * 35}px) rotate(${mousePos.y * -25}deg)`,
          }}
        >
          <Image src="/chill-right.png" alt="Chili Right" width={65} height={65} className="w-14 lg:w-16 object-contain drop-shadow-xl" />
        </div>

        <div
          className="absolute left-[28%] top-[34%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * -30}px) rotate(${mousePos.x * -35}deg)`,
          }}
        >
          <Image src="/leaf.png" alt="Leaf Left" width={55} height={55} className="w-10 lg:w-12 object-contain drop-shadow-lg" />
        </div>

        <div
          className="absolute right-[26%] top-[28%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -35}px, ${mousePos.y * 40}px) rotate(${mousePos.y * 30}deg)`,
          }}
        >
          <Image src="/leaf-right.png" alt="Leaf Right" width={55} height={55} className="w-10 lg:w-12 object-contain drop-shadow-lg" />
        </div>

        <div
          className="absolute left-[20%] bottom-[22%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 50}px, ${mousePos.y * -25}px) rotate(${mousePos.x * 25}deg)`,
          }}
        >
          <Image src="/tomato.png" alt="Tomato" width={45} height={45} className="w-9 lg:w-10 object-contain drop-shadow-lg" />
        </div>

        <div
          className="absolute right-[22%] bottom-[24%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -30}px, ${mousePos.y * 35}px) rotate(${mousePos.y * -20}deg)`,
          }}
        >
          <Image src="/pepper.png" alt="Pepper" width={35} height={35} className="w-7 lg:w-8 object-contain drop-shadow-lg" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET LAYOUT (< lg): Stacked Graphic Stage + Responsive Cards */}
      {/* ========================================================================= */}
      <div className="flex lg:hidden flex-col items-center w-full max-w-lg mx-auto z-10 mt-2 sm:mt-4">
        {/* Mobile Graphic Centerpiece */}
        <div className="relative w-full h-[260px] sm:h-[320px] flex items-center justify-center overflow-hidden my-2">
          {/* Fried Chicken */}
          <div className="relative w-[190px] sm:w-[240px] aspect-square z-10 flex items-center justify-center">
            <Image
              src="/fried-chicken.png"
              alt="Crispy Fried Chicken"
              fill
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              priority
            />
          </div>

          {/* Masala Cloud */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[420px] sm:w-[540px] aspect-square pointer-events-none">
            <Image
              src="/masala.png"
              alt="Masala Dust"
              fill
              className="object-contain opacity-90"
            />
          </div>

          {/* Floating Spices on Mobile */}
          <div className="absolute left-[8%] top-[18%] z-30 pointer-events-none">
            <Image src="/chili-left.png" alt="Chili" width={40} height={40} className="w-9 sm:w-11 object-contain" />
          </div>
          <div className="absolute right-[8%] top-[16%] z-30 pointer-events-none">
            <Image src="/chill-right.png" alt="Chili" width={40} height={40} className="w-9 sm:w-11 object-contain" />
          </div>
          <div className="absolute left-[18%] bottom-[12%] z-30 pointer-events-none">
            <Image src="/tomato.png" alt="Tomato" width={30} height={30} className="w-7 sm:w-8 object-contain" />
          </div>
          <div className="absolute right-[18%] bottom-[14%] z-30 pointer-events-none">
            <Image src="/pepper.png" alt="Pepper" width={25} height={25} className="w-6 sm:w-7 object-contain" />
          </div>
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
          <div className="w-full bg-[#1d232e]/85 backdrop-blur-xl border border-[#1e82e6]/70 rounded-2xl p-4 sm:p-5 shadow-lg text-left">
            <Users className="w-7 h-7 text-[#FFBF00] mb-2.5 stroke-[1.5]" />
            <h3 className="text-xl sm:text-2xl font-bold text-[#FFBF00] mb-1">Conviviality</h3>
            <p className="text-xs sm:text-sm text-neutral-200 font-normal leading-relaxed">
              Great Meals Are Meant To Be Shared. So Is A Good Time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeRefuse;