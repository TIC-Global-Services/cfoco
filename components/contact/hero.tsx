"use client";

import React, { useEffect, useRef } from "react";
import { matter } from "@/font/fonts";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRefMobile = useRef<HTMLVideoElement>(null);
  const maskRef = useRef<SVGMaskElement>(null);

  useEffect(() => {
    if (maskRef.current) {
      maskRef.current.setAttribute("mask-type", "alpha");
    }
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
        {/* Large Headline with Video Inside Text */}
        <div className="relative w-full hidden md:flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 1380 230"
            className="w-full h-auto block"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask
                ref={maskRef}
                id="crispy-text-mask-desktop"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="1380"
                height="230"
              >
                <text
                  x="690"
                  y="125"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontFamily="var(--font-matter), sans-serif"
                  fontWeight="700"
                  fontSize="150"
                  letterSpacing="-4"
                >
                  Let’s Talk Cravings
                </text>
              </mask>
            </defs>

            <foreignObject
              x="10"
              y="10"
              width="1360"
              height="210"
            >
              <div
                className="w-full h-full overflow-hidden"
                style={{
                  WebkitMaskImage: "url(#crispy-text-mask-desktop)",
                  maskImage: "url(#crispy-text-mask-desktop)",
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
                  Let’s
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
                  Talk Cravings
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
        <div className="mt-2 sm:mt-2 text-center">
          <p className="text-xl sm:text-xl md:text-2xl font-normal leading-[1.2] tracking-tight md:tracking-wide text-[#F2F2F2]">
            Got a question, feedback, partnership <br className="md:hidden" /> idea, or need a little help? Whatever’s<br className="md:hidden" /> on your mind, th{" "}
            <span className="text-[#CC1518] font-medium">CFOCO</span>. <br className="hidden lg:block"/> team is<br className="md:hidden" /> here to listen, help, and keep things <br className="md:hidden" /> moving.
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