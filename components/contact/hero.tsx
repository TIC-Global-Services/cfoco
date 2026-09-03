"use client";

import React, { useEffect, useRef } from "react";
import { matter } from "@/font/fonts";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
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
            viewBox="0 0 1380 230"
            className="w-full h-auto overflow-hidden drop-shadow-2xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask id="crispy-text-mask" x="0" y="0" width="100%" height="100%">
                <rect width="100%" height="100%" fill="black" />
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
                  Let’s Talk Cravings
                </text>
              </mask>
            </defs>

            <foreignObject
              x="0"
              y="0"
              width="100%"
              height="100%"
              mask="url(#crispy-text-mask)"
            >
              <div className="w-full h-full flex items-center justify-center bg-transparent">
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
        <div className="mt-8 sm:mt-2 text-center">
          <p className="text-base sm:text-xl md:text-2xl font-normal tracking-wide text-[#F2F2F2]">
            Got a question, feedback, partnership idea, or need a little help? Whatever’s on your mind, th{" "}
            <span className="text-[#CC1518] font-medium">CFOCO</span>.
          </p>
          <p className="text-base sm:text-xl md:text-2xl font-normal tracking-wide text-[#F2F2F2]">
            team is here to listen, help, and keep things moving.
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