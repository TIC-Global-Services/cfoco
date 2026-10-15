"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { matter } from "@/font/fonts";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Prevent mobile address bar show/hide from causing layout jumps & trigger recalculations
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
  });
}

const TOTAL_FRAMES = 68;

const BuildYourFuture: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const pinnedWrapperRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const lastRenderedIndexRef = useRef<number>(-1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Find nearest loaded frame if the target frame is still downloading
  const getBestAvailableImage = useCallback(
    (targetIndex: number): { img: HTMLImageElement; index: number } | null => {
      const images = imagesRef.current;
      if (!images || images.length === 0) return null;

      // Direct match check
      const exact = images[targetIndex];
      if (exact && exact.complete && exact.naturalWidth > 0) {
        return { img: exact, index: targetIndex };
      }

      // Search outward (prefer backwards then forwards)
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        // Check backwards
        const backIdx = targetIndex - offset;
        if (backIdx >= 0) {
          const backImg = images[backIdx];
          if (backImg && backImg.complete && backImg.naturalWidth > 0) {
            return { img: backImg, index: backIdx };
          }
        }

        // Check forwards
        const fwdIdx = targetIndex + offset;
        if (fwdIdx < TOTAL_FRAMES) {
          const fwdImg = images[fwdIdx];
          if (fwdImg && fwdImg.complete && fwdImg.naturalWidth > 0) {
            return { img: fwdImg, index: fwdIdx };
          }
        }
      }

      return null;
    },
    []
  );

  // Draw current frame onto canvas with aspect ratio centering
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (!ctxRef.current) {
        ctxRef.current = canvas.getContext("2d", { alpha: true });
      }
      const ctx = ctxRef.current;
      if (!ctx) return;

      const match = getBestAvailableImage(index);
      if (!match) return;

      const { img, index: actualDrawnIndex } = match;

      if (
        canvas.width === 0 ||
        canvas.height === 0 ||
        img.naturalWidth === 0 ||
        img.naturalHeight === 0
      ) {
        return;
      }

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
    },
    [getBestAvailableImage]
  );

  // Update Canvas resolution with DPR clamp (max 2) for smooth 60fps on mobile Retina/AMOLED screens
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const newWidth = Math.floor(rect.width * dpr);
    const newHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
    }

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // Progressive Preload of Sequence Images
  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    const handleImageLoad = (frameIdx: number) => {
      if (frameIdx === 0) {
        setIsLoaded(true);
        updateCanvasSize();
        drawFrame(0);
        // Refresh triggers once frame 0 establishes dimensions
        ScrollTrigger.refresh();
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

    const loadIndex = (i: number) => {
      if (images[i]) return;
      const img = new Image();
      img.decoding = "async";
      const frameNum = String(i + 1).padStart(3, "0");
      img.src = `/burger-sequence/ezgif-frame-${frameNum}.webp`;

      img.onload = () => handleImageLoad(i);
      img.onerror = () => {
        console.warn(`Failed to load burger sequence frame ${frameNum}`);
      };

      // In case image is already cached by browser
      if (img.complete && img.naturalWidth > 0) {
        handleImageLoad(i);
      }

      images[i] = img;
    };

    // Priority 1: Load first frame immediately
    loadIndex(0);

    // Priority 2: Keyframe sampling (every 4th frame) so fast scrolling has instant previews
    for (let i = 4; i < TOTAL_FRAMES; i += 4) {
      loadIndex(i);
    }

    // Priority 3: Load all remaining frames
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      loadIndex(i);
    }

    imagesRef.current = images;

    return () => {
      imagesRef.current = [];
    };
  }, [drawFrame, updateCanvasSize]);

  // GSAP ScrollTrigger setup with proper cleanup & device-aware scrubbing
  useEffect(() => {
    if (!containerRef.current || !pinnedWrapperRef.current) return;

    const isTouch = ScrollTrigger.isTouch === 1;

    const ctx = gsap.context(() => {
      const frameObj = { frame: 0 };

      // End scroll distance: slightly more compact on mobile touch for natural thumb travel
      const endDistance = () =>
        `+=${Math.round(window.innerHeight * (isTouch ? 1.8 : 2.2))}`;

      // Scrub speed: 0.25 on touch for responsive thumb tracking without lag, 0.6 on desktop for silky mouse wheel inertia
      const scrubSpeed = isTouch ? 0.25 : 0.6;

      gsap.to(frameObj, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: pinnedWrapperRef.current,
          start: "top top",
          end: endDistance,
          scrub: scrubSpeed,
          anticipatePin: 1,
          pinSpacing: true,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
        onUpdate: () => {
          const targetFrame = Math.min(
            TOTAL_FRAMES - 1,
            Math.max(0, Math.round(frameObj.frame))
          );
          if (targetFrame !== currentFrameRef.current) {
            currentFrameRef.current = targetFrame;
            drawFrame(targetFrame);
          }
        },
      });
    }, containerRef);

    // Re-sync ScrollTrigger when late fonts or page assets settle
    const handleLayoutSettled = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLayoutSettled, { once: true });
    if (typeof document !== "undefined" && "fonts" in document) {
      (document as Document).fonts.ready.then(handleLayoutSettled);
    }

    return () => {
      window.removeEventListener("load", handleLayoutSettled);
      ctx.revert();
    };
  }, [drawFrame]);

  // Handle Resize and Orientation changes via ResizeObserver & Window Listeners
  useEffect(() => {
    updateCanvasSize();

    const canvasWrapper = canvasWrapperRef.current;
    let observer: ResizeObserver | null = null;

    if (canvasWrapper && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updateCanvasSize();
      });
      observer.observe(canvasWrapper);
    }

    let lastWidth = window.innerWidth;

    // Filter out mobile address bar show/hide (which changes height but not width)
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (Math.abs(currentWidth - lastWidth) > 8) {
        lastWidth = currentWidth;
        updateCanvasSize();
        ScrollTrigger.refresh();
      }
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        updateCanvasSize();
        ScrollTrigger.refresh();
      }, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleOrientationChange, {
      passive: true,
    });

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [updateCanvasSize]);

  return (
    <section
      ref={containerRef}
      className={`relative w-full ${matter.className}`}
      aria-label="Why Build Your Future With CFOCO"
    >
      {/* Pinned Viewport Container - uses dynamic viewport units (dvh) with fallback */}
      <div
        ref={pinnedWrapperRef}
        className="h-screen supports-[height:100dvh]:h-[100dvh] w-full flex flex-col lg:flex-row items-center justify-between lg:justify-center overflow-hidden select-none px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-0"
      >
        {/* Ambient background glow (optimized blur & size for mobile GPU performance) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[800px] h-[300px] sm:h-[500px] lg:h-[600px] bg-blue-600/10 rounded-full blur-[100px] lg:blur-[180px] pointer-events-none" />

        {/* Content Container: Mobile uses flex column flow, Desktop transitions to absolute layout */}

        {/* Top Heading */}
        <div className="w-full z-10 text-center max-w-[340px] sm:max-w-[460px] pointer-events-auto lg:absolute lg:left-8 xl:left-16 lg:top-[22%] lg:translate-x-0 lg:text-left lg:max-w-[480px] xl:max-w-[580px] lg:px-0 transition-all duration-300">
          <h2 className="text-[2.1225rem] sm:text-4xl lg:text-[50px] xl:text-[60px] font-extrabold tracking-tight text-[#FFBF00] leading-[1.08] sm:leading-[1.02] drop-shadow-xl">
            Why Build Your <br className="hidden sm:inline lg:block" />
            Future With CFOCO?
          </h2>
        </div>

        {/* Center Canvas (Burger Sequence) */}
        <div
          ref={canvasWrapperRef}
          className="relative w-full flex-1 max-w-[340px] xs:max-w-[380px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[850px] max-h-[38vh] xs:max-h-[42vh] sm:max-h-[50vh] lg:max-h-[85vh] z-20 pointer-events-none flex items-center justify-center my-auto lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:h-[88vh] lg:my-0"
        >
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain pointer-events-none transition-opacity duration-500 ${
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
    </section>
  );
};

export default BuildYourFuture;