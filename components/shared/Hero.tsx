"use client";

import React from "react";
import MaskedVideoHeadline, {
  MaskedVideoTextLine,
} from "@/components/shared/MaskedVideoHeadline";
import VideoHeroSection from "@/components/shared/VideoHeroSection";

export interface HeroTitleConfig {
  refWidth: number;
  refHeight: number;
  fontSize: number;
  letterSpacing?: string;
  lines: MaskedVideoTextLine[];
  strokeText?: boolean;
}

export interface HeroCta {
  label: string;
  href: string;
  className?: string;
}

export interface HeroProps {
  videoSrc: string;
  desktopTitle: HeroTitleConfig;
  mobileTitle?: HeroTitleConfig;
  mobileMaxWidthClassName?: string;
  description: React.ReactNode;
  cta?: HeroCta;
  brightness?: boolean;
  sectionClassName?: string;
  contentClassName?: string;
  descriptionClassName?: string;
}

const Hero = ({
  videoSrc,
  desktopTitle,
  mobileTitle,
  mobileMaxWidthClassName = "",
  description,
  cta,
  brightness,
  sectionClassName = "justify-between px-[5%] sm:px-6 lg:px-8",
  contentClassName = "md:justify-start pt-[45%] sm:pt-[50%] lg:pt-38",
  descriptionClassName = "mt-4 md:-mt-6 text-center md:px-4",
}: HeroProps) => {
  return (
    <VideoHeroSection
      className={sectionClassName}
      contentClassName={contentClassName}
      subtitle={
        <div className={descriptionClassName}>
          {description}
          {cta && (
            <a
              href={cta.href}
              className={
                cta.className ??
                "inline-block mt-6 px-6 py-3 rounded-full bg-[#CC1518] text-white font-medium"
              }
            >
              {cta.label}
            </a>
          )}
        </div>
      }
    >
      {mobileTitle ? (
        <>
          <div className="relative w-full hidden md:flex items-center justify-center">
            <MaskedVideoHeadline
              videoSrc={videoSrc}
              refWidth={desktopTitle.refWidth}
              refHeight={desktopTitle.refHeight}
              fontSize={desktopTitle.fontSize}
              letterSpacing={desktopTitle.letterSpacing}
              lines={desktopTitle.lines}
              strokeText={desktopTitle.strokeText}
              brightness={brightness}
            />
          </div>

          <div
            className={`relative w-full flex md:hidden items-center justify-center ${mobileMaxWidthClassName}`}
          >
            <MaskedVideoHeadline
              videoSrc={videoSrc}
              refWidth={mobileTitle.refWidth}
              refHeight={mobileTitle.refHeight}
              fontSize={mobileTitle.fontSize}
              letterSpacing={mobileTitle.letterSpacing}
              lines={mobileTitle.lines}
              strokeText={mobileTitle.strokeText}
              brightness={brightness}
            />
          </div>
        </>
      ) : (
        <div className="relative w-full flex items-center justify-center">
          <MaskedVideoHeadline
            videoSrc={videoSrc}
            refWidth={desktopTitle.refWidth}
            refHeight={desktopTitle.refHeight}
            fontSize={desktopTitle.fontSize}
            letterSpacing={desktopTitle.letterSpacing}
            lines={desktopTitle.lines}
            strokeText={desktopTitle.strokeText}
            brightness={brightness}
          />
        </div>
      )}
    </VideoHeroSection>
  );
};

export default Hero;
