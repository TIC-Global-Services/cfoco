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
            viewBox="0 0 2200 400"
            className="w-full h-auto overflow-hidden drop-shadow-2xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask ref={maskRef} id="crispy-text-mask" x="0" y="0" width="100%" height="100%">
                <text
                  x="50%"
                  y="140"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  style={{
                    fontFamily: "var(--font-matter), sans-serif",
                    fontWeight: 700,
                  }}
                  fontSize="200"
                  letterSpacing="-3%"
                >
                 One Menu.
                </text>
                <text
                  x="50%"
                  y="280"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  style={{
                    fontFamily: "var(--font-matter), sans-serif",
                    fontWeight: 700,
                  }}
                  fontSize="180"
                  letterSpacing="-3%"
                >
                  Endless Cravings.
                </text>
              </mask>
            </defs>

            <foreignObject
              x="0"
              y="0"
              width="100%"
              height="100%"
            >
              <div
                className="w-full h-full flex items-center justify-center bg-transparent"
                style={{
                  WebkitMaskImage: "url(#crispy-text-mask)",
                  maskImage: "url(#crispy-text-mask)",
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
                  className="w-full h-full object-cover scale-105"
                />
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Subtitles */}
        <div className="mt-2 sm:mt-0 text-center">
          <p className="text-base sm:text-xl md:text-2xl font-normal tracking-wide text-[#F2F2F2] leading-[1.2] max-w-3xl">
            From signature favorites to bold new flavors, explore everything on the <span className="text-[#CC1518] font-medium">CFOCO</span> menu and find your next craving.
          </p>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      {/* <div className="pt-8 pb-2 flex flex-col items-center justify-center gap-1.5 opacity-50 hover:opacity-90 transition-opacity duration-300">
        <span className="text-xs sm:text-sm tracking-wider text-neutral-400 font-light">
          Scroll To Continue
        </span>
        <div className="w-3.5 h-3.5 rounded-full border border-neutral-400/50 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-neutral-400 animate-pulse" />
        </div>
      </div> */}
    </section>
  );
};

export default Hero;