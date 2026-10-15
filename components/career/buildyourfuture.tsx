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

  // Cached canvas draw dimensions to avoid recalculating math on every scroll tick
  const renderParamsRef = useRef<{
    dx: number;
    dy: number;
    dw: number;
    dh: number;
  }>({ dx: 0, dy: 0, dw: 0, dh: 0 });

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

  // Ultra-fast draw: relies on precomputed bounds and pre-decoded bitmaps
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
      const { dx, dy, dw, dh } = renderParamsRef.current;
      if (dw === 0 || dh === 0) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, dx, dy, dw, dh);

      lastRenderedIndexRef.current = actualDrawnIndex;
    },
    [getBestAvailableImage]
  );

  // Update Canvas resolution with mobile-optimized DPR & precomputed aspect bounds
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const isTouch =
      typeof window !== "undefined" &&
      (ScrollTrigger.isTouch === 1 || "ontouchstart" in window);

    // DPR 1.5 on mobile provides sharp Retina rendering while cutting pixel throughput by 44%
    const dpr = isTouch
      ? Math.min(window.devicePixelRatio || 1, 1.5)
      : Math.min(window.devicePixelRatio || 1, 2);

    const newWidth = Math.floor(rect.width * dpr);
    const newHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
    }

    // Sequence frames are 1920x1920. Precompute aspect-fit centering once here:
    const sourceSize = 1920;
    const hRatio = canvas.width / sourceSize;
    const vRatio = canvas.height / sourceSize;
    const ratio = Math.min(hRatio, vRatio);

    const dw = sourceSize * ratio;
    const dh = sourceSize * ratio;
    const dx = (canvas.width - dw) / 2;
    const dy = (canvas.height - dh) / 2;

    renderParamsRef.current = { dx, dy, dw, dh };

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", { alpha: true });
    }
    if (ctxRef.current) {
      ctxRef.current.imageSmoothingEnabled = true;
      // "medium" utilizes zero-cost hardware bilinear filtering on mobile GPUs
      ctxRef.current.imageSmoothingQuality = isTouch ? "medium" : "high";
    }

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // Progressive Preload of Sequence Images with Background Decoding (img.decode)
  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let isCancelled = false;

    const handleImageLoad = (frameIdx: number) => {
      if (isCancelled) return;
      if (frameIdx === 0) {
        setIsLoaded(true);
        updateCanvasSize();
        drawFrame(0);
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

    const loadIndex = (i: number): Promise<void> => {
      if (images[i]) return Promise.resolve();
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        const frameNum = String(i + 1).padStart(3, "0");
        img.src = `/burger-sequence/ezgif-frame-${frameNum}.webp`;

        const markReady = () => {
          if (isCancelled) return;
          images[i] = img;
          handleImageLoad(i);
          resolve();
        };

        // img.decode() decompresses WebP in a background thread, preventing 15-40ms UI stalls
        if (typeof img.decode === "function") {
          img
            .decode()
            .then(markReady)
            .catch(() => {
              if (img.complete && img.naturalWidth > 0) {
                markReady();
              } else {
                img.onload = markReady;
                img.onerror = () => resolve();
              }
            });
        } else {
          if (img.complete && img.naturalWidth > 0) {
            markReady();
          } else {
            img.onload = markReady;
            img.onerror = () => resolve();
          }
        }
      });
    };

    // Priority 1: Load first frame immediately
    loadIndex(0);

    // Priority 2: Keyframe sampling (every 6th frame) for coarse preview during early scroll
    for (let i = 6; i < TOTAL_FRAMES; i += 6) {
      loadIndex(i);
    }

    // Priority 3: Progressively decode remaining frames sequentially to preserve mobile network bandwidth
    const loadRemaining = async () => {
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        if (isCancelled) break;
        if (!images[i]) {
          await loadIndex(i);
        }
      }
    };
    loadRemaining();

    imagesRef.current = images;

    return () => {
      isCancelled = true;
      imagesRef.current = [];
    };
  }, [drawFrame, updateCanvasSize]);

  // GSAP ScrollTrigger setup with mobile jitter normalization & transform pinning
  useEffect(() => {
    if (!containerRef.current || !pinnedWrapperRef.current) return;

    const isTouch =
      typeof window !== "undefined" &&
      (ScrollTrigger.isTouch === 1 || "ontouchstart" in window);

    // Official GSAP fix for iOS Safari/Android address-bar momentum jitter
    if (isTouch) {
      ScrollTrigger.normalizeScroll({ allowNestedScroll: true });
    }

    const ctx = gsap.context(() => {
      const frameObj = { frame: 0 };

      // End scroll distance: 2.5x viewport on mobile gives natural thumb breathing room
      const endDistance = () =>
        `+=${Math.round(window.innerHeight * (isTouch ? 2.5 : 2.2))}`;

      // Scrub: 0.12s on touch provides instantaneous 1:1 tracking without trailing lag
      const scrubSpeed = isTouch ? 0.12 : 0.5;

      gsap.to(frameObj, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: pinnedWrapperRef.current,
          pinType: isTouch ? "transform" : "fixed",
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
      if (isTouch) {
        ScrollTrigger.normalizeScroll(false);
      }
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
        className="h-screen supports-[height:100dvh]:h-[100dvh] w-full flex flex-col lg:flex-row items-center justify-between lg:justify-center overflow-hidden select-none px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-0 will-change-transform"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Ambient background glow (optimized with radial-gradient instead of heavy live blur filter) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[800px] h-[300px] sm:h-[500px] lg:h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.14)_0%,transparent_70%)] pointer-events-none" />

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
          className="relative w-full flex-1 max-w-[340px] xs:max-w-[380px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[850px] max-h-[38vh] xs:max-h-[42vh] sm:max-h-[50vh] lg:max-h-[85vh] z-20 pointer-events-none flex items-center justify-center my-auto lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:h-[88vh] lg:my-0 will-change-transform"
          style={{ transform: "translateZ(0)" }}
        >
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ transform: "translateZ(0)", willChange: "contents" }}
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