"use client";

import React, { useEffect, useRef } from "react";
import { matter } from "@/font/fonts";

const Hero = () => {
  const videoRefDesktop = useRef<HTMLVideoElement>(null);
  const videoRefMobile = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    [videoRefDesktop, videoRefMobile].forEach((ref) => {
      if (ref.current) {
        ref.current.play().catch(() => {
          // Autoplay policy fallback handling
        });
      }
    });
  }, []);

  return (
    <section className={`relative w-full min-h-screen flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8 bg-transparent select-none ${matter.className}`}>
      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center md:justify-start pt-[60%] sm:pt-[50%] lg:pt-44">
        {/* Large Headline with Video Inside Text - Desktop */}
        <div className="relative w-full hidden md:block">
          <svg
            viewBox="0 0 2200 400"
            className="w-full h-auto block"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id="crispy-text-clip-desktop">
                <text
                  x="1100"
                  y="140"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-matter), sans-serif"
                  fontWeight="700"
                  fontSize="150"
                  letterSpacing="-4"
                >
                  Five Kitchens.
                </text>

                <text
                  x="1100"
                  y="280"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-matter), sans-serif"
                  fontWeight="700"
                  fontSize="150"
                  letterSpacing="-4"
                >
                  One Standard. Find Yours.
                </text>
              </clipPath>
            </defs>

            <foreignObject
              x="0"
              y="0"
              width="2200"
              height="400"
              clipPath="url(#crispy-text-clip-desktop)"
            >
              <div className="w-full h-full">
                <video
                  ref={videoRefDesktop}
                  src="/bg_about_video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Large Headline with Video Inside Text - Mobile */}
        <div className="relative w-full max-w-sm sm:max-w-md md:hidden">
          <svg
            viewBox="0 0 1000 580"
            className="w-full h-auto block"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id="crispy-text-clip-mobile">
                <text
                  x="500"
                  y="160"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-matter), sans-serif"
                  fontWeight="700"
                  fontSize="150"
                  letterSpacing="-3"
                >
                  Five Kitchens.
                </text>

                <text
                  x="500"
                  y="300"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-matter), sans-serif"
                  fontWeight="700"
                  fontSize="150"
                  letterSpacing="-3"
                >
                  One Standard.
                </text>

                <text
                  x="500"
                  y="460"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-matter), sans-serif"
                  fontWeight="700"
                  fontSize="150"
                  letterSpacing="-3"
                >
                  Find Yours.
                </text>
              </clipPath>
            </defs>

            <foreignObject
              x="0"
              y="0"
              width="1000"
              height="580"
              clipPath="url(#crispy-text-clip-mobile)"
            >
              <div className="w-full h-full">
                <video
                  ref={videoRefMobile}
                  src="/bg_about_video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Subtitles */}
        <div className="mt-4 md:mt-2 text-center px-4">
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