"use client";

import React, { useEffect, useRef } from "react";
import { matter } from "@/font/fonts";

// Draws `video` into `ctx` covering the full width/height, center-cropping
// like CSS `object-fit: cover` rather than stretching.
function drawVideoCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number
) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;

  const videoRatio = vw / vh;
  const canvasRatio = width / height;

  let sx = 0,
    sy = 0,
    sw = vw,
    sh = vh;

  if (videoRatio > canvasRatio) {
    sw = vh * canvasRatio;
    sx = (vw - sw) / 2;
  } else {
    sh = vw / canvasRatio;
    sy = (vh - sh) / 2;
  }

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);
}

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRefMobile = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRefMobile = useRef<HTMLCanvasElement>(null);
  const fontRef = useRef<HTMLSpanElement>(null);
  const fontFamilyRef = useRef<string>("sans-serif");

  // Autoplay fallback.
  useEffect(() => {
    [videoRef, videoRefMobile].forEach((ref) => {
      ref.current?.play().catch(() => {
        // Autoplay policy fallback handling
      });
    });
  }, []);

  useEffect(() => {
    // Read the actual resolved font-family string once, since ctx.font
    // can't read CSS custom properties or the `matter.className` directly.
    const readFont = () => {
      if (fontRef.current) {
        fontFamilyRef.current = getComputedStyle(fontRef.current).fontFamily;
      }
    };
    readFont();
    // In case the webfont finishes loading slightly after first paint.
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(readFont).catch(() => {});
    }

    const resizeCanvas = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };

    const handleResize = () => {
      resizeCanvas(canvasRef.current);
      resizeCanvas(canvasRefMobile.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let rafId: number;

    const drawTextMaskedVideo = (
      canvas: HTMLCanvasElement | null,
      video: HTMLVideoElement | null,
      lines: string[],
      lineYRatios: number[],
      fontSizeRatio: number
    ) => {
      if (!canvas || !video || video.readyState < 2 || canvas.width === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // 1. Paint the text as a solid white shape.
      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${height * fontSizeRatio}px ${fontFamilyRef.current}`;
      lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, height * lineYRatios[i]);
      });
      ctx.restore();

      // 2. Keep only the video pixels that overlap that text shape.
      ctx.save();
      ctx.globalCompositeOperation = "source-in";
      drawVideoCover(ctx, video, width, height);
      ctx.restore();
    };

    const draw = () => {
      drawTextMaskedVideo(
        canvasRef.current,
        videoRef.current,
        ["Build Your", "Future With Us"],
        [140 / 390, 280 / 390],
        150 / 390
      );
      drawTextMaskedVideo(
        canvasRefMobile.current,
        videoRefMobile.current,
        ["Build Your", "Future With Us."],
        [160 / 380, 300 / 380],
        140 / 380
      );
      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      className={`relative w-full min-h-screen flex flex-col items-center justify-between px-[5%] sm:px-6 lg:px-8 bg-transparent select-none ${matter.className}`}
    >
      {/* Hidden element used only to read the resolved font-family string —
          ctx.font needs a real font name, not a CSS variable or className. */}
      <span ref={fontRef} className={`hidden ${matter.className}`} aria-hidden="true">
        x
      </span>

      {/* Off-screen video elements — frame sources only, never rendered directly. */}
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

      <div className="w-full flex flex-col items-center md:justify-start pt-[45%] sm:pt-[50%] lg:pt-38">
        {/* Desktop */}
        <div className="relative w-full hidden md:block" style={{ aspectRatio: "2200 / 390" }}>
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Mobile */}
        <div className="relative w-full sm:max-w-md md:hidden" style={{ aspectRatio: "1000 / 380" }}>
          <canvas ref={canvasRefMobile} className="w-full h-full block" />
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