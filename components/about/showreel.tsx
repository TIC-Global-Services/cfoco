"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CirclePlay } from "lucide-react";
import { matter } from "@/font/fonts";

const Showreel = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section
      className={`relative w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-transparent select-none ${matter.className}`}
    >
      <div className="">
        {/* Main Showreel Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-[580px] sm:h-[480px] md:h-[580px] lg:h-[680px] rounded-2xl sm:rounded-3xl md:rounded-[30px] overflow-hidden border border-neutral-700/50 shadow-[0_25px_60px_rgba(0,0,0,0.7)] group"
        >
          {/* Background Kitchen Image */}
          <Image
            src="/show_reel_thub.png"
            alt="Where The Magic Gets Loud - CFOCO Kitchen"
            fill
            priority
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Cinematic Dark Overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10 transition-opacity duration-300 group-hover:bg-black/60" /> */}

          {/* Centered Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 z-10">
            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.375rem] font-bold tracking-tight text-[#F6B90B] leading-tight"
            >
              Where The Magic Gets Loud.
            </motion.h2>

            {/* Watch Showreel CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35 }}
              onClick={() => setIsPlaying(true)}
              className="mt-4 sm:mt-6 inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 text-white/90"
            >
              <span className="text-sm sm:text-base md:text-xl font-medium tracking-wide">
                Watch Showreel
              </span>

              {/* Play Circle Icon */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center group-hover/btn:bg-white/10 transition-colors">
                <CirclePlay />
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Video Modal Popup */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setIsPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                aria-label="Close video"
              >
                ✕
              </button>

              {/* Video Player */}
              <video
                src="/bg_about_video.mp4"
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Showreel;
