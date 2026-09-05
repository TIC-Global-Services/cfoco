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
    <section className={`relative w-full min-h-screen flex flex-col items-center justify-between px-0 sm:px-6 lg:px-8 bg-transparent select-none ${matter.className}`}>
      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center md:justify-start pt-[60%] sm:pt-[50%] lg:pt-44">
        {/* Large Headline with Video Inside Text */}
        <div className="relative w-full flex items-center justify-center">
          <svg
            viewBox="0 0 1380 230"
            className="w-full h-auto overflow-visible border-none outline-none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <mask
                ref={maskRef}
                id="crispy-text-mask-contact"
                maskUnits="userSpaceOnUse"
                x="-100"
                y="-100"
                width="1580"
                height="430"
              >
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
                  fontSize="140"
                  letterSpacing="-3%"
                >
                  Let’s Talk Cravings
                </text>
              </mask>
            </defs>

            <foreignObject
              x="2"
              y="2"
              width="1376"
              height="226"
            >
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: "transparent",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitMaskImage: "url(#crispy-text-mask-contact)",
                  maskImage: "url(#crispy-text-mask-contact)",
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
        <div className="mt-4 sm:mt-2 text-center">
          <p className="text-xl sm:text-xl md:text-2xl font-normal leading-[1.2] tracking-tight md:tracking-wide text-[#F2F2F2]">
            Got a question, feedback, partnership <br className="md:hidden" /> idea, or need a little help? Whatever’s<br className="md:hidden" /> on your mind, the{" "}
            <span className="text-[#CC1518] font-medium">CFOCO</span> <br className="hidden lg:block"/> team is<br className="md:hidden" /> here to listen, help, and keep things <br className="md:hidden" /> moving.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;