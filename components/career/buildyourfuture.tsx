"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { matter } from "@/font/fonts";

const TOTAL_FRAMES = 91;

const BuildYourFuture: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Draw current frame onto canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hRatio = canvas.width / img.naturalWidth;
    const vRatio = canvas.height / img.naturalHeight;
    const ratio = Math.min(hRatio, vRatio);

    const centerShift_x = (canvas.width - img.naturalWidth * ratio) / 2;
    const centerShift_y = (canvas.height - img.naturalHeight * ratio) / 2;

    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      centerShift_x,
      centerShift_y,
      img.naturalWidth * ratio,
      img.naturalHeight * ratio
    );
  }, []);

  // Update Canvas resolution on resize/mount with DPR clamp for mobile performance
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Clamp DPR to maximum of 2 to preserve 60fps on high-DPI mobile devices
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // Preload Images
  useEffect(() => {
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `/burger-sequence/ezgif-frame-${frameNum}.png`;

      img.onload = () => {
        if (i === 1) {
          setIsLoaded(true);
          updateCanvasSize();
          drawFrame(0);
        } else if (i - 1 === currentFrameRef.current) {
          drawFrame(currentFrameRef.current);
        }
      };

      images.push(img);
    }

    imagesRef.current = images;

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [drawFrame, updateCanvasSize]);

  // Update frame index on scroll with RAF deduplication
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(latest * TOTAL_FRAMES))
    );

    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        drawFrame(frameIndex);
      });
    }
  });

  // Handle Resize
  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[190vh] sm:h-[220vh] ${matter.className}`}
    >
      {/* Sticky Viewport Container - uses dynamic viewport units (dvh) for mobile browser address bar handling */}
      <div className="sticky top-0 h-screen supports-[height:100dvh]:h-[100dvh] w-full flex flex-col lg:flex-row items-center justify-between lg:justify-center overflow-hidden select-none px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-0">
        {/* Ambient background glow (optimized blur and size for mobile GPU performance) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[800px] h-[300px] sm:h-[500px] lg:h-[600px] bg-blue-600/10 rounded-full blur-[100px] lg:blur-[180px] pointer-events-none" />

        {/* Content Container: Mobile uses flex column flow to guarantee NO overlap, Desktop transitions to absolute layout */}
        
        {/* Top Heading */}
        <div className="w-full z-10 text-center max-w-[340px] sm:max-w-[460px] pointer-events-auto lg:absolute lg:left-8 xl:left-16 lg:top-[22%] lg:translate-x-0 lg:text-left lg:max-w-[480px] xl:max-w-[580px] lg:px-0 transition-all duration-300">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-[50px] xl:text-[60px] font-extrabold tracking-tight text-[#FFBF00] leading-[1.08] sm:leading-[1.02] drop-shadow-xl">
            Why Build Your <br className="hidden sm:inline lg:block" />
            Future With CFOCO?
          </h2>
        </div>

        {/* Center Canvas (Burger Sequence) */}
        <div className="relative w-full flex-1 max-w-[340px] xs:max-w-[380px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[850px] max-h-[38vh] xs:max-h-[42vh] sm:max-h-[50vh] lg:max-h-[85vh] z-20 pointer-events-none flex items-center justify-center my-auto lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:h-[88vh] lg:my-0">
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain pointer-events-none transition-opacity duration-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Bottom Paragraph */}
        <div className="w-full z-10 text-center max-w-[340px] sm:max-w-[460px] pointer-events-auto lg:absolute lg:right-8 xl:right-16 lg:bottom-[22%] lg:translate-x-0 lg:text-right lg:max-w-[400px] xl:max-w-[500px] lg:px-0 transition-all duration-300">
          <p className="text-xs xs:text-[13px] sm:text-sm md:text-base lg:text-lg xl:text-xl text-neutral-200 font-normal leading-[1.3] sm:leading-[1.25] drop-shadow-md">
            At CFOCO, We&apos;re More Than Just Burgers And Fried Chicken. We&apos;re
            A Team Built On Energy, Creativity, Teamwork, And A Shared Obsession
            With Quality. Whether You&apos;re Taking Orders, Managing Operations,
            Or Leading The Kitchen, Every Role Helps Shape{" "}
            <span className="text-[#E52320] font-bold">
              The Experience We Serve
            </span>
            .
          </p>
        </div>

        {/* Bottom Ambient Floor Glow */}
        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-blue-900/10 to-transparent blur-md pointer-events-none" />
      </div>
    </div>
  );
};

export default BuildYourFuture;