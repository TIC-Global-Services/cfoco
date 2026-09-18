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
        ref.current.play().catch(() => {});
      }
    });

    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setIsReady(true);
    };

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts
        .load('700 100px "matter"')
        .then(() => document.fonts.ready.then(markReady))
        .catch(markReady);
    }

    const timer = setTimeout(markReady, 800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const maskTextStyle: React.CSSProperties = {
    fontFamily: "var(--font-matter), sans-serif",
    fontWeight: 700,
  };
  const maskTextProps = {
    fill: "white",
    stroke: "white",
    strokeWidth: 1.5,
    paintOrder: "stroke fill" as const,
  };

  // Ratio = viewBox height / viewBox width, expressed as a padding-top %.
  // This is what actually reserves the box height — not the svg's own
  // width/height/aspect-ratio, which is where Safari disagrees with Chrome.
  const DESKTOP_RATIO = (280 / 1380) * 100; // 20.29%
  const MOBILE_RATIO = (550 / 1380) * 100; // 39.86%

  return (
    <section
      className={`relative w-full min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 bg-transparent select-none ${matter.className}`}
    >
      <div className="w-full flex flex-col items-center md:justify-center">
        {/* Desktop */}
        <div className="relative w-full hidden md:block pt-[10%]">
          <div
            className="relative w-full"
            style={{ paddingTop: `${DESKTOP_RATIO}%` }}
          >
            <svg
              viewBox="0 0 1380 280"
              className="absolute inset-0 block w-full h-full border-none outline-none"
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
                    {...maskTextProps}
                    style={maskTextStyle}
                    fontSize="100"
                    letterSpacing="-0.01em"
                  >
                    Five Kitchens.
                  </text>
                  <text
                    x="50%"
                    y="66%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    {...maskTextProps}
                    style={maskTextStyle}
                    fontSize="100"
                    letterSpacing="-0.01em"
                  >
                    One Standard. Find Yours.
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
                  style={{
                    width: "100%",
                    height: "100%",
                    opacity: isReady ? 1 : 0,
                    transition: "opacity 0.3s ease-out",
                    willChange: "opacity",
                  }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center overflow-hidden border-none outline-none"
                    style={{
                      background: "transparent",
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      WebkitMaskImage:
                        "url(#crispy-text-mask-location-desktop)",
                      maskImage: "url(#crispy-text-mask-location-desktop)",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskSize: "100% 100%",
                      maskSize: "100% 100%",
                      contain: "paint",
                      isolation: "isolate",
                      border: "none",
                      outline: "none",
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
                </div>
              </foreignObject>
            </svg>
          </div>
        </div>

        {/* Mobile */}
        <div className="relative w-full flex md:hidden pt-[45%] sm:pt-[40%]">
          <div
            className="relative w-full"
            style={{ paddingTop: `${MOBILE_RATIO}%` }}
          >
            <svg
              viewBox="0 0 1380 550"
              className="absolute inset-0 block w-full h-full"
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
                  height="650"
                >
                  <text
                    x="50%"
                    y="18%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    {...maskTextProps}
                    style={maskTextStyle}
                    fontSize="190"
                    letterSpacing="-0.01em"
                  >
                    Five Kitchens.
                  </text>
                  <text
                    x="50%"
                    y="54%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    {...maskTextProps}
                    style={maskTextStyle}
                    fontSize="190"
                    letterSpacing="-0.01em"
                  >
                    One Standard.
                  </text>
                  <text
                    x="50%"
                    y="90%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    {...maskTextProps}
                    style={maskTextStyle}
                    fontSize="190"
                    letterSpacing="-0.01em"
                  >
                    Find Yours.
                  </text>
                </mask>
              </defs>

              <foreignObject
                x="0"
                y="0"
                width="1380"
                height="550"
                className="overflow-hidden"
                style={{ overflow: "hidden", border: 0, outline: 0 }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    opacity: isReady ? 1 : 0,
                    transition: "opacity 0.3s ease-out",
                    willChange: "opacity",
                  }}
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
                </div>
              </foreignObject>
            </svg>
          </div>
        </div>

        {/* Subtitles */}
        <div className="mt-6 md:-mt-8 text-center px-4">
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-none">
            Across <span className="text-[#CC1518] font-medium">Bordeaux</span> And Beyond
          </p>
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-none hidden md:block">
            Every CFC Is The Same Promise, Cooked Fresh Where You Are.
          </p>
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.3] md:hidden">
            Every CFC Is The Same Promise,
          </p>
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.3] md:hidden">
            Cooked Fresh Where You Are.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;