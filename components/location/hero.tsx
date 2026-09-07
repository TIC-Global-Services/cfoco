"use client";

import React, { useEffect, useRef, useState } from "react";
import { matter } from "@/font/fonts";

const Hero = () => {
  const videoRefDesktop = useRef<HTMLVideoElement>(null);
  const videoRefMobile = useRef<HTMLVideoElement>(null);
  const maskRefDesktop = useRef<SVGMaskElement>(null);
  const maskRefMobile = useRef<SVGMaskElement>(null);
  const [isReady, setIsReady] = useState(false);

  const handleVideoReady = () => {
    setIsReady(true);
  };

  useEffect(() => {
    [maskRefDesktop, maskRefMobile].forEach((ref) => {
      if (ref.current) {
        ref.current.setAttribute("mask-type", "alpha");
      }
    });

    [videoRefDesktop, videoRefMobile].forEach((ref) => {
      if (ref.current) {
        if (ref.current.readyState >= 2) {
          setIsReady(true);
        }
        ref.current.play().catch(() => {
          // Autoplay policy fallback handling
        });
      }
    });

    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={`relative w-full min-h-screen flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8 bg-transparent select-none ${matter.className}`}>
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
                id="crispy-text-mask-location-desktop"
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
                  Five Kitchens.
                </text>

                <text
                  x="50%"
                  y="66%"
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
                  One Standard. find yours.
                </text>
              </mask>
            </defs>

            <foreignObject
              x="2"
              y="2"
              width="1376"
              height="296"
              className="overflow-hidden border-none outline-none"
              style={{ overflow: "hidden", border: "none", outline: "none" }}
            >
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden border-none outline-none"
                style={{
                  background: "transparent",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitMaskImage: "url(#crispy-text-mask-location-desktop)",
                  maskImage: "url(#crispy-text-mask-location-desktop)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  contain: "paint",
                  isolation: "isolate",
                  border: "none",
                  outline: "none",
                  opacity: isReady ? 1 : 0,
                  transition: "opacity 0.3s ease-out",
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
                  onLoadedData={handleVideoReady}
                  onCanPlay={handleVideoReady}
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
        <div className="relative w-full flex md:hidden items-center justify-center">
          <svg
            viewBox="0 0 1380 300"
            className="w-full h-auto overflow-visible border-none outline-none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <mask
                ref={maskRefMobile}
                id="crispy-text-mask-location-mobile"
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
                  fontSize="130"
                  letterSpacing="-3%"
                >
                  Five Kitchens.
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
                  fontSize="95"
                  letterSpacing="-3%"
                >
                  One Standard. find yours.
                </text>
              </mask>
            </defs>

            <foreignObject
              x="2"
              y="2"
              width="1376"
              height="296"
              className="overflow-hidden border-none outline-none"
              style={{ overflow: "hidden", border: "none", outline: "none" }}
            >
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden border-none outline-none"
                style={{
                  background: "transparent",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitMaskImage: "url(#crispy-text-mask-location-mobile)",
                  maskImage: "url(#crispy-text-mask-location-mobile)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  contain: "paint",
                  isolation: "isolate",
                  border: "none",
                  outline: "none",
                  opacity: isReady ? 1 : 0,
                  transition: "opacity 0.3s ease-out",
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
                  onLoadedData={handleVideoReady}
                  onCanPlay={handleVideoReady}
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
        <div className="mt-4 md:mt-0 text-center px-4">
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.3]">
            Across <span className="text-[#CC1518] font-medium">Bordeaux</span> And Beyond
          </p>
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.3] mt-1 hidden md:block">
            Every CFC Is The Same Promise, Cooked Fresh Where You Are.
          </p>
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.3] mt-1 md:hidden">
            Every CFC Is The Same Promise,
          </p>
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.3] mt-0.5 md:hidden">
            Cooked Fresh Where You Are.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;