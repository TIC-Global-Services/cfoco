"use client";

import React from "react";
import Hero from "@/components/shared/Hero";
import { useTranslation } from "react-i18next";

const LocationHero = () => {
  const { t } = useTranslation("location");

  return (
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
          { text: t("hero.titleLine1", "Five Kitchens."), y: "34%" },
          { text: t("hero.titleLine2", "One Standard. Find Yours."), y: "66%" },
        ],
      }}
      mobileTitle={{
        refWidth: 1380,
        refHeight: 550,
        fontSize: 170,
        letterSpacing: "-0.01em",
        strokeText: true,
        lines: [
          { text: t("hero.mobileTitleLine1", "Five Kitchens."), y: "18%" },
          { text: t("hero.mobileTitleLine2", "One Standard."), y: "54%" },
          { text: t("hero.mobileTitleLine3", "Find Yours."), y: "85%" },
        ],
      }}
      description={
        <>
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-none">
            {t("hero.subtitleAcross", "Across")}{" "}
            <span className="text-[#CC1518] font-medium">{t("hero.bordeaux", "Bordeaux")}</span>{" "}
            {t("hero.subtitleAndBeyond", "And Beyond")}
          </p>
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-none hidden md:block">
            {t("hero.subtitlePromise", "Every CFC Is The Same Promise, Cooked Fresh Where You Are.")}
          </p>
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.3] md:hidden">
            {t("hero.subtitlePromiseLine1", "Every CFC Is The Same Promise,")}
          </p>
          <p className="text-xl md:text-[1.375rem] font-normal tracking-wide text-[#F2F2F2] leading-[1.3] md:hidden">
            {t("hero.subtitlePromiseLine2", "Cooked Fresh Where You Are.")}
          </p>
        </>
      }
    />
  );
};

export default LocationHero;
