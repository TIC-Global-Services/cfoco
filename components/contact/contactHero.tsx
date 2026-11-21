"use client"
import React from 'react'
import Hero from "@/components/shared/Hero";
import { useTranslation } from "react-i18next";

const contactHero = () => {
     const { t } = useTranslation("contact");
    return (
        <>
            <div className='hidden md:block'>
                <Hero
                    videoSrc="/bg_about_video.mp4"
                    sectionClassName="justify-between px-0 sm:px-6 lg:px-8"
                    contentClassName="md:justify-start pt-[60%] sm:pt-[50%] lg:pt-38"
                    brightness
                    descriptionClassName="mt-4 md:-mt-6 text-center px-4"
                    desktopTitle={{
                        refWidth: 1380,
                        refHeight: 230,
                        fontSize: 100,
                        letterSpacing: "-3%",
                        lines: [{ text: t("hero.title", "Let’s Talk Cravings"), y: "58%" }],
                    }}
                    description={
                        <p className="text-xl sm:text-xl max-w-6xl md:text-2xl font-normal leading-[1.2] tracking-tight md:tracking-wide text-[#F2F2F2]">
                            {t("hero.description", "Got a question, feedback, partnership idea, or need a little help? Whatever’s on your mind, the")}{" "}
                            <span className="text-[#CC1518] font-medium">{t("hero.brandName", "CFOCO")}</span>{" "}
                            {t("hero.descriptionEnd", "team is here to listen, help, and keep things moving.")}
                        </p>
                    }
                />
            </div>
            <div className='md:hidden'>
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
                        lines: [{ text: t("hero.title", "Let’s Talk Cravings"), y: "58%" }],
                    }}
                    description={
                        <p className="text-xl sm:text-xl max-w-6xl md:text-2xl font-normal leading-[1.2] tracking-tight md:tracking-wide text-[#F2F2F2]">
                            {t("hero.description", "Got a question, feedback, partnership idea, or need a little help? Whatever’s on your mind, the")}{" "}
                            <span className="text-[#CC1518] font-medium">{t("hero.brandName", "CFOCO")}</span>{" "}
                            {t("hero.descriptionEnd", "team is here to listen, help, and keep things moving.")}
                        </p>
                    }
                />
            </div>
        </>
    )
}

export default contactHero