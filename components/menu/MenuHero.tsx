"use client";

import React, { useEffect, useRef } from "react";
import { matter } from "@/font/fonts";

const Hero = () => {
  const videoRefDesktop = useRef<HTMLVideoElement>(null);
  const videoRefMobile = useRef<HTMLVideoElement>(null);
  const maskRefDesktop = useRef<SVGMaskElement>(null);
  const maskRefMobile = useRef<SVGMaskElement>(null);

  useEffect(() => {
    [maskRefDesktop, maskRefMobile].forEach((ref) => {
      if (ref.current) {
        ref.current.setAttribute("mask-type", "alpha");
      }
    });
    [videoRefDesktop, videoRefMobile].forEach((ref) => {
      if (ref.current) {
        ref.current.play().catch(() => {
          // Autoplay policy fallback handling
        });
      }
    });
  }, []);

  return (
    <section className={`relative w-full min-h-screen md:min-h-[calc(100vh-5rem)] flex flex-col items-center justify-between px-0 sm:px-6 lg:px-8 md:py-8 sm:py-12 bg-transparent select-none ${matter.className}`}>
      {/* Spacer for top balance on desktop */}
      {/* <div className="hidden md:block h-6" /> */}

      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center md:justify-start pt-[60%] sm:pt-[50%] lg:pt-44">
        {/* Large Headline with Video Inside Text - Desktop */}
        <div className="relative w-full hidden md:flex items-center justify-center">
          <svg
            viewBox="0 0 1380 280"
            className="w-full h-auto overflow-visible border-none outline-none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <mask
                ref={maskRefDesktop}
                id="crispy-text-mask-menu-desktop"
                maskUnits="userSpaceOnUse"
                style={{ maskType: "alpha" }}
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
                  fontSize="100"
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
                  fontSize="100"
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
              height="296"
              className="overflow-hidden"
            >
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden"
                style={{
                  background: "transparent",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitMaskImage: "url(#crispy-text-mask-menu-desktop)",
                  maskImage: "url(#crispy-text-mask-menu-desktop)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  contain: "paint",
                  isolation: "isolate",
                }}
              >
                <video
                  ref={videoRefDesktop}
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
                    border: "none",
                    outline: "none",
                    display: "block",
                  }}
                />
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Large Headline with Video Inside Text - Mobile */}
        <div className="relative w-full sm:max-w-md md:hidden px-2">
          <svg
            viewBox="0 0 1000 380"
            className="w-full h-auto overflow-visible border-none outline-none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <mask
                ref={maskRefMobile}
                id="crispy-text-mask-menu-mobile"
                maskUnits="userSpaceOnUse"
                style={{ maskType: "alpha" }}
                x="-100"
                y="-100"
                width="1200"
                height="580"
              >
                <text
                  x="500"
                  y="150"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  style={{
                    fontFamily: "var(--font-matter), sans-serif",
                    fontWeight: 700,
                  }}
                  fontSize="145"
                  letterSpacing="-3%"
                >
                  One Menu.
                </text>

                <text
                  x="500"
                  y="295"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  style={{
                    fontFamily: "var(--font-matter), sans-serif",
                    fontWeight: 700,
                  }}
                  fontSize="116"
                  letterSpacing="-3%"
                >
                  Endless Cravings.
                </text>
              </mask>
            </defs>

            <foreignObject
              x="2"
              y="2"
              width="996"
              height="376"
              className="overflow-hidden"
            >
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden"
                style={{
                  background: "transparent",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitMaskImage: "url(#crispy-text-mask-menu-mobile)",
                  maskImage: "url(#crispy-text-mask-menu-mobile)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  contain: "paint",
                  isolation: "isolate",
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
                  className="w-full h-full object-cover scale-110 brightness-110"
                  style={{
                    transform: "translateZ(0) scale(1.1)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    border: "none",
                    outline: "none",
                    display: "block",
                  }}
                />
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Subtitles */}
        <div className="mt-4 sm:mt-2 md:mt-0 text-center px-4 max-w-sm sm:max-w-md md:max-w-3xl">
          <p className="text-lg sm:text-xl md:text-2xl font-normal tracking-wide text-[#F2F2F2] leading-[1.25]">
            From signature favorites to bold new flavors, explore everything on the <span className="text-[#CC1518] font-medium">CFOCO</span> menu and find your next craving.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;