"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Reachoutanyway() {
  const { t } = useTranslation("career");

  return (
    <section className="w-full px-4 sm:px-[3%] mb-24 mt-12">
      <div className="relative w-full aspect-[9/16] sm:aspect-[16/9] rounded-[20px] overflow-hidden  group cursor-pointer">
        <Image
          src={"/cfc_ambience.jpg"}
          alt="Restaurant Ambience"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Center Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-5xl flex flex-col items-center">

            <h2 className="text-4xl sm:text-5xl lg:text-[4.375rem] font-bold text-[#F6B90B] tracking-tight drop-shadow-xl leading-[1.05] mb-4 sm:mb-6">
              <span className="block">{t("reachout.titleLine1", "Don’t See Your Role?")}</span>
              <span className="block">{t("reachout.titleLine2", "Reach Out Anyway.")}</span>
            </h2>

            <p className="text-white text-base sm:text-xl max-w-xl md:max-w-3xl font-medium mb-8 sm:mb-10 leading-snug drop-shadow-md">
              {t("reachout.description", "We're Always Open To Meeting Talented People Who Share Our Passion For Food And Service.")}
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-4 bg-[#FFFFFF99] hover:bg-[#94A3B8] backdrop-blur-md text-[#232E45] text-sm sm:text-lg font-bold py-1 pl-6 pr-1 rounded-full transition-all group/btn shadow-lg"
            >
              <Link
                href="mailto:Recrutement@cfoco.fr?subject=Job%20Application%20-%20Resume"
                className="tracking-tight font-semibold"
              >
                {t("reachout.button", "Send Your Resume")}
              </Link>

              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-white transition-transform group-hover/btn:scale-105">
                <ArrowRight className="size-4 sm:size-5 -rotate-45" />
              </div>
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}
