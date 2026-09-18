"use client";

import React from "react";
import Hero from "@/components/shared/Hero";

const ContactHero = () => (
  <Hero
    videoSrc="/bg_about_video.mp4"
    sectionClassName="justify-between px-0 sm:px-6 lg:px-8"
    contentClassName="md:justify-start pt-[60%] sm:pt-[50%] lg:pt-38"
    brightness
    descriptionClassName="mt-4 md:-mt-6 text-center px-4"
    desktopTitle={{
      refWidth: 1380,
      refHeight: 230,
      fontSize: 140,
      letterSpacing: "-3%",
      lines: [{ text: "Let’s Talk Cravings", y: "58%" }],
    }}
    description={
      <p className="text-xl sm:text-xl md:text-2xl font-normal leading-[1.2] tracking-tight md:tracking-wide text-[#F2F2F2]">
        Got a question, feedback, partnership <br className="md:hidden" /> idea, or need a little help? Whatever’s<br className="md:hidden" /> on your mind, the{" "}
        <span className="text-[#CC1518] font-medium">CFOCO</span> <br className="hidden lg:block" /> team is<br className="md:hidden" /> here to listen, help, and keep things <br className="md:hidden" /> moving.
      </p>
    }
  />
);

export default ContactHero;
