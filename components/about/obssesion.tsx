"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";
import { motion, useScroll, useTransform, MotionValue, mix } from "framer-motion";

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

  // useTransform with a callback function bypasses WAAPI and prevents "Offsets must be monotonically non-decreasing" errors
  const opacity = useTransform(scrollYProgress, (p) => {
    const intensity = Math.max(0, 1 - Math.abs(p - centerPos) / 0.2);
    return 0.25 + 0.75 * intensity;
  });

  const scale = useTransform(scrollYProgress, (p) => {
    const intensity = Math.max(0, 1 - Math.abs(p - centerPos) / 0.2);
    return 0.85 + 0.15 * intensity;
  });

  const ringOpacity = useTransform(scrollYProgress, (p) => {
    const intensity = Math.max(0, 1 - Math.abs(p - centerPos) / 0.2);
    return intensity;
  });

  const ringScale = useTransform(scrollYProgress, (p) => {
    const intensity = Math.max(0, 1 - Math.abs(p - centerPos) / 0.2);
    return 0.9 + 0.15 * intensity;
  });

  const borderColor = useTransform(scrollYProgress, (p) => {
    const intensity = Math.max(0, 1 - Math.abs(p - centerPos) / 0.2);
    return mix("rgba(255,255,255,0.4)", "rgba(34,211,238,1)")(intensity);
  });

  const titleColor = useTransform(scrollYProgress, (p) => {
    const intensity = Math.max(0, 1 - Math.abs(p - centerPos) / 0.2);
    return mix("#ffffff", "#67e8f9")(intensity);
  });

  return (
    <motion.div
      className="w-[100vw] md:w-[50vw] shrink-0 flex flex-col items-center text-center pointer-events-auto"
      style={{ opacity, scale }}
    >
      {/* Badge Icon Area */}
      <div className="relative mb-6 h-[88px] sm:h-[96px] flex items-center justify-center w-full">
        {/* Outer Charging Ring Glow */}
        <motion.div
          className="absolute w-[104px] h-[104px] sm:w-[114px] sm:h-[114px] pointer-events-none z-0"
          style={{ opacity: ringOpacity, scale: ringScale }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              <filter id={`trainRingGlow-${index}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="41"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="4"
              filter={`url(#trainRingGlow-${index})`}
            />
            <circle
              cx="50"
              cy="50"
              r="41"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity="0.95"
            />
          </svg>
        </motion.div>

        {/* Circular Badge Container */}
        <motion.div
          className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full backdrop-blur-md border-t border-b overflow-hidden flex items-center justify-center relative z-10 bg-neutral-950"
          style={{ borderColor, borderWidth: "1px" }}
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            <Image
              src="/chicken_logo.svg"
              alt="CFOCO Chicken Icon"
              fill
              className="object-contain"
            />
          </div>
        </motion.div>
      </div>

      {/* Year */}
      <div className="mb-2">
        <span
          className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-wider inline-block"
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
        className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-2 tracking-tight"
        style={{ color: titleColor }}
      >
        {data.title}
      </motion.h3>

      {/* Description */}
      <div className="text-white text-sm sm:text-base font-normal leading-snug w-full max-w-xs">
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
      style={{ height: `${N * 50 + 100}vh` }} // +100vh ensures the content stays pinned while scrolling
    >
      <section
        className={`sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-center ${matter.className}`}
      >
        {/* Background Ambient Radial Gradient Glow */}
        <div className="absolute inset-0 pointer-events-none" />

        {/* Section Header */}
        <div className="w-full text-center space-y-1 mb-16 sm:mb-20 md:mb-24 px-[5%] absolute top-20 sm:top-24 left-0 right-0 z-20">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            13 Years
          </h2>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            One Obsession
          </h2>
        </div>

        {/* Continuous Scrolling Track */}
        <div className="relative w-full h-full flex flex-col justify-center overflow-visible pointer-events-none">
          {/* Centering Wrapper: Its left edge is precisely the horizontal center of the screen for the first item */}
          <div className="absolute left-1/2 top-[50%] md:top-[70%] -translate-x-1/2 -translate-y-1/2 w-[100vw] md:w-[50vw]">
            {/* Horizontal Laser Line Background perfectly aligned with the badges */}
            <div className="absolute left-[-100vw] right-[-100vw] h-[2px] top-[44px] sm:top-[48px] -translate-y-1/2 z-0 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(2,136,255,0.4) 15%, rgba(2,136,255,0.4) 85%, transparent 100%)",
                }}
              />
            </div>

            <motion.div className="flex w-max items-start" style={{ x }}>
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