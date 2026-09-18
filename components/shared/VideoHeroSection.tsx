"use client";

import React from "react";
import { matter } from "@/font/fonts";

export interface VideoHeroSectionProps {
  /**
   * Classes appended after the shared base. Layout knobs that vary per page
   * (justify-between vs justify-start, horizontal padding) live here rather
   * than as component props, so there's never a Tailwind class-order
   * conflict between a baked-in default and a caller override.
   */
  className?: string;
  /** Classes appended after the shared content-column base (top padding, md:justify-*, etc.). */
  contentClassName?: string;
  /** The headline area — one or more MaskedVideoHeadline instances, each in its own responsive wrapper. */
  children: React.ReactNode;
  /** Rendered below the headline as-is; bring your own wrapping element and classes. */
  subtitle?: React.ReactNode;
}

/**
 * Shared shell for the "full-bleed video-masked headline + subtitle" hero
 * used by the career, contact, and location pages. Not used by the about
 * page hero, which is a scroll-pinned parallax layout with its own structure.
 */
const VideoHeroSection = ({
  className = "",
  contentClassName = "",
  children,
  subtitle,
}: VideoHeroSectionProps) => {
  return (
    <section
      className={`relative w-full min-h-screen flex flex-col items-center bg-transparent select-none ${matter.className} ${className}`}
    >
      <div className={`w-full flex flex-col items-center ${contentClassName}`}>
        {children}
        {subtitle}
      </div>
    </section>
  );
};

export default VideoHeroSection;
