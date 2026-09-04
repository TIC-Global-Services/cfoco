"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { matter } from "@/font/fonts";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
    restDelta: 0.001,
  });

  // 1. HERO PHASE TRANSFORMS (Progress 0.0 -> 0.28)
  // Pure fade out — no movement or scale to avoid mask flicker
  const heroOpacity = useTransform(smoothProgress, [0, 0.24], [1, 0]);

  // 2. HANDS ANIMATION TRANSFORMS (Progress 0.12 -> 0.48)
  // Emerge from beyond screen edges and glide to the exact diagonal rest position
  const leftX = useTransform(smoothProgress, [0.12, 0.48, 1], ["-35%", "0%", "0%"]);
  const leftY = useTransform(smoothProgress, [0.12, 0.48, 1], ["35%", "0%", "0%"]);
  const leftOpacity = useTransform(smoothProgress, [0.12, 0.32], [0, 1]);

  const rightX = useTransform(smoothProgress, [0.12, 0.48, 1], ["35%", "0%", "0%"]);
  const rightY = useTransform(smoothProgress, [0.12, 0.48, 1], ["-35%", "0%", "0%"]);
  const rightOpacity = useTransform(smoothProgress, [0.12, 0.32], [0, 1]);

  // 3. STORY TEXT REVEAL TRANSFORMS (Progress 0.42 -> 0.65)
  // Once hands settle, top-left headline and bottom-right paragraphs appear smoothly
  const textOpacity = useTransform(smoothProgress, [0.42, 0.62], [0, 1]);
  const headlineY = useTransform(smoothProgress, [0.42, 0.62], [-25, 0]);
  const descY = useTransform(smoothProgress, [0.42, 0.62], [25, 0]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback handling
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[320vh] bg-transparent select-none ${matter.className}`}
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between pt-16 sm:pt-20 md:pt-0  px-6 sm:px-10 lg:px-16 overflow-hidden">
        {/* Ambient Atmosphere Glow */}
        {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] bg-blue-600/10 rounded-full blur-[170px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" /> */}


        <motion.div
          style={{
            opacity: heroOpacity,
            willChange: "opacity",
          }}
          className="absolute inset-0 flex flex-col items-center justify-between py-12 sm:py-16 px-4 pointer-events-none z-30"
        >
          {/* <div className="hidden sm:block h-6" /> */}

          {/* Large Headline with Video Mask */}
          <div className="w-full flex flex-col items-center md:justify-start pt-[60%] sm:pt-[50%] lg:pt-25">
            <div className="relative w-full flex items-center justify-center">

              <svg
                viewBox="0 0 1380 230"
                className="w-full h-auto overflow-visible border-none outline-none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <mask
                    id="crispy-text-mask-hero"
                    maskUnits="userSpaceOnUse"
                    x="-100"
                    y="-100"
                    width="1580"
                    height="430"
                  >
                    {/* Black = hidden */}
                    <rect
                      x="-100"
                      y="-100"
                      width="1580"
                      height="430"
                      fill="black"
                    />

                    {/* White text = visible */}
                    <text
                      x="50%"
                      y="58%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      style={{
                        fontFamily: "var(--font-matter), sans-serif",
                        fontWeight: 700,
                      }}
                      fontSize="150"
                      letterSpacing="-3%"
                    >
                      Crispy Since 2011.
                    </text>
                  </mask>
                </defs>

                {/* Video inside SVG mask */}
                <foreignObject
                  x="2"
                  y="2"
                  width="1376"
                  height="226"
                  mask="url(#crispy-text-mask-hero)"
                >
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: "transparent",
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <video
                      ref={videoRef}
                      src="/bg_about_video.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover scale-110"
                      style={{
                        transform: "translateZ(0) scale(1.1)",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    />
                  </div>
                </foreignObject>
              </svg>

            </div>

            {/* Subtitles */}
            <div className="mt-8 sm:mt-0 text-center">
              <p className="text-base sm:text-xl md:text-2xl font-medium tracking-wide text-[#F2F2F2]">
                A Recipe Born In{" "}
                <span className="text-[#CC1518] font-medium">Bordeaux</span>.
              </p>
              <p className="text-base sm:text-xl md:text-2xl leading-none font-medium tracking-wide text-[#F2F2F2]">
                An Obsession That Never Cooled.
              </p>
            </div>
          </div>

          <div className="hidden sm:block h-6" />
        </motion.div>

        <div className="w-full z-20">
          <motion.div
            style={{ opacity: textOpacity, y: headlineY }}
            className="max-w-2xl text-center md:text-left"
          >
            <h2 className="text-4xl sm:text-5xl md:text-[3.75rem] lg:text-[4.375rem] font-bold tracking-tight text-white leading-[1.08]">
              It Started With <br />
              A Simple Frustration.
            </h2>
          </motion.div>
        </div>

        {/* Full-Bleed Hands Collision Stage (Wrists extend beyond screen edges) */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {/* Left Hand (Bottom-Left Corner) */}
          <motion.div
            style={{
              x: leftX,
              y: leftY,
              opacity: leftOpacity,
            }}
            className="absolute left-[-24vw] bottom-[30vh] sm:left-[-6vw] sm:bottom-[1vh] w-[55vw] min-w-[340px] max-w-[950px] h-full"
          >
            <div className="relative w-full h-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.85)]">
              <Image
                src="/left-hand-new.png"
                alt="Left Hand holding Crispy Chicken"
                fill
                priority
                className="object-contain object-left-bottom rotate-10"
              />
            </div>
          </motion.div>

          {/* Right Hand (Top-Right Corner) */}
          <motion.div
            style={{
              x: rightX,
              y: rightY,
              opacity: rightOpacity,
            }}
            className="absolute right-[-35vw] top-[12vh] sm:right-[-6vw] sm:top-[-5vh] w-[55vw] min-w-[340px] max-w-[950px] aspect-[4/3]"
          >
            <div className="relative w-full h-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.85)]">
              <Image
                src="/right_hand.png"
                alt="Right Hand holding Crispy Chicken"
                fill
                priority
                className="object-cover object-right-top"
              />
            </div>
          </motion.div>
        </div>

        {/* Bottom-Right Story Paragraphs */}
        <div className="w-full mt-auto z-20 flex justify-end items-end">
          <motion.div
            style={{ opacity: textOpacity, y: descY }}
            className="max-w-xl md:max-w-4xl text-center sm:text-right space-y-3"
          >
            <p className="text-sm sm:text-base md:text-2xl leading-none text-[#E0E0E0] font-medium whitespace-pre-line">
              In 2011, Our Founders Were Tired Of The Same Thing Everyone Was Tired Of:<br className="hidden md:block" />
              Fried Chicken That Promised The World And Delivered Grease. So They Did The
              Stubborn Thing{" "}
              <span className="text-[#E52320] font-medium">
                They Started Over. Hundreds Of Tests.
              </span>
            </p>
            <p className="text-sm sm:text-base md:text-2xl leading-none text-[#E0E0E0] font-medium">
              One Relentless Question: What Does Perfect Actually Taste Like? The
              Answer Became{" "}
              <span className="text-[#E5A823] font-semibold">CFC</span>. Fresh,
              Never Frozen. Bold, Never Boring.<br className="hidden md:block" /> Crispy In A Way You Feel Before You
              Taste.
            </p>
          </motion.div>
        </div>

        {/* Bottom Floor Ambient Reflection Shadow */}
        <div className="w-full max-w-5xl mx-auto h-6 bg-gradient-to-t from-transparent via-blue-900/10 to-transparent blur-xl pointer-events-none" />
      </div>
    </div>
  );
};

export default Hero;