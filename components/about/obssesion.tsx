"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

export interface Milestone {
  year: string;
  title: string;
  descLine1: string;
  descLine2: string;
}

export const defaultMilestones: Milestone[] = [
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
  },
  {
    year: "2018",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
  {
    year: "2019",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
  {
    year: "2020",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
  {
    year: "2022",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
];

interface ObsessionProps {
  items?: Milestone[];
}

const MilestoneItem = ({
  data,
  index,
  N,
  scrollYProgress,
}: {
  data: Milestone;
  index: number;
  N: number;
  scrollYProgress: MotionValue<number>;
}) => {
  const centerPos = index / Math.max(1, N - 1);

  // Single unified intensity calculation for maximum mobile performance (60/120fps)
  const intensity = useTransform(scrollYProgress, (p) => {
    return Math.max(0, 1 - Math.abs(p - centerPos) / 0.22);
  });

  const opacity = useTransform(intensity, (i) => 0.25 + 0.75 * i);
  const scale = useTransform(intensity, (i) => 0.86 + 0.14 * i);
  const ringOpacity = useTransform(intensity, (i) => i);
  const ringScale = useTransform(intensity, (i) => 0.9 + 0.16 * i);
  const titleColor = useTransform(intensity, (i) => (i > 0.45 ? "#67e8f9" : "#ffffff"));

  return (
    <motion.div
      className="w-[100vw] md:w-[50vw] shrink-0 flex flex-col items-center text-center pointer-events-auto transform-gpu"
      style={{ opacity, scale }}
    >
      {/* Badge Icon Area */}
      <div className="relative mb-3.5 sm:mb-6 h-[88px] sm:h-[96px] flex items-center justify-center w-full">
        {/* Outer Charging Ring Glow (100% Hardware-Accelerated GPU CSS, replaces heavy SVG filter) */}
        <motion.div
          className="absolute w-[86px] h-[86px] sm:w-[96px] sm:h-[96px] rounded-full pointer-events-none z-0 transform-gpu"
          style={{
            opacity: ringOpacity,
            scale: ringScale,
            border: "3px solid #00d4ff",
            boxShadow: "0 0 16px #00d4ff, inset 0 0 8px rgba(0, 212, 255, 0.6)",
          }}
        />

        {/* Circular Badge Container */}
        <div
          className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full border border-cyan-400/40 sm:backdrop-blur-md overflow-hidden flex items-center justify-center relative z-10 bg-neutral-950/95 transform-gpu shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            <Image
              src="/chicken_logo.svg"
              alt="CFOCO Chicken Icon"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Year */}
      <div className="mb-1.5 sm:mb-2">
        <span
          className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-wider inline-block transform-gpu"
          style={{
            color: "transparent",
            WebkitTextStroke: "2px #E52528",
            filter: "drop-shadow(0 0 6px rgba(229, 37, 40, 0.4))",
          }}
        >
          {data.year}
        </span>
      </div>

      {/* Title */}
      <motion.h3
        className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-1.5 sm:mb-2 tracking-tight transition-colors duration-150"
        style={{ color: titleColor }}
      >
        {data.title}
      </motion.h3>

      {/* Description */}
      <div className="text-neutral-200 text-sm sm:text-base font-normal leading-snug w-full max-w-[280px] sm:max-w-xs px-2">
        <p>{data.descLine1}</p>
        <p>{data.descLine2}</p>
      </div>
    </motion.div>
  );
};

const Obsession: React.FC<ObsessionProps> = ({ items }) => {
  const milestones = items && items.length > 0 ? items : defaultMilestones;
  const N = milestones.length;

  const targetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${100 * ((N - 1) / N)}%`]);

  return (
    <div
      ref={targetRef}
      className="relative w-full bg-transparent select-none"
      // Responsive track height: snappier on mobile, fully extended on desktop
      style={{ height: `${N * 45 + 80}vh` }}
    >
      <section
        className={`sticky top-0 w-full h-screen supports-[height:100svh]:h-[100svh] overflow-hidden flex flex-col justify-center ${matter.className}`}
      >
        {/* Background Ambient Radial Gradient Glow */}
        <div className="absolute inset-0 pointer-events-none" />

        {/* Section Header */}
        <div className="w-full text-center space-y-1 mb-8 sm:mb-16 md:mb-20 px-4 absolute top-14 sm:top-20 md:top-24 left-0 right-0 z-20">
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            13 Years
          </h2>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            One Obsession
          </h2>
        </div>

        {/* Continuous Scrolling Track */}
        <div className="relative w-full h-full flex flex-col justify-center overflow-visible pointer-events-none">
          {/* Centering Wrapper: Its left edge is precisely the horizontal center of the screen for the first item */}
          <div className="absolute left-1/2 top-[56%] sm:top-[60%] md:top-[68%] -translate-x-1/2 -translate-y-1/2 w-[100vw] md:w-[50vw]">
            {/* Horizontal Laser Line Background */}
            <div className="absolute left-[-100vw] right-[-100vw] h-[2px] top-[44px] sm:top-[48px] -translate-y-1/2 z-0 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(2,136,255,0.4) 15%, rgba(2,136,255,0.4) 85%, transparent 100%)",
                }}
              />
            </div>

            <motion.div className="flex w-max items-start transform-gpu" style={{ x }}>
              {milestones.map((data, index) => (
                <MilestoneItem
                  key={index}
                  data={data}
                  index={index}
                  N={N}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Obsession;