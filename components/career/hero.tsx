"use client";

import React, { useEffect, useRef } from "react";
import { matter } from "@/font/fonts";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRefMobile = useRef<HTMLVideoElement>(null);
  const maskRefDesktop = useRef<SVGMaskElement>(null);
  const maskRefMobile = useRef<SVGMaskElement>(null);

  useEffect(() => {
    [maskRefDesktop, maskRefMobile].forEach((ref) => {
      if (ref.current) {
        ref.current.setAttribute("mask-type", "alpha");
      }
    });
    [videoRef, videoRefMobile].forEach((ref) => {
      if (ref.current) {
        ref.current.play().catch(() => {
          // Autoplay policy fallback handling
        });
      }
    });
  }, []);

  return (
    <section className={`relative w-full min-h-screen flex flex-col items-center justify-between px-0 sm:px-6 lg:px-8 bg-transparent select-none ${matter.className}`}>
      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center md:justify-start pt-[60%] sm:pt-[50%] lg:pt-44">
        {/* Large Headline with Video Inside Text - Desktop */}
        <div className="relative w-full hidden md:flex items-center justify-center">
          <svg
            viewBox="0 0 2200 400"
            className="w-full h-auto overflow-visible border-none outline-none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <mask
                ref={maskRefDesktop}
                id="crispy-text-mask-career-desktop"
                maskUnits="userSpaceOnUse"
                x="-100"
                y="-100"
                width="2400"
                height="600"
              >
                <text
                  x="1100"
                  y="140"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  style={{
                    fontFamily: "var(--font-matter), sans-serif",
                    fontWeight: 700,
                  }}
                  fontSize="150"
                  letterSpacing="-4%"
                >
                  Build Your
                </text>

                <text
                  x="1100"
                  y="280"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  style={{
                    fontFamily: "var(--font-matter), sans-serif",
                    fontWeight: 700,
                  }}
                  fontSize="150"
                  letterSpacing="-4%"
                >
                  Future With Us
                </text>
              </mask>
            </defs>

            <foreignObject
              x="2"
              y="2"
              width="2196"
              height="396"
            >
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: "transparent",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitMaskImage: "url(#crispy-text-mask-career-desktop)",
                  maskImage: "url(#crispy-text-mask-career-desktop)",
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

        {/* Large Headline with Video Inside Text - Mobile */}
        <div className="relative w-full sm:max-w-md md:hidden">
          <svg
            viewBox="0 0 1000 380"
            className="w-full h-auto overflow-visible border-none outline-none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <mask
                ref={maskRefMobile}
                id="crispy-text-mask-career-mobile"
                maskUnits="userSpaceOnUse"
                x="-100"
                y="-100"
                width="1200"
                height="580"
              >
                <text
                  x="500"
                  y="160"
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
                  build your
                </text>

                <text
                  x="500"
                  y="300"
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
                  future with us.
                </text>
              </mask>
            </defs>

            <foreignObject
              x="2"
              y="2"
              width="996"
              height="376"
            >
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: "transparent",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitMaskImage: "url(#crispy-text-mask-career-mobile)",
                  maskImage: "url(#crispy-text-mask-career-mobile)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              >
                <video
                  ref={videoRefMobile}
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
        <div className="mt-2 sm:mt-2 text-center px-4">
          <p className="text-xl sm:text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.2] max-w-3xl">
            Join a team driven by innovation, collaboration, and a shared passion
            for making a meaningful impact <span className="text-[#CC1518] font-medium">every day.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;