"use client";

import React from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";

interface Milestone {
  year: string;
  title: string;
  descLine1: string;
  descLine2: string;
  isCenter?: boolean;
}

const milestones: Milestone[] = [
  {
    year: "2011",
    title: "The First Fry",
    descLine1: "One Kitchen In Bordeaux.",
    descLine2: "One Recipe Worth Arguing Over.",
  },
  {
    year: "2014",
    title: "Word Gets Out",
    descLine1: "Lines Out The Door. Turns Out We",
    descLine2: "Weren't The Ones Tired Of Average.",
    isCenter: true,
  },
  {
    year: "2018",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
];

const Obsession = () => {
  return (
    <section className={`relative w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-transparent select-none overflow-hidden ${matter.className}`}>
      {/* Header Title */}
      <div className="max-w-4xl mx-auto text-center space-y-1 mb-20 md:mb-28">
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
          13 Years
        </h2>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
          One Obsession
        </h2>
      </div>

      {/* Timeline Section */}
      <div className="max-w-6xl mx-auto relative">
        {/* Horizontal Connecting Line across Desktop */}
        <div className="hidden md:block absolute top-[36px] left-0 right-0 h-[2px] -translate-y-1/2 z-0">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-500/80 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
          {milestones.map((item, index) => (
            <div
              key={item.year}
              className="flex flex-col items-center text-center group"
            >
              {/* Badge Icon with Glow */}
              <div className="relative mb-8 flex items-center justify-center">
                {/* Ambient Radial Glow */}
                <div
                  className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${
                    item.isCenter
                      ? "bg-blue-500/40 scale-125 group-hover:scale-150 group-hover:bg-blue-400/60"
                      : "bg-blue-500/20 scale-110 group-hover:scale-135 group-hover:bg-blue-400/40"
                  }`}
                />

                {/* Circular Disc */}
                <div
                  className={`relative flex items-center justify-center rounded-full bg-[#0d1424]/90 backdrop-blur-md border transition-transform duration-300 group-hover:scale-110 ${
                    item.isCenter
                      ? "w-18 h-18 sm:w-20 sm:h-20 border-blue-400/70 shadow-[0_0_24px_rgba(59,130,246,0.5)]"
                      : "w-14 h-14 sm:w-16 sm:h-16 border-blue-400/40 shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                  }`}
                >
                  <div
                    className={`relative ${
                      item.isCenter ? "w-10 h-10 sm:w-11 sm:h-11" : "w-8 h-8 sm:w-9 sm:h-9"
                    } drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]`}
                  >
                    <Image
                      src="/chicken_logo.svg"
                      alt="CFOCO Chicken Icon"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Year with Outline Red Styling */}
              <div className="mb-2">
                <span
                  className="font-bold text-3xl sm:text-4xl tracking-wider inline-block transition-transform duration-300 group-hover:scale-105"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "1.5px #CC1518",
                    textShadow: "0 0 16px rgba(204, 21, 24, 0.35)",
                  }}
                >
                  {item.year}
                </span>
              </div>

              {/* Milestone Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                {item.title}
              </h3>

              {/* Description */}
              <div className="space-y-0.5 text-neutral-400 text-sm sm:text-base font-normal leading-relaxed max-w-xs">
                <p>{item.descLine1}</p>
                <p>{item.descLine2}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Obsession;