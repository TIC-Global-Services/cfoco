"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { matter } from "@/font/fonts";

const GetCrispy = () => {
  return (
    <section
      className={`relative w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-transparent select-none overflow-hidden ${matter.className}`}
    >
      {/* Background Ambient Glow */}
      {/* <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" /> */}

      <div className="px-[5%] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        {/* Left Column: Text & CTAs */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-1/2 flex flex-col items-start text-left z-10"
        >
          {/* Headlines */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight text-white leading-[1.1]">
            Enough Reading.
          </h2>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.625rem] font-bold tracking-tight text-[#E5A823] leading-[1.1] mb-6">
            Go Get Crispy.
          </h2>

          {/* Description Paragraph */}
          <p className="text-sm sm:text-base md:text-2xl text-neutral-300 font-normal leading-[1.2]  mb-8 sm:mb-10">
            From The First Crunch To The Last Piece, Every Box Is Made To Create
            Moments Worth Sharing With The People Who Matter Most.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-4">
            {/* Primary Order Now Button */}
            <Link
              href="#order"
              className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-2.5 rounded-full bg-white text-neutral-900 font-semibold text-sm sm:text-base hover:bg-neutral-200 transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              Order Now
            </Link>

            {/* Secondary Find Nearest Button */}
            <Link
              href="#locations"
              className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-2.5 rounded-full bg-white text-black hover:bg-[#252e42] border border-neutral-600/80 hover:border-neutral-400 font-medium text-sm sm:text-base transition-all duration-300 backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
            >
              Find Your Nearest
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Interactive Map Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, x: 40 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-1/2 flex items-center justify-center relative z-10"
        >
          <div className="relative w-full max-w-[580px] h-[300px] sm:h-[380px] md:h-[440px] flex items-center justify-center">
            {/* Soft Map Glow */}
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />

            {/* Map Graphic with Subtle Float Effect */}
            <motion.div
              animate={{
                y: [-4, 4, -4],
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut",
              }}
              className="relative w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
            >
              <Image
                src="/map.png"
                alt="CFOCO Locations Map"
                fill
                priority
                className="object-contain"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GetCrispy;
