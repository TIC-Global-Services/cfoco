"use client";

import React, { useEffect, useRef } from "react";
import { matter } from "@/font/fonts";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const maskRef = useRef<SVGMaskElement>(null);

  useEffect(() => {
    if (maskRef.current) {
      maskRef.current.setAttribute("mask-type", "alpha");
    }
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback handling
      });
    }
  }, []);

  return (
    <section className={`relative w-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-transparent select-none ${matter.className}`}>
      {/* Spacer for top balance */}
      <div className="hidden sm:block h-6" />

      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center justify-center my-auto">
        {/* Large Headline with Video Inside Text */}
        <div className="relative w-full flex items-center justify-center">
          <svg
            viewBox="0 0 1380 300"
            className="w-full h-auto overflow-visible border-none outline-none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <mask
                ref={maskRef}
                id="crispy-text-mask-menu"
                maskUnits="userSpaceOnUse"
                x="-100"
                y="-100"
                width="1580"
                height="540"
              >
                <text
                  x="50%"
                  y="34%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  style={{
                    fontFamily: "var(--font-matter), sans-serif",
                    fontWeight: 700,
                  }}
                  fontSize="130"
                  letterSpacing="-3%"
                >
                  One Menu.
                </text>
                <text
                  x="50%"
                  y="68%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  style={{
                    fontFamily: "var(--font-matter), sans-serif",
                    fontWeight: 700,
                  }}
                  fontSize="120"
                  letterSpacing="-3%"
                >
                  Endless Cravings.
                </text>
              </mask>
            </defs>

            <foreignObject
              x="2"
              y="2"
              width="1376"
              height="336"
            >
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: "transparent",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitMaskImage: "url(#crispy-text-mask-menu)",
                  maskImage: "url(#crispy-text-mask-menu)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
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
                  className="w-full h-full object-cover scale-110 brightness-110"
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
        <div className="mt-4 sm:mt-0 text-center">
          <p className="text-base sm:text-xl md:text-2xl font-normal tracking-wide text-[#F2F2F2] leading-[1.2] max-w-3xl">
            From signature favorites to bold new flavors, explore everything on the <span className="text-[#CC1518] font-medium">CFOCO</span> menu and find your next craving.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;