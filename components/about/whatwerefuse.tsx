"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { matter } from "@/font/fonts";

interface PillarItem {
  id: string;
  title: string;
  lines: string[];
}

const leftPillar: PillarItem = {
  id: "conviviality",
  title: "Conviviality",
  lines: ["Great Meals Are Meant To Be Shared.", "So Is A Good Time."],
};

const rightPillar: PillarItem = {
  id: "speed",
  title: "Speed",
  lines: ["Fast Food Should Be Fast And", "Still Be Food."],
};

const bottomPillar: PillarItem = {
  id: "quality",
  title: "Quality",
  lines: [
    "If It's Not Crispy Enough To Hear, It Doesn't",
    "Leave The Kitchen.",
  ],
};

const ORBIT_DURATION = 12; // seconds per full rotation
const CONTACT_THRESHOLD = 12; // degrees range to count as "touching"

// Anchor positions in degrees (clockwise from top):
// Right (Speed) = 90°, Bottom (Quality) = 180°, Left (Conviviality) = 270°
const ANCHORS = {
  right: 90,
  bottom: 180,
  left: 270,
};

function angleDiff(a: number, b: number) {
  let d = (a - b + 360) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

const WhatWeRefuse = () => {
  const rotation = useMotionValue(0);
  const startTimeRef = useRef(Date.now());

  const [touching, setTouching] = useState({
    right: false,
    bottom: false,
    left: false,
  });

  // Track the actual angle and compute which anchors are being touched
  useAnimationFrame(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const angle = ((elapsed / ORBIT_DURATION) * 360) % 360;
    rotation.set(angle);

    const newRight = angleDiff(angle, ANCHORS.right) < CONTACT_THRESHOLD;
    const newBottom = angleDiff(angle, ANCHORS.bottom) < CONTACT_THRESHOLD;
    const newLeft = angleDiff(angle, ANCHORS.left) < CONTACT_THRESHOLD;

    setTouching((prev) => {
      if (
        prev.right !== newRight ||
        prev.bottom !== newBottom ||
        prev.left !== newLeft
      ) {
        return { right: newRight, bottom: newBottom, left: newLeft };
      }
      return prev;
    });
  });

  // Moving dot color
  const dotTouchingAny = touching.right || touching.bottom || touching.left;

  return (
    <section
      className={`relative w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-transparent select-none overflow-hidden ${matter.className}`}
    >
      {/* Subtle Atmospheric Spotlight / Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 md:mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-[3.125rem] font-bold tracking-tight text-[#E5A823] leading-[1.15]"
        >
          What We Refuse
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-[4.375rem] font-bold tracking-tight text-[#E5A823] leading-none"
        >
          To Compromise
        </motion.h2>
      </div>

      {/* Interactive Orbit Stage */}
      <div className="relative ">
        {/* Desktop / Tablet Layout: Center Orbit with Left & Right Pillars */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4 relative">
          {/* Left Pillar: Conviviality (270°) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full text-center lg:text-right z-10 order-2 lg:order-1 px-4"
          >
            <h3
              className="text-2xl sm:text-3xl md:text-[2.5rem] font-bold mb-2 sm:mb-3 text-center"
              style={{
                color: touching.left ? "#E52320" : "#ffffff",
                transform: touching.left ? "scale(1.06)" : "scale(1)",
                transition: "color 0.15s, transform 0.15s",
              }}
            >
              {leftPillar.title}
            </h3>
            {leftPillar.lines.map((line, idx) => (
              <p
                key={idx}
                className="text-sm sm:text-base md:text-[1.375rem] text-[#D7D7D7] font-normal text-center leading-[1.2]"
              >
                {line}
              </p>
            ))}
          </motion.div>

          {/* Central Orbit Circle with Floating Fried Chicken */}
          <div className="relative flex items-center justify-center order-1 lg:order-2 shrink-0">
            {/* Main Orbit Ring Container */}
            <div className="relative w-[290px] h-[290px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] flex items-center justify-center">
              {/* Static Glowing Orbit Base Ring */}
              <div className="absolute inset-0 rounded-full border-[1.5px] border-blue-400/40 shadow-[0_0_25px_rgba(56,189,248,0.25)]" />

              {/* Secondary Outer Subtle Glow Ring */}
              <div className="absolute -inset-4 rounded-full border border-blue-500/10 pointer-events-none" />

              {/* Continuously Rotating Orbit Layer with ONE Moving Dot */}
              <motion.div
                style={{ rotate: rotation }}
                className="absolute inset-0 rounded-full pointer-events-none"
              >
                {/* Single Orbiting Dot */}
                <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: dotTouchingAny ? "#E52320" : "#38bdf8",
                      boxShadow: dotTouchingAny
                        ? "0 0 10px #E52320"
                        : "0 0 10px #38bdf8",
                      transition:
                        "background-color 0.15s, box-shadow 0.15s",
                    }}
                  />
                </div>
              </motion.div>

              {/* Rotating Dashed Accent Ring (Counter-clockwise subtle spin) */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  repeat: Infinity,
                  duration: 40,
                  ease: "linear",
                }}
                className="absolute inset-2 rounded-full border border-dashed border-sky-400/20 pointer-events-none"
              />

              {/* Fixed Anchor Dots */}

              {/* Left Point (9 o'clock / Conviviality: 270°) */}
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                <div
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full"
                  style={{
                    backgroundColor: touching.left ? "#E52320" : "#38bdf8",
                    boxShadow: touching.left
                      ? "0 0 12px #E52320"
                      : "0 0 12px #38bdf8",
                    transform: touching.left ? "scale(1.4)" : "scale(1)",
                    transition:
                      "background-color 0.15s, box-shadow 0.15s, transform 0.15s",
                  }}
                />
              </div>

              {/* Right Point (3 o'clock / Speed: 90°) */}
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                <div
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full"
                  style={{
                    backgroundColor: touching.right ? "#E52320" : "#38bdf8",
                    boxShadow: touching.right
                      ? "0 0 12px #E52320"
                      : "0 0 12px #38bdf8",
                    transform: touching.right ? "scale(1.4)" : "scale(1)",
                    transition:
                      "background-color 0.15s, box-shadow 0.15s, transform 0.15s",
                  }}
                />
              </div>

              {/* Bottom Point (6 o'clock / Quality: 180°) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 flex items-center justify-center">
                <div
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center bg-[#0d1424]"
                  style={{
                    borderColor: touching.bottom ? "#E52320" : "#38bdf8",
                    transition: "border-color 0.15s",
                  }}
                >
                  <div
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                    style={{
                      backgroundColor: touching.bottom
                        ? "#E52320"
                        : "#38bdf8",
                      boxShadow: touching.bottom
                        ? "0 0 10px #E52320"
                        : "0 0 10px #38bdf8",
                      transition:
                        "background-color 0.15s, box-shadow 0.15s",
                    }}
                  />
                </div>
              </div>

              {/* Center Fried Chicken with Gentle Floating Animation */}
              <motion.div
                animate={{
                  y: [-6, 6, -6],
                  rotate: [-1.5, 1.5, -1.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4.5,
                  ease: "easeInOut",
                }}
                className="relative w-[180px] h-[220px] sm:w-[240px] sm:h-[290px] md:w-[280px] md:h-[440px] z-10 drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <Image
                  src="/fried_chicken.png"
                  alt="Crispy Fried Chicken Drumstick"
                  fill
                  priority
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>

          {/* Right Pillar: Speed (90°) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full text-center lg:text-left z-10 order-3 px-4"
          >
            <h3
              className="text-2xl sm:text-3xl md:text-[2.5rem] text-center font-bold mb-2 sm:mb-3"
              style={{
                color: touching.right ? "#E52320" : "#ffffff",
                transform: touching.right ? "scale(1.06)" : "scale(1)",
                transition: "color 0.15s, transform 0.15s",
              }}
            >
              {rightPillar.title}
            </h3>
            {rightPillar.lines.map((line, idx) => (
              <p
                key={idx}
                className="text-sm sm:text-base md:text-[1.375rem] text-[#D7D7D7] font-normal text-center leading-[1.2]"
              >
                {line}
              </p>
            ))}
          </motion.div>
        </div>

        {/* Bottom Pillar: Quality (180°) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-center mt-10 sm:mt-14 md:mt-16 z-10 px-4"
        >
          <h3
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3"
            style={{
              color: touching.bottom ? "#E52320" : "#ffffff",
              transform: touching.bottom ? "scale(1.06)" : "scale(1)",
              transition: "color 0.15s, transform 0.15s",
            }}
          >
            {bottomPillar.title}
          </h3>
          {bottomPillar.lines.map((line, idx) => (
            <p
              key={idx}
              className="text-sm sm:text-base md:text-lg text-neutral-400 font-normal leading-relaxed"
            >
              {line}
            </p>
          ))}
        </motion.div>
      </div>

      {/* Bottom Floor Ambient Reflection Shadow */}
      <div className="w-full max-w-4xl mx-auto h-12 bg-gradient-to-t from-transparent via-blue-900/10 to-transparent blur-xl pointer-events-none mt-6" />
    </section>
  );
};

export default WhatWeRefuse;