"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { matter } from "@/font/fonts";

export interface MaskedVideoTextLine {
  text: string;
  /** Baseline position: a percentage string ("34%") or a raw number in the same units as `refHeight`. */
  y: string | number;
  /** Overrides the shared fontSize for just this line (same units as refWidth/refHeight). */
  fontSize?: number;
}

export interface MaskedVideoHeadlineProps {
  videoSrc: string;
  /** Reference coordinate space the lines are authored in — used only to compute a uniform scale factor at draw time. */
  refWidth: number;
  refHeight: number;
  fontSize: number;
  /** e.g. "-0.01em". Percentage values are a no-op — letter-spacing has never accepted percentages, matching the original SVG markup's (also no-op) "-3%" values. */
  letterSpacing?: string;
  lines: MaskedVideoTextLine[];
  /** Adds a matching stroke behind the fill for crisper glyph edges (location's headline). */
  strokeText?: boolean;
  /** Zoom applied to the video so no un-masked edge is ever visible. Default 1.05. */
  scale?: number;
  brightness?: boolean;
  className?: string;
  /** Fires once the mask has been drawn and the video is visible. */
  onReady?: () => void;
}

type CanvasContextWithLetterSpacing = CanvasRenderingContext2D & { letterSpacing?: string };

const resolveY = (y: string | number, refHeight: number) => {
  if (typeof y === "number") return y;
  if (y.endsWith("%")) return (parseFloat(y) / 100) * refHeight;
  return parseFloat(y);
};

const resolveLetterSpacingPx = (letterSpacing: string | undefined, fontSizePx: number) => {
  if (!letterSpacing) return 0;
  if (letterSpacing.endsWith("em")) return parseFloat(letterSpacing) * fontSizePx;
  if (letterSpacing.endsWith("px")) return parseFloat(letterSpacing);
  return 0;
};

/**
 * A video clipped to the shape of text ("video inside headline") — no SVG
 * involved. The text shape is drawn once onto an offscreen <canvas>, sized
 * to the container's *actual measured* pixel dimensions (via
 * ResizeObserver), using the page's already-loaded custom font. That PNG
 * becomes the <video>'s `mask-image`.
 *
 * This is deliberately an *image* mask (a data URL), not a reference to an
 * SVG <mask> element — the CSS Masking spec has `mask-size`/`mask-position`/
 * `mask-repeat` apply ONLY to image mask layers, and explicitly NOT to SVG
 * mask-element references. Drawing at the real measured size sidesteps that
 * distinction entirely: there's no coordinate system to scale, so there's
 * nothing for a browser to get wrong.
 */
const MaskedVideoHeadline = ({
  videoSrc,
  refWidth,
  refHeight,
  fontSize,
  letterSpacing,
  lines,
  strokeText = false,
  scale = 1.05,
  brightness = false,
  className = "",
  onReady,
}: MaskedVideoHeadlineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [maskUrl, setMaskUrl] = useState<string | null>(null);

  const draw = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d") as CanvasContextWithLetterSpacing | null;
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const scaleFactor = width / refWidth;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";

    lines.forEach((line) => {
      const lineFontSizePx = (line.fontSize ?? fontSize) * scaleFactor;
      ctx.font = `700 ${lineFontSizePx}px ${matter.style.fontFamily}`;
      if ("letterSpacing" in ctx) {
        ctx.letterSpacing = `${resolveLetterSpacingPx(letterSpacing, lineFontSizePx)}px`;
      }
      const x = width / 2;
      const y = resolveY(line.y, refHeight) * scaleFactor;
      if (strokeText) {
        ctx.lineWidth = 1.5;
        ctx.strokeText(line.text, x, y);
      }
      ctx.fillText(line.text, x, y);
    });

    setMaskUrl(canvas.toDataURL("image/png"));
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refWidth, refHeight, fontSize, letterSpacing, lines, strokeText]);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) draw();
    };

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(run).catch(run);
    } else {
      run();
    }

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(run);
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [draw]);

  useEffect(() => {
    videoRef.current?.play().catch(() => {
      // Autoplay policy fallback handling
    });
  }, []);

  const ratio = (refHeight / refWidth) * 100;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ paddingTop: `${ratio}%` }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover ${brightness ? "brightness-110" : ""}`}
        style={{
          opacity: maskUrl ? 1 : 0,
          transition: "opacity 0.3s ease-out",
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : undefined,
          maskImage: maskUrl ? `url(${maskUrl})` : undefined,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          transform: `scale(${scale})`,
          border: "none",
          outline: "none",
        }}
      />
    </div>
  );
};

export default MaskedVideoHeadline;
