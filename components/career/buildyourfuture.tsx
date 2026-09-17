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

  // Update Canvas resolution on resize/mount
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

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
  }, [drawFrame, updateCanvasSize]);

  // Update frame index on scroll
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(latest * TOTAL_FRAMES))
    );

    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      requestAnimationFrame(() => {
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
      className={`relative w-full h-[220vh] ${matter.className}`}
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden select-none px-4 sm:px-8 lg:px-16">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />

        {/* LAYER 1 (Behind Canvas): Absolute Content Overlay */}
        <div className="relative z-10 w-full max-w-[1600px] h-full pointer-events-none">
          {/* Top Heading (Mobile) / Left Column (Desktop) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-20 sm:top-10 text-center w-full max-w-[320px] sm:max-w-[420px] px-4 pointer-events-auto lg:left-12 lg:right-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:text-left lg:max-w-[500px] xl:max-w-[580px] lg:px-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[54px] xl:text-[62px] font-extrabold tracking-tight text-[#FFBF00] leading-[1.08] drop-shadow-xl">
              Why Build Your <br className="hidden lg:block" />
              Future With CFOCO?
            </h2>
          </div>

          {/* Bottom Paragraph (Mobile) / Right Column (Desktop) */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 sm:bottom-10 text-center w-full max-w-[320px] sm:max-w-[420px] px-4 pointer-events-auto lg:left-auto lg:right-12 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:bottom-auto lg:text-right lg:max-w-[420px] xl:max-w-[480px] lg:px-0">
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-neutral-200 font-normal leading-[1.3] drop-shadow-md">
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
        </div>

        {/* LAYER 2 (In Front of Content): Center Canvas (Burger Sequence) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] sm:max-w-[460px] md:max-w-[580px] lg:max-w-[850px] h-[48vh] sm:h-[56vh] lg:h-[88vh] z-20 pointer-events-none flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Bottom Ambient Floor Glow */}
        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-blue-900/10 to-transparent blur-md pointer-events-none" />
      </div>
    </div>
  );
};

export default BuildYourFuture;