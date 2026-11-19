"use client";

import React from "react";
import Hero from "@/components/shared/Hero";
import { useTranslation } from "react-i18next";

const CareerHero = () => {
  const { t } = useTranslation("career");

  return (
    <Hero
      videoSrc="/bg_about_video.mp4"
      sectionClassName="justify-between px-[5%] sm:px-6 lg:px-8"
      contentClassName="md:justify-start pt-[45%] sm:pt-[30%] lg:pt-38"
      mobileMaxWidthClassName="sm:max-w-md"
      desktopTitle={{
        refWidth: 2200,
        refHeight: 390,
        fontSize: 150,
        letterSpacing: "-4%",
        lines: [
          { text: t("hero.desktopLine1", "Build Your"), y: "140" },
          { text: t("hero.desktopLine2", "Future With Us"), y: "280" },
        ],
      }}
      mobileTitle={{
        refWidth: 1000,
        refHeight: 380,
        fontSize: 130,
        letterSpacing: "-3%",
        lines: [
          { text: t("hero.mobileLine1", "Build Your"), y: "160" },
          { text: t("hero.mobileLine2", "Future With Us."), y: "300" },
        ],
      }}
      description={
        <p className="text-xl sm:text-xl md:text-[1.375rem] mt-5 font-normal tracking-tight text-[#F2F2F2] leading-[1.2] max-w-3xl">
          {t("hero.description", "Join a team driven by innovation, collaboration, and a shared passion for making a meaningful impact")}{" "}
          <span className="text-[#CC1518] font-medium">{t("hero.highlight", "every day.")}</span>
        </p>
      }
    />
  );
};

export default CareerHero;
