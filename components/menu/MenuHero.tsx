"use client";

import React from "react";
import Hero from "@/components/shared/Hero";

const MenuHero = () => (
  <Hero
    videoSrc="/bg_about_video.mp4"
    sectionClassName="justify-start px-0 sm:px-6 lg:px-8 md:py-8 sm:py-12"
    contentClassName="md:justify-center pt-[45%] sm:pt-[50%] lg:pt-[8%]"
    mobileMaxWidthClassName="sm:max-w-md px-2"
    brightness
    descriptionClassName="mt-4 md:-mt-6 text-center px-4 max-w-sm sm:max-w-md md:max-w-3xl"
    desktopTitle={{
      refWidth: 1380,
      refHeight: 280,
      fontSize: 100,
      letterSpacing: "-3%",
      lines: [
        { text: "One Menu.", y: "34%" },
        { text: "Endless Cravings.", y: "68%" },
      ],
    }}
    mobileTitle={{
      refWidth: 1000,
      refHeight: 380,
      fontSize: 145,
      letterSpacing: "-0.03em",
      lines: [
        { text: "One Menu.", y: "150" },
        { text: "Endless Cravings.", y: "295", fontSize: 116 },
      ],
    }}
    description={
      <p className="text-lg sm:text-xl md:text-2xl font-normal tracking-wide text-[#F2F2F2] leading-[1.25]">
        From signature favorites to bold new flavors, explore everything on the{" "}
        <span className="text-[#CC1518] font-medium">CFOCO</span> menu and find your next craving.
      </p>
    }
  />
);

export default MenuHero;
