"use client";

import React from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";

interface Milestone {
  year: string;
  title: string;
  descLine1: string;
  descLine2: string;
  isCenter?: boolean;
}

const milestones: Milestone[] = [
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
    isCenter: true,
  },
  {
    year: "2018",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
  },
];

const Obsession = () => {
  return (
    <section className={`relative w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-transparent select-none overflow-hidden ${matter.className}`}>
      {/* Animation Styles */}
      <style>{`
        @keyframes laserPulseMove {
          0% {
            left: 0%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6);
          }
          5% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          16.66% {
            left: 16.66%;
            transform: translate(-50%, -50%) scale(1.3);
          }
          50% {
            left: 50%;
            transform: translate(-50%, -50%) scale(1.4);
          }
          83.33% {
            left: 83.33%;
            transform: translate(-50%, -50%) scale(1.3);
          }
          95% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            left: 100%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6);
          }
        }

        /* Node 1 Flare (2011 at 16.66%) */
        @keyframes node1Flare {
          0%, 8% {
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
            border-color: rgba(2, 136, 255, 0.3);
            transform: scale(1);
          }
          16.66% {
            box-shadow: 0 0 22px 6px #00d4ff, 0 0 45px 12px rgba(2,136,255,0.85), inset 0 0 15px rgba(0,212,255,0.6);
            border-color: #00d4ff;
            transform: scale(1.1);
          }
          25%, 100% {
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
            border-color: rgba(2, 136, 255, 0.3);
            transform: scale(1);
          }
        }

        /* Node 2 Flare (2014 Center at 50%) */
        @keyframes node2HaloFlare {
          0%, 40% {
            box-shadow: 0 0 14px 2px #0288FF, 0 0 30px 6px rgba(2,136,255,0.7), inset 0 0 14px 2px rgba(0,212,255,0.5);
            border-color: #0288FF;
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 35px 10px #00d4ff, 0 0 70px 22px rgba(2,136,255,0.95), inset 0 0 25px rgba(0,212,255,0.9);
            border-color: #ffffff;
            transform: scale(1.12);
          }
          60%, 100% {
            box-shadow: 0 0 14px 2px #0288FF, 0 0 30px 6px rgba(2,136,255,0.7), inset 0 0 14px 2px rgba(0,212,255,0.5);
            border-color: #0288FF;
            transform: scale(1);
          }
        }

        /* Node 3 Flare (2018 at 83.33%) */
        @keyframes node3Flare {
          0%, 75% {
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
            border-color: rgba(2, 136, 255, 0.3);
            transform: scale(1);
          }
          83.33% {
            box-shadow: 0 0 22px 6px #00d4ff, 0 0 45px 12px rgba(2,136,255,0.85), inset 0 0 15px rgba(0,212,255,0.6);
            border-color: #00d4ff;
            transform: scale(1.1);
          }
          92%, 100% {
            box-shadow: 0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2);
            border-color: rgba(2, 136, 255, 0.3);
            transform: scale(1);
          }
        }

        /* Background ambient bloom flare */
        @keyframes node1Bloom {
          0%, 8% { opacity: 0; transform: scale(0.8); }
          16.66% { opacity: 0.9; transform: scale(1.5); }
          25%, 100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes node2Bloom {
          0%, 40% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.6); }
          60%, 100% { opacity: 0.3; transform: scale(1); }
        }
        @keyframes node3Bloom {
          0%, 75% { opacity: 0; transform: scale(0.8); }
          83.33% { opacity: 0.9; transform: scale(1.5); }
          92%, 100% { opacity: 0; transform: scale(0.8); }
        }
      `}</style>

      {/* Background Ambient Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-[1200px] h-[320px] rounded-full pointer-events-none blur-[130px]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(2, 136, 255, 0.16) 0%, rgba(13, 27, 62, 0.08) 50%, transparent 80%)",
        }}
      />

      {/* Header Title */}
      <div className="max-w-4xl mx-auto text-center space-y-1 mb-20 md:mb-28">
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
          13 Years
        </h2>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
          One Obsession
        </h2>
      </div>

      {/* Timeline Section */}
      <div className="max-w-6xl mx-auto relative">
        {/* Horizontal Glowing Connecting Line across Desktop */}
        <div className="hidden md:block absolute top-[48px] sm:top-[52px] left-0 right-0 h-[2px] -translate-y-1/2 z-0 pointer-events-none">
          {/* Base glowing line */}
          <div
            className="w-full h-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(2,136,255,0.4) 10%, rgba(2,136,255,0.9) 30%, rgba(0,212,255,1) 50%, rgba(2,136,255,0.9) 70%, rgba(2,136,255,0.4) 90%, transparent 100%)",
              boxShadow: "0 0 10px 1px rgba(2,136,255,0.6), 0 0 25px 4px rgba(2,136,255,0.3)",
            }}
          />

          {/* Flowing Laser Beacon (Left to Right) with Trail */}
          <div
            className="absolute top-1/2"
            style={{
              animation: "laserPulseMove 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          >
            {/* Extended luminous tail on the left */}
            <div
              className="absolute top-1/2 right-1 -translate-y-1/2 w-20 h-[3px]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.9))",
                filter: "blur(0.5px)",
              }}
            />
            {/* Bright Core Dot */}
            <div
              className="w-3 h-3 rounded-full bg-white relative z-10"
              style={{
                boxShadow: "0 0 8px 3px #ffffff, 0 0 18px 6px #00d4ff, 0 0 32px 10px rgba(2,136,255,0.9)",
              }}
            />
          </div>
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
          {milestones.map((item, index) => (
            <div
              key={item.year}
              className="flex flex-col items-center text-center group"
            >
              {/* Badge Icon Area */}
              <div className="relative mb-6 h-[96px] sm:h-[104px] flex items-center justify-center">
                {item.isCenter ? (
                  /* Center Glowing Halo Ring + Gap + Inner Disc */
                  <div className="relative flex items-center justify-center">
                    {/* Ambient Glow Flare */}
                    <div
                      className="absolute w-[130px] h-[130px] rounded-full blur-[30px] pointer-events-none transition-all duration-500"
                      style={{
                        background: "rgba(2, 136, 255, 0.5)",
                        animation: "node2Bloom 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                      }}
                    />

                    {/* Outer Crisp Neon Ring */}
                    <div
                      className="relative w-[92px] h-[92px] sm:w-[104px] sm:h-[104px] rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        border: "2px solid #0288FF",
                        animation: "node2HaloFlare 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                        boxShadow: "0 0 14px 2px #0288FF, 0 0 30px 6px rgba(2,136,255,0.7), inset 0 0 14px 2px rgba(0,212,255,0.5)",
                      }}
                    >
                      {/* Inner Dark Metallic Disc with Gap */}
                      <div
                        className="w-[70px] h-[70px] sm:w-[82px] sm:h-[82px] rounded-full flex items-center justify-center border border-[#0288FF]/40 transition-transform duration-300"
                        style={{
                          background: "radial-gradient(circle at 35% 30%, #1e2638 0%, #0d121c 65%, #070a10 100%)",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.8)",
                        }}
                      >
                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                          <Image
                            src="/chicken_logo.svg"
                            alt="CFOCO Chicken Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Node Disc (Node 1 or Node 3) */
                  <div className="relative flex items-center justify-center">
                    {/* Ambient Glow behind Node 1 & 3 */}
                    <div
                      className="absolute w-[90px] h-[90px] rounded-full blur-[22px] pointer-events-none transition-all duration-500"
                      style={{
                        background: "rgba(2, 136, 255, 0.5)",
                        animation:
                          index === 0
                            ? "node1Bloom 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite"
                            : "node3Bloom 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                      }}
                    />

                    {/* Dark metallic disc that illuminates when dot hits */}
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: "radial-gradient(circle at 35% 30%, #1f2535 0%, #0d121c 65%, #070a10 100%)",
                        border: "1.5px solid rgba(2, 136, 255, 0.3)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.9), inset 0 1.5px 2px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.8)",
                        animation:
                          index === 0
                            ? "node1Flare 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite"
                            : "node3Flare 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                      }}
                    >
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                        <Image
                          src="/chicken_logo.svg"
                          alt="CFOCO Chicken Icon"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Year with Red Neon Outline */}
              <div className="mb-1 md:mb-2">
                <span
                  className="font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-wider inline-block transition-transform duration-300 group-hover:scale-105"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "1.5px #E52528",
                  }}
                >
                  {item.year}
                </span>
              </div>

              {/* Milestone Title */}
              <h3 className="text-xl md:text-xl lg:text-[2.5rem] font-bold text-white mb-2 tracking-tight">
                {item.title}
              </h3>

              {/* Description */}
              <div className="text-white text-sm md:text-sm lg:text-xl font-medium leading-[1.2] w-full lg:max-w-sm">
                <p>{item.descLine1}</p>
                <p>{item.descLine2}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Obsession;