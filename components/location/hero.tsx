"use client";

import React from "react";
import Hero from "@/components/shared/Hero";

const LocationHero = () => (
  <Hero
    videoSrc="/bg_about_video.mp4"
    sectionClassName="justify-start px-4 sm:px-6 lg:px-8"
    contentClassName="pt-[45%] sm:pt-[40%] md:pt-[10%] md:justify-center"
    brightness
    descriptionClassName="mt-6 md:-mt-8 text-center px-4"
    desktopTitle={{
      refWidth: 1380,
      refHeight: 280,
      fontSize: 100,
      letterSpacing: "-0.01em",
      strokeText: true,
      lines: [
        { text: "Five Kitchens.", y: "34%" },
        { text: "One Standard. Find Yours.", y: "66%" },
      ],
    }}
    mobileTitle={{
      refWidth: 1380,
      refHeight: 550,
      fontSize: 170,
      letterSpacing: "-0.01em",
      strokeText: true,
      lines: [
        { text: "Five Kitchens.", y: "18%" },
        { text: "One Standard.", y: "54%" },
        { text: "Find Yours.", y: "85%" },
      ],
    }}
    description={
      <>
        <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-none">
          Across <span className="text-[#CC1518] font-medium">Bordeaux</span> And Beyond
        </p>
        <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-none hidden md:block">
          Every CFC Is The Same Promise, Cooked Fresh Where You Are.
        </p>
        <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.3] md:hidden">
          Every CFC Is The Same Promise,
        </p>
        <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.3] md:hidden">
          Cooked Fresh Where You Are.
        </p>
      </>
    }
  />
);

export default LocationHero;
