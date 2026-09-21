"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { matter } from "@/font/fonts";

const TOTAL_FRAMES = 68;

const BuildYourFuture: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const lastRenderedIndexRef = useRef<number>(-1);
  const rafIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Find nearest loaded frame if the target frame is still downloading
  const getBestAvailableImage = useCallback((targetIndex: number): { img: HTMLImageElement; index: number } | null => {
    const images = imagesRef.current;
    if (!images || images.length === 0) return null;

    // Direct match check
    const exact = images[targetIndex];
    if (exact && exact.complete && exact.naturalWidth > 0) {
      return { img: exact, index: targetIndex };
    }

    // Search outward (prefer backwards then forwards)
    let bestMatch: { img: HTMLImageElement; index: number } | null = null;

    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      // Check backwards
      const backIdx = targetIndex - offset;
      if (backIdx >= 0) {
        const backImg = images[backIdx];
        if (backImg && backImg.complete && backImg.naturalWidth > 0) {
          bestMatch = { img: backImg, index: backIdx };
          break;
        }
      }

      // Check forwards
      const fwdIdx = targetIndex + offset;
      if (fwdIdx < TOTAL_FRAMES) {
        const fwdImg = images[fwdIdx];
        if (fwdImg && fwdImg.complete && fwdImg.naturalWidth > 0) {
          bestMatch = { img: fwdImg, index: fwdIdx };
          break;
        }
      }
    }

    // Fallback to frame 0 if available
    if (!bestMatch && images[0] && images[0].complete && images[0].naturalWidth > 0) {
      return { img: images[0], index: 0 };
    }

    return bestMatch;
  }, []);

  // Draw current frame onto canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const match = getBestAvailableImage(index);
    if (!match) return;

    const { img, index: actualDrawnIndex } = match;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hRatio = canvas.width / img.naturalWidth;
    const vRatio = canvas.height / img.naturalHeight;
    const ratio = Math.min(hRatio, vRatio);

    const centerShift_x = (canvas.width - img.naturalWidth * ratio) / 2;
    const centerShift_y = (canvas.height - img.naturalHeight * ratio) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

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

    lastRenderedIndexRef.current = actualDrawnIndex;
  }, [getBestAvailableImage]);

  // Update Canvas resolution with DPR clamp for mobile performance
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.clientWidth || 340;
    const height = rect.height || canvas.clientHeight || 260;
    if (width === 0 || height === 0) return;

    // Clamp DPR to maximum of 2 to preserve 60fps on high-DPI mobile devices
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const newWidth = Math.floor(width * dpr);
    const newHeight = Math.floor(height * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
    }

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // Progressive Preload of Sequence Images
  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let isCancelled = false;

    const handleImageLoad = (frameIdx: number) => {
      if (isCancelled) return;
      if (frameIdx === 0) {
        setIsLoaded(true);
        requestAnimationFrame(() => {
          updateCanvasSize();
          drawFrame(0);
        });
      } else {
        const currentTarget = currentFrameRef.current;
        const lastDrawn = lastRenderedIndexRef.current;
        const currentDistance = Math.abs(lastDrawn - currentTarget);
        const newDistance = Math.abs(frameIdx - currentTarget);

        if (frameIdx === currentTarget || newDistance < currentDistance) {
          drawFrame(currentTarget);
        }
      }
    };

    const loadIndex = (i: number): Promise<void> => {
      return new Promise((resolve) => {
        if (images[i]) {
          resolve();
          return;
        }
        const img = new (window.Image || Image)();
        img.decoding = "async";
        const frameNum = String(i + 1).padStart(3, "0");
        img.src = `/burger-sequence/ezgif-frame-${frameNum}.png`;

        img.onload = () => {
          handleImageLoad(i);
          resolve();
        };
        img.onerror = () => {
          resolve();
        };

        images[i] = img;
      });
    };

    // Staged sequence loader:
    // Step 1: Load frame 0 immediately with highest priority
    loadIndex(0).then(() => {
      if (isCancelled) return;

      // Step 2: Load keyframes evenly (every 4th frame) in small batches
      const keyframes: number[] = [];
      for (let i = 4; i < TOTAL_FRAMES; i += 4) {
        keyframes.push(i);
      }

      const loadKeyframes = async () => {
        for (const idx of keyframes) {
          if (isCancelled) return;
          await loadIndex(idx);
        }

        // Step 3: Fill remaining intermediate frames gradually
        for (let i = 1; i < TOTAL_FRAMES; i++) {
          if (isCancelled) return;
          if (!images[i]) {
            await loadIndex(i);
          }
        }
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
          loadKeyframes();
        });
      } else {
        setTimeout(loadKeyframes, 50);
      }
    });

    imagesRef.current = images;

    return () => {
      isCancelled = true;
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

  // Handle Resize and Orientation changes via ResizeObserver & Window Listeners
  useEffect(() => {
    updateCanvasSize();
    const timer = setTimeout(updateCanvasSize, 100);

    const canvasWrapper = canvasWrapperRef.current;
    let observer: ResizeObserver | null = null;

    if (canvasWrapper && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updateCanvasSize();
      });
      observer.observe(canvasWrapper);
    }

    window.addEventListener("resize", updateCanvasSize, { passive: true });
    window.addEventListener("orientationchange", updateCanvasSize);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("orientationchange", updateCanvasSize);
    };
  }, [updateCanvasSize]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[190vh] sm:h-[220vh] ${matter.className} transform-gpu`}
    >
      {/* Sticky Viewport Container - uses dynamic viewport units (dvh) with standard vh fallback */}
      <div className="sticky top-0 h-screen supports-[height:100dvh]:h-[100dvh] w-full flex flex-col lg:flex-row items-center justify-between lg:justify-center overflow-hidden select-none px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-0 will-change-transform transform-gpu">
        {/* Ambient background glow (optimized blur and size for mobile GPU performance) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[800px] h-[300px] sm:h-[500px] lg:h-[600px] bg-blue-600/10 rounded-full blur-[100px] lg:blur-[180px] pointer-events-none" />

        {/* Content Container: Mobile uses flex column flow to guarantee NO overlap, Desktop transitions to absolute layout */}
        
        {/* Top Heading */}
        <div className="w-full z-10 text-center max-w-[340px] sm:max-w-[460px] pointer-events-auto lg:absolute lg:left-8 xl:left-16 lg:top-[22%] lg:translate-x-0 lg:text-left lg:max-w-[480px] xl:max-w-[580px] lg:px-0 transition-all duration-300">
          <h2 className="text-[2.1225rem] sm:text-4xl lg:text-[50px] xl:text-[60px] font-extrabold tracking-tight text-[#FFBF00] leading-[1.08] sm:leading-[1.02] drop-shadow-xl">
            Why Build Your <br className="hidden sm:inline lg:block" />
            Future With CFOCO?
          </h2>
        </div>

        {/* Center Canvas & Instant Poster (Burger Sequence) */}
        <div
          ref={canvasWrapperRef}
          className="relative w-full flex-1 max-w-[340px] xs:max-w-[380px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[850px] min-h-[200px] xs:min-h-[240px] max-h-[38vh] xs:max-h-[42vh] sm:max-h-[50vh] lg:max-h-[85vh] z-20 pointer-events-none flex items-center justify-center my-auto lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:h-[88vh] lg:my-0"
        >
          {/* Instant Priority Poster so it is never blank on mobile initial load */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
              isLoaded ? "opacity-0" : "opacity-100"
            }`}
          >
            <Image
              src="/burger-sequence/ezgif-frame-001.png"
              alt="CFOCO Burger"
              fill
              priority
              className="object-contain pointer-events-none"
              sizes="(max-width: 768px) 340px, (max-width: 1024px) 580px, 850px"
            />
          </div>

          {/* Animated Burger Canvas */}
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Bottom Paragraph */}
        <div className="w-full z-10 text-center max-w-[340px] sm:max-w-[460px] pointer-events-auto lg:absolute lg:right-8 xl:right-16 lg:bottom-[22%] lg:translate-x-0 lg:text-right lg:max-w-[400px] xl:max-w-[500px] lg:px-0 transition-all duration-300">
          <p className="text-base xs:text-[13px] sm:text-sm md:text-base lg:text-lg xl:text-xl text-neutral-200 font-normal leading-[1.3] sm:leading-[1.25] drop-shadow-md">
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