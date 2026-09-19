"use client";

import { ArrowUpRight } from "lucide-react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

const jobs = [
  {
    location: "Bordeaux Centre",
    type: "Full & Part-Time",
    role: "Delivery Coordinator",
    youare: "A Natural Leader, Organized, Not The Office.",
    nicetohave: "Team-Lead Or Supervisory Experience In Food/Retail.",
    hours: "Full-Time, Rotating Shifts.",
    pay: "Competitive Salary + Progression Path To Restaurant Manager.",
  },
  {
    location: "Mérignac",
    type: "Full-Time",
    role: "Store Supervisor",
    youare: "A Natural Leader, Organized, Not The Office.",
    nicetohave: "Team-Lead Or Supervisory Experience In Food/Retail.",
    hours: "Full-Time, Rotating Shifts.",
    pay: "Competitive Salary + Progression Path To Restaurant Manager.",
  },
];

const marqueetext = "Your Best Job Yet Starts Here";

const ENABLE_AUTOPLAY = true; // set to false to test without autoplay
const AUTOPLAY_MS = 5000;
const RESUME_AFTER_INTERACTION_MS = 6000;
const IDLE_AFTER_PAGE_SCROLL_MS = 1500;

type Job = (typeof jobs)[number];

/** Card markup shared by the desktop grid and the mobile slider. */
const JobCard = memo(function JobCard({
  job,
  compact,
}: {
  job: Job;
  compact?: boolean;
}) {
  return (
    <div className="relative w-full flex flex-col h-full group select-none">
      {/* TOP BLOCK */}
      <div
        className={`w-full bg-[#0a0a0f] border border-[#0066FF] rounded-t-[1.3rem] rounded-br-[1.3rem] rounded-bl-none relative z-0 ${
          compact ? "p-5 xs:p-6 pb-4" : "p-6 sm:p-8 pb-4"
        }`}
      >
        <h3
          className={`text-white font-semibold mb-4 sm:mb-6 ${
            compact ? "text-lg xs:text-xl" : "text-xl sm:text-2xl"
          }`}
        >
          {job.location} · {job.type}
        </h3>

        <div
          className={`space-y-1.5 sm:space-y-2 ${
            compact ? "text-xs xs:text-sm" : "text-sm sm:text-base"
          }`}
        >
          <p className="text-white/90">
            <span className="text-[#F6B90B] font-semibold mr-2">You Are:</span>
            {job.youare}
          </p>
          <p className="text-white/90">
            <span className="text-[#F6B90B] font-semibold mr-2">Nice To Have:</span>
            {job.nicetohave}
          </p>
          <p className="text-white/90">
            <span className="text-[#F6B90B] font-semibold mr-2">Hours:</span>
            {job.hours}
          </p>
          <p className="text-white/90 leading-snug">
            <span className="text-[#F6B90B] font-semibold mr-2">Pay:</span>
            {job.pay}
          </p>
        </div>
      </div>

      {/* BOTTOM BLOCK (Apply Now, with the inverted corner) */}
      <div
        className={`bg-[#0a0a0f] border-b border-l border-r border-[#0066FF] rounded-b-[1.3rem] relative z-10 ${
          compact ? "w-[48%] xs:w-[46%] p-4 xs:p-5" : "w-[45%] sm:w-[42%] p-6"
        }`}
      >
        <div className="absolute -top-[2px] left-0 right-0 h-[4px] bg-[#0a0a0f]" />

        <svg
          className="absolute -top-[1px] left-full w-[24px] h-[24px] pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M 0 0 L 0 24 A 24 24 0 0 1 24 0 Z" fill="#0a0a0f" />
          <path
            d="M 0 24 A 24 24 0 0 1 24 0"
            fill="none"
            stroke="#0066FF"
            strokeWidth="1.5"
          />
        </svg>

        <button
          type="button"
          className={`relative z-20 text-white hover:text-[#F6B90B] transition-colors flex items-center gap-1.5 xs:gap-2 font-medium ${
            compact ? "text-xs xs:text-sm" : "text-sm sm:text-lg"
          }`}
        >
          Apply Now
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* JOB TITLE (in the notch) */}
      <div
        className={`absolute flex items-center justify-end z-20 pointer-events-none ${
          compact
            ? "bottom-3 xs:bottom-4 right-3 w-[50%]"
            : "bottom-4 sm:bottom-6 right-3 sm:right-4 w-[52%]"
        }`}
      >
        <span
          className={`text-[#F6B90B] font-bold text-right leading-tight break-words ${
            compact ? "text-sm xs:text-base sm:text-xl" : "text-lg sm:text-2xl"
          }`}
        >
          {job.role}
        </span>
      </div>
    </div>
  );
});

const WhatWeRefuse = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marqueeWrapRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Mutable state read by the autoplay timer (no re-renders)
  const activeRef = useRef(0);
  const inViewRef = useRef(false);
  const touchingRef = useRef(false);
  const lastInteractionRef = useRef(0);
  const lastPageScrollRef = useRef(0);

  const commitActive = useCallback((index: number) => {
    activeRef.current = index;
    setActiveSlide(index); // React bails out if unchanged
  }, []);

  const goTo = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const track = trackRef.current;
      const slide = slideRefs.current[index];
      if (!track || !slide) return;
      track.scrollTo({ left: slide.offsetLeft, behavior });
    },
    []
  );

  // 1. Active slide (dots) via IntersectionObserver: no scroll handler at all
  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.6) {
            commitActive(Number((entry.target as HTMLElement).dataset.index));
          }
        }
      },
      { root: track, threshold: [0.6] }
    );

    slideRefs.current.forEach((slide) => slide && io.observe(slide));
    return () => io.disconnect();
  }, [commitActive]);

  // 2. Track user interaction + page scrolling (cheap timestamp writes only)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTouchStart = () => {
      touchingRef.current = true;
    };
    const onTouchEnd = () => {
      touchingRef.current = false;
      lastInteractionRef.current = Date.now();
    };
    const onWheel = () => {
      lastInteractionRef.current = Date.now();
    };
    const onPageScroll = () => {
      lastPageScrollRef.current = Date.now();
    };

    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchend", onTouchEnd, { passive: true });
    track.addEventListener("touchcancel", onTouchEnd, { passive: true });
    track.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onPageScroll, { passive: true });

    return () => {
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchend", onTouchEnd);
      track.removeEventListener("touchcancel", onTouchEnd);
      track.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onPageScroll);
    };
  }, []);

  // 3. Autoplay: only advances when the page is calm and the user isn't interacting
  useEffect(() => {
    if (!ENABLE_AUTOPLAY || jobs.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = Date.now();
      const canAdvance =
        inViewRef.current &&
        !document.hidden &&
        !touchingRef.current &&
        now - lastInteractionRef.current > RESUME_AFTER_INTERACTION_MS &&
        now - lastPageScrollRef.current > IDLE_AFTER_PAGE_SCROLL_MS;

      if (canAdvance) goTo((activeRef.current + 1) % jobs.length, "smooth");
      timer = setTimeout(tick, AUTOPLAY_MS);
    };

    timer = setTimeout(tick, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [goTo]);

  // 4. Visibility: gate autoplay and pause the marquee when off-screen
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      inViewRef.current = true;
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === trackRef.current) {
            inViewRef.current = entry.isIntersecting;
          } else if (entry.target === marqueeWrapRef.current && marqueeRef.current) {
            marqueeRef.current.style.animationPlayState = entry.isIntersecting
              ? "running"
              : "paused";
          }
        }
      },
      { threshold: 0.2 }
    );

    if (trackRef.current) io.observe(trackRef.current);
    if (marqueeWrapRef.current) io.observe(marqueeWrapRef.current);

    return () => io.disconnect();
  }, []);

  return (
    <section className="relative w-full py-20 overflow-hidden font-sans">
      {/* Three identical copies, translate -1/3 = exactly one copy = seamless. */}
      <style>{`
        @keyframes wwr-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-33.33333%, 0, 0); }
        }
        .wwr-marquee {
          animation: wwr-marquee 28s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .wwr-track::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .wwr-marquee { animation: none; }
        }
      `}</style>

      <div className="px-4 sm:px-[5%] relative z-10">
        {/* Title */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-[#F6B90B] font-bold">
            <span className="block text-3xl md:text-[3.125rem] leading-none">
              What We Refuse
            </span>
            <span className="block text-3xl md:text-[4.375rem] leading-none">
              To Compromise
            </span>
          </h2>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-4 max-w-6xl mx-auto">
          {jobs.map((job, idx) => (
            <JobCard key={idx} job={job} />
          ))}
        </div>

        {/* Mobile slider: native scroll-snap, no JS in the scroll path */}
        <div className="md:hidden w-full relative">
          <div
            ref={trackRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Open positions"
            className="wwr-track relative flex w-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain gap-4 pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {jobs.map((job, idx) => (
              <div
                key={idx}
                data-index={idx}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                className="w-full shrink-0 snap-center snap-always"
              >
                <JobCard job={job} compact />
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {jobs.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  lastInteractionRef.current = Date.now();
                  commitActive(index);
                  goTo(index, "smooth");
                }}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeSlide === index}
                className="py-3 -my-3 px-1 -mx-1"
              >
                <span
                  className={`block h-1 rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? "w-7 bg-[#CC1518]"
                      : "w-2 bg-[#CC1518]/40"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div
        ref={marqueeWrapRef}
        className="mt-24 w-full overflow-hidden relative z-0 pointer-events-none"
        aria-hidden="true"
      >
        <div ref={marqueeRef} className="wwr-marquee flex w-max">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className="text-transparent text-[4rem] sm:text-[6rem] md:text-[8rem] font-bold tracking-tight uppercase px-4 whitespace-nowrap"
              style={{ WebkitTextStroke: "1px #F6B90B" }}
            >
              {marqueetext}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeRefuse;