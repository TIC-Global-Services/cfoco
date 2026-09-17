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
      className={`relative w-full min-h-screen py-12 sm:py-16 md:py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between overflow-hidden select-none ${matter.className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 text-center mb-2 sm:mb-0">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[50px] font-extrabold tracking-tight text-[#FFBF00] leading-none drop-shadow-md">
          What We Refuse
        </h2>
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[50px] font-extrabold tracking-tight text-[#FFBF00] leading-none mt-1 sm:mt-2 drop-shadow-md">
          To Compromise
        </h2>
      </header>

      {/* Main Interactive Stage Container */}
      <div className="relative w-full  h-[580px] sm:h-[650px] lg:h-[720px] flex items-center justify-center my-auto">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[280px] sm:w-[380px] md:w-[460px] lg:w-[520px] aspect-square flex items-center justify-center">
          <Image
            src="/fried-chicken.png"
            alt="Crispy Fried Chicken"
            fill
            className="object-cover drop-shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
            priority
          />
        </div>

       
        <div className="absolute left-2 sm:left-[3%] lg:left-[6%] xl:left-[10%] top-[32%] sm:top-[38%] -translate-y-1/2 z-20 hover:z-50 group transition-all duration-300">
          <div className="w-[230px] sm:w-[270px] lg:w-[310px] bg-[#1d232e]/75 backdrop-blur-xl border border-white/15 rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFBF00]/60 group-hover:shadow-[0_0_35px_rgba(255,191,0,0.25)]">
            <Rabbit className="w-8 h-8 text-white mb-4 stroke-[1.5]" />
            <h3 className="text-2xl sm:text-[2.5rem] font-bold text-white mb-2">Speed</h3>
            <p className="text-xs sm:text-xl text-neutral-300 font-normal leading-[1.2]">
              Fast Food Should Be Fast And Still Be Food.
            </p>
          </div>
        </div>

        {/* Right Card: Quality */}
        <div className="absolute right-2 sm:right-[3%] lg:right-[6%] xl:right-[10%] top-[32%] sm:top-[38%] -translate-y-1/2 z-20 hover:z-50 group transition-all duration-300">
          <div className="w-[230px] sm:w-[270px] lg:w-[310px] bg-[#1d232e]/75 backdrop-blur-xl border border-white/15 rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFBF00]/60 group-hover:shadow-[0_0_35px_rgba(255,191,0,0.25)]">
            <Star className="w-6 h-6 text-white mb-4 stroke-[1.5]" />
            <h3 className="text-2xl sm:text-[2.5rem] font-bold text-white mb-2">Quality</h3>
            <p className="text-xs sm:text-xl text-neutral-300 font-normal leading-[1.2]">
              If It's Not Crispy Enough To Hear, It Doesn't Leave The Kitchen.
            </p>
          </div>
        </div>

        {/* Bottom Center Card: Conviviality */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 sm:bottom-[4%] lg:bottom-[6%] z-20 hover:z-50 group transition-all duration-300">
          <div className="w-[250px] sm:w-[290px] lg:w-[330px] bg-[#1d232e]/80 backdrop-blur-xl border border-[#1e82e6]/70 rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFBF00] group-hover:shadow-[0_0_40px_rgba(255,191,0,0.35)]">
            <Users className="w-6 h-6 text-[#FFBF00] mb-4 stroke-[1.5]" />
            <h3 className="text-2xl sm:text-[2.5rem] font-bold text-[#FFBF00] mb-2">Conviviality</h3>
            <p className="text-xs sm:text-xl text-neutral-200 font-normal leading-[1.2]">
              Great Meals Are Meant To Be Shared. So Is A Good Time.
            </p>
          </div>
        </div>

        
        <div
          className="absolute top-[50%] left-[50%]  z-30 pointer-events-none transition-transform duration-300 ease-out w-[650px] sm:w-[850px] lg:w-[1050px] aspect-square"
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

        {/* Parallax Floating Ingredient Spices */}
        {/* Chili Left */}
        <div
          className="absolute left-[8%] sm:left-[16%] top-[20%] sm:top-[24%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px) rotate(${mousePos.x * 20}deg)`,
          }}
        >
          <Image
            src="/chili-left.png"
            alt="Chili Left"
            width={70}
            height={70}
            className="w-10 sm:w-14 lg:w-16 object-contain drop-shadow-xl"
          />
        </div>

        {/* Chili Right */}
        <div
          className="absolute right-[8%] sm:right-[16%] top-[18%] sm:top-[22%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 45}px, ${mousePos.y * 35}px) rotate(${mousePos.y * -25}deg)`,
          }}
        >
          <Image
            src="/chill-right.png"
            alt="Chili Right"
            width={70}
            height={70}
            className="w-10 sm:w-14 lg:w-16 object-contain drop-shadow-xl"
          />
        </div>

        {/* Leaf Left */}
        <div
          className="absolute left-[30%] top-[36%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * -30}px) rotate(${mousePos.x * -35}deg)`,
          }}
        >
          <Image
            src="/leaf.png"
            alt="Leaf Left"
            width={60}
            height={60}
            className="w-8 sm:w-12 object-contain drop-shadow-lg"
          />
        </div>

        {/* Leaf Right */}
        <div
          className="absolute right-[28%] top-[30%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -35}px, ${mousePos.y * 40}px) rotate(${mousePos.y * 30}deg)`,
          }}
        >
          <Image
            src="/leaf-right.png"
            alt="Leaf Right"
            width={60}
            height={60}
            className="w-8 sm:w-12 object-contain drop-shadow-lg"
          />
        </div>

        {/* Tomato */}
        <div
          className="absolute left-[22%] bottom-[24%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 50}px, ${mousePos.y * -25}px) rotate(${mousePos.x * 25}deg)`,
          }}
        >
          <Image
            src="/tomato.png"
            alt="Tomato"
            width={50}
            height={50}
            className="w-7 sm:w-10 object-contain drop-shadow-lg"
          />
        </div>

        {/* Pepper */}
        <div
          className="absolute right-[24%] bottom-[26%] z-30 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -30}px, ${mousePos.y * 35}px) rotate(${mousePos.y * -20}deg)`,
          }}
        >
          <Image
            src="/pepper.png"
            alt="Pepper"
            width={40}
            height={40}
            className="w-5 sm:w-8 object-contain drop-shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default WhatWeRefuse;