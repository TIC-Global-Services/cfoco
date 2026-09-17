"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/reusable/Navbar";
import Footer from "@/reusable/Footer";
import { matter } from "@/font/fonts";
import { motion } from "framer-motion";

export default function NotFound() {
  const videoRefDesktop = useRef<HTMLVideoElement>(null);
  const videoRefMobile = useRef<HTMLVideoElement>(null);
  const maskRefDesktop = useRef<SVGMaskElement>(null);
  const maskRefMobile = useRef<SVGMaskElement>(null);

  useEffect(() => {
    [maskRefDesktop, maskRefMobile].forEach((ref) => {
      if (ref.current) {
        ref.current.setAttribute("mask-type", "alpha");
      }
    });

    [videoRefDesktop, videoRefMobile].forEach((ref) => {
      if (ref.current) {
        ref.current.play().catch(() => {
          // Autoplay policy fallback handling
        });
      }
    });
  }, []);

  return (
    <div
      className={`relative overflow-hidden min-h-screen w-full bg-cover bg-bottom bg-no-repeat bg-fixed text-white flex flex-col pt-24 select-none ${matter.className}`}
      style={{ backgroundImage: "url('/bg-image.png')" }}
    >
      {/* Top Navbar */}
      <Navbar />

      {/* Ambient Red & Gold Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-[#CC1518]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-[350px] h-[350px] bg-[#E5A823]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-12 sm:py-16 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full flex flex-col items-center"
        >
          {/* 404 Video Mask Headline - Desktop */}
          <div className="relative w-full max-w-3xl hidden md:flex items-center justify-center">
            <h1 className="text-8xl md:text-9xl font-bold tracking-tighter">
              404
            </h1>
          </div>

          {/* 404 Video Mask Headline - Mobile */}
          <div className="relative w-full max-w-xs sm:max-w-sm md:hidden flex items-center justify-center">
            <h1 className="text-7xl md:text-8xl font-bold tracking-tighter">
              404
            </h1>
          </div>

          {/* Titles & Message */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mt-2 sm:mt-4">
            Looks Like This Recipe <span className="text-[#CC1518]">Got Burnt.</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg md:text-xl text-[#E0E0E0] max-w-xl font-normal leading-relaxed">
            The page you are looking for might have been eaten, moved, or never existed in our kitchen. Let&apos;s get you back to something crispy!
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/about"
              className="group flex items-center gap-3 pl-6 pr-1.5 py-1.5 rounded-full bg-[#FFFFFF99] hover:bg-[#8799a5]/45 border border-white/20 backdrop-blur-md text-white font-medium text-base sm:text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:border-white/40"
            >
              <span className="tracking-tight font-semibold text-[#232E45] group-hover:text-white transition-colors">
                About us
              </span>
              <div className="w-9 h-9 rounded-full bg-[#232E45] border border-white/10 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 group-hover:scale-105">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7V17"
                  />
                </svg>
              </div>
            </Link>

            <Link
              href="/menu"
              className="group flex items-center gap-2 px-7 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md text-white font-semibold text-base sm:text-lg transition-all duration-300 hover:border-white/30"
            >
              <span>Explore Our Menu</span>
            </Link>
          </div>


        </motion.div>
      </main>


    </div>
  );
}