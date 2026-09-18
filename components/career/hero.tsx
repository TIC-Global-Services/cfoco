"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { matter } from "@/font/fonts";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRefMobile = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRefMobile = useRef<HTMLCanvasElement>(null);
  const maskRefDesktop = useRef<SVGMaskElement>(null);
  const maskRefMobile = useRef<SVGMaskElement>(null);

  // mask-type isn't in React's SVGProps typings, so it can't be set as a
  // plain JSX prop without a TS error. useLayoutEffect sets it imperatively
  // and still runs synchronously before the browser paints, so there's no
  // flash of the wrong mask mode.
  useLayoutEffect(() => {
    [maskRefDesktop, maskRefMobile].forEach((ref) => {
      ref.current?.setAttribute("mask-type", "alpha");
    });
  }, []);

  // Draw video frames onto the canvases every frame. The canvas — not the
  // <video> — is what gets CSS-masked below, because iOS/WebKit's video
  // compositing layer does not reliably respect CSS mask-image / foreignObject
  // masking, while canvas (a normal 2D-painted element) does.
  useEffect(() => {
    let rafId: number;

    const draw = () => {
      const pairs = [
        { video: videoRef.current, canvas: canvasRef.current },
        { video: videoRefMobile.current, canvas: canvasRefMobile.current },
      ];

      pairs.forEach(({ video, canvas }) => {
        if (video && canvas && video.readyState >= 2) {
          if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
          if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      });

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Explicit play() call as an autoplay-policy fallback.
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
    <section
      className={`relative w-full min-h-screen flex flex-col items-center justify-between px-[5%] sm:px-6 lg:px-8 bg-transparent select-none ${matter.className}`}
    >
      {/* Off-screen video elements — never rendered directly on iOS.
          They exist only as frame sources for the canvases below. */}
      <video
        ref={videoRef}
        src="/bg_about_video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="hidden"
      />
      <video
        ref={videoRefMobile}
        src="/bg_about_video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="hidden"
      />

      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center md:justify-start pt-[45%] sm:pt-[50%] lg:pt-38">
        {/* Large Headline with Video Inside Text - Desktop */}
        <div className="relative w-full hidden md:flex items-center justify-center">
          <svg
            viewBox="0 0 2200 390"
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
              className="overflow-hidden"
              style={{
                overflow: "hidden",
                border: 0,
                outline: 0,
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden"
                style={{
                  background: "transparent",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitMaskImage: "url(#crispy-text-mask-career-desktop)",
                  maskImage: "url(#crispy-text-mask-career-desktop)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  contain: "paint",
                  isolation: "isolate",
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover scale-110"
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
                  fontSize="140"
                  letterSpacing="-3%"
                >
                  Build Your
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
                  fontSize="140"
                  letterSpacing="-3%"
                >
                  Future With Us.
                </text>
              </mask>
            </defs>

            <foreignObject
              x="0"
              y="0"
              width="1000"
              height="380"
              className="overflow-hidden"
              style={{
                overflow: "hidden",
                border: 0,
                outline: 0,
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden"
                style={{
                  background: "transparent",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitMaskImage: "url(#crispy-text-mask-career-mobile)",
                  maskImage: "url(#crispy-text-mask-career-mobile)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  contain: "paint",
                  isolation: "isolate",
                }}
              >
                <canvas
                  ref={canvasRefMobile}
                  className="w-full h-full object-cover scale-110"
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
        <div className="mt-4 md:-mt-6 text-center md:px-4">
          <p className="text-xl sm:text-xl md:text-[1.375rem] font-normal tracking-tight text-[#F2F2F2] leading-[1.2] max-w-3xl">
            Join a team driven by innovation, collaboration, and a shared passion
            for making a meaningful impact <span className="text-[#CC1518] font-medium">every day.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;