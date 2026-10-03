"use client";

import React, { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface Milestone {
  year: string;
  title: string;
  descLine1: string;
  descLine2: string;
}

export const defaultMilestones: Milestone[] = [
  {
    year: "2011",
    title: "The First Fry",
    descLine1: "One Kitchen In Bordeaux.",
    descLine2: "One Recipe Worth Arguing Over.",
  },
  {
    year: "2014",
    title: "Word Gets Out",
    descLine1: "Lines Out The Door. Turns Out We",
    descLine2: "Weren't The Ones Tired Of Average.",
  },
  {
    year: "2018",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
  {
    year: "2019",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
  {
    year: "2020",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
  {
    year: "2022",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
];

interface ObsessionProps {
  items?: Milestone[];
}

const Obsession: React.FC<ObsessionProps> = ({ items }) => {
  const milestones = items && items.length > 0 ? items : defaultMilestones;
  const N = milestones.length;

  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Create a smooth scrubbed timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1, // 1 second smoothing for buttery effect
          start: "top top",
          end: `+=${N * 50}%`, // Scrolling distance proportional to number of items
          onUpdate: (self) => {
            const progress = self.progress;

            // Apply glow and scale to items based on how close they are to the center of the timeline
            itemsRef.current.forEach((el, index) => {
              if (!el) return;
              const centerPos = index / Math.max(1, N - 1);

              const dist = Math.abs(progress - centerPos);
              const intensity = Math.max(0, 1 - dist / 0.2); // peak at 0 dist, falls off completely by 0.2 dist

              const opacity = 0.25 + 0.75 * intensity;
              const scale = 0.85 + 0.15 * intensity;
              const ringOpacity = intensity;
              const ringScale = 0.9 + 0.15 * intensity;

              gsap.set(el, { opacity, scale });

              const ring = el.querySelector(".glow-ring");
              if (ring) gsap.set(ring, { opacity: ringOpacity, scale: ringScale });

              const badge = el.querySelector(".badge-container");
              if (badge) {
                // Interpolate colors explicitly because GSAP .set interpolates strings natively
                gsap.set(badge, {
                  borderColor: gsap.utils.interpolate("rgba(255,255,255,0.4)", "rgba(34,211,238,1)", intensity),
                });
              }

              const title = el.querySelector(".title-text");
              if (title) {
                gsap.set(title, { color: gsap.utils.interpolate("#ffffff", "#67e8f9", intensity) });
              }
            });
          },
        },
      });

      // Animate the track sliding left
      tl.to(trackRef.current, {
        xPercent: -100 * ((N - 1) / N),
        ease: "none",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [N, milestones]);

  return (
    <div ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-transparent select-none">
      <section className={`w-full h-full flex flex-col justify-center ${matter.className}`}>
        {/* Background Ambient Radial Gradient Glow */}
        <div className="absolute inset-0 pointer-events-none" />

        {/* Section Header */}
        <div className="w-full text-center space-y-1 mb-16 sm:mb-20 md:mb-24 px-[5%] absolute top-20 sm:top-24 left-0 right-0 z-20">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            13 Years
          </h2>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            One Obsession
          </h2>
        </div>

        {/* Continuous Scrolling Track */}
        <div className="relative w-full h-full flex flex-col justify-center overflow-visible pointer-events-none">
          {/* Centering Wrapper: Its left edge is precisely the horizontal center of the screen for the first item */}
          <div className="absolute left-1/2 top-[50%] md:top-[70%] -translate-x-1/2 -translate-y-1/2 w-[100vw] md:w-[50vw]">
            
            {/* Horizontal Laser Line Background perfectly aligned with the badges */}
            <div className="absolute left-[-100vw] right-[-100vw] h-[2px] top-[44px] sm:top-[48px] -translate-y-1/2 z-0 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(2,136,255,0.4) 15%, rgba(2,136,255,0.4) 85%, transparent 100%)",
                }}
              />
            </div>

            <div ref={trackRef} className="flex w-max items-start">
              {milestones.map((data, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    itemsRef.current[index] = el;
                  }}
                  className="w-[100vw] md:w-[50vw] shrink-0 flex flex-col items-center text-center pointer-events-auto"
                  style={{ opacity: 0.25, transform: "scale(0.85)" }}
                >
                  {/* Badge Icon Area */}
                  <div className="relative mb-6 h-[88px] sm:h-[96px] flex items-center justify-center w-full">
                    {/* Outer Charging Ring Glow */}
                    <div
                      className="glow-ring absolute w-[104px] h-[104px] sm:w-[114px] sm:h-[114px] pointer-events-none z-0"
                      style={{ opacity: 0, transform: "scale(0.9)" }}
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                        <defs>
                          <filter id={`trainRingGlow-${index}`} x="-60%" y="-60%" width="220%" height="220%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="41"
                          fill="none"
                          stroke="#00d4ff"
                          strokeWidth="4"
                          filter={`url(#trainRingGlow-${index})`}
                        />
                        <circle cx="50" cy="50" r="41" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.95" />
                      </svg>
                    </div>

                    {/* Circular Badge Container */}
                    <div
                      className="badge-container w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full backdrop-blur-md border-t border-b overflow-hidden flex items-center justify-center relative z-10 bg-neutral-950"
                      style={{ borderColor: "rgba(255,255,255,0.4)" }}
                    >
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                        <Image src="/chicken_logo.svg" alt="CFOCO Chicken Icon" fill className="object-contain" />
                      </div>
                    </div>
                  </div>

                  {/* Year */}
                  <div className="mb-2">
                    <span
                      className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-wider inline-block"
                      style={{
                        color: "transparent",
                        WebkitTextStroke: "2px #E52528",
                        filter: "drop-shadow(0 0 6px rgba(229, 37, 40, 0.4))",
                      }}
                    >
                      {data.year}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="title-text text-xl md:text-2xl lg:text-3xl font-extrabold mb-2 tracking-tight"
                    style={{ color: "#ffffff" }}
                  >
                    {data.title}
                  </h3>

                  {/* Description */}
                  <div className="text-white text-sm sm:text-base font-normal leading-snug w-full max-w-xs">
                    <p>{data.descLine1}</p>
                    <p>{data.descLine2}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Obsession;