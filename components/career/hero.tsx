"use client";

import React, { useEffect, useRef } from "react";
import { matter } from "@/font/fonts";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRefMobile = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    [videoRef, videoRefMobile].forEach((ref) => {
      if (ref.current) {
        ref.current.play().catch(() => {
          // Autoplay policy fallback handling
        });
      }
    });
  }, []);

  return (
    <section className={`relative w-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-transparent select-none ${matter.className}`}>
      {/* Spacer for top balance */}
      <div className="hidden sm:block h-6" />

      {/* Main Content Area */}
      <div className="w-full  flex flex-col items-center justify-center my-auto">
        {/* Large Headline with Video Inside Text */}
        <div className="relative w-full md:flex items-center hidden  justify-center overflow-hidden">
          <svg
            viewBox="0 0 2200 400"
            className="w-full h-auto block"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask
                id="crispy-text-mask"
                maskUnits="userSpaceOnUse"
                maskContentUnits="userSpaceOnUse"
                x="-100"
                y="-100"
                width="2400"
                height="600"
                style={{ maskType: "luminance" }}
              >
                {/* Black background */}
                <rect
                  x="-100"
                  y="-100"
                  width="2400"
                  height="600"
                  fill="black"
                />

                {/* White text */}
                <text
                  x="1100"
                  y="160"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontFamily="var(--font-matter), sans-serif"
                  fontWeight="700"
                  fontSize="150"
                  letterSpacing="-4"
                >
                  Build Your
                </text>

                <text
                  x="1100"
                  y="300"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontFamily="var(--font-matter), sans-serif"
                  fontWeight="700"
                  fontSize="150"
                  letterSpacing="-4"
                >
                  Future With Us
                </text>
              </mask>
            </defs>

            <foreignObject
              x="-100"
              y="-100"
              width="2400"
              height="600"
              mask="url(#crispy-text-mask)"
            >
              <div className="w-full h-full">
                <video
                  ref={videoRef}
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
        <div className="relative w-full  sm:max-w-md md:hidden">
          <svg
            viewBox="0 0 1000 380"
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
                  build your
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
                  future with us.
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
        <div className="mt-0 sm:mt-0 text-center">
          <p className="text-xl sm:text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.2] max-w-3xl">
            Join a team driven by innovation, collaboration, and a shared passion
            for making a meaningful impact <span className="text-[#CC1518] font-medium">every day.</span>
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