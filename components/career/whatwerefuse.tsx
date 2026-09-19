"use client";

import { ArrowUpRight } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

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

const AUTOPLAY_MS = 3500;
const RESUME_AFTER_TOUCH_MS = 6000;

type Job = (typeof jobs)[number];

/** Card markup shared by the desktop grid and the mobile slider. */
const JobCard = ({ job, compact }: { job: Job; compact?: boolean }) => (
  <div className="relative w-full flex flex-col h-full group">
    {/* TOP BLOCK */}
    <div
      className={`w-full bg-[#0a0a0f] border border-[#0066FF] rounded-t-[1.3rem] rounded-br-[1.3rem] rounded-bl-none relative z-0 ${
        compact ? "p-6 pb-4" : "p-6 sm:p-8 pb-4"
      }`}
    >
      <h3
        className={`text-white font-semibold mb-6 ${
          compact ? "text-xl" : "text-xl sm:text-2xl"
        }`}
      >
        {job.location} · {job.type}
      </h3>

      <div className={compact ? "text-sm" : "text-sm sm:text-base"}>
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
        compact ? "w-[48%] p-5" : "w-[45%] sm:w-[42%] p-6"
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
        className={`relative z-20 text-white hover:text-[#F6B90B] transition-colors flex items-center gap-2 font-medium ${
          compact ? "text-sm" : "text-sm sm:text-lg"
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
          ? "bottom-3 sm:bottom-5 right-3 w-[50%]"
          : "bottom-4 sm:bottom-6 right-3 sm:right-4 w-[52%]"
      }`}
    >
      <span
        className={`text-[#F6B90B] font-bold text-right leading-tight break-words ${
          compact ? "text-base sm:text-xl" : "text-lg sm:text-2xl"
        }`}
      >
        {job.role}
      </span>
    </div>
  </div>
);

const WhatWeRefuse = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mirror of activeSlide for use inside intervals/handlers without re-binding.
  const indexRef = useRef(0);
  // Autoplay is suspended while the user is touching, and for a while after.
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const commitIndex = useCallback((i: number) => {
    if (indexRef.current === i) return;
    indexRef.current = i;
    setActiveSlide(i);
  }, []);

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Scroll to a slide by measuring its real position.
   * The old code used `index * clientWidth`, which is wrong the moment the
   * track has `gap-4`: the true pitch is clientWidth + 16px, so every slide
   * after the first landed short and the snap points fought the scroll.
   */
  const goTo = useCallback(
    (i: number, smooth = true) => {
      const track = scrollRef.current;
      const slide = slideRefs.current[i];
      if (!track || !slide) return;

      track.scrollTo({
        left: slide.offsetLeft - track.offsetLeft,
        behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
      });
      commitIndex(i);
    },
    [commitIndex]
  );

  /** Derive the active index from actual scroll position, not from arithmetic. */
  const handleScroll = useCallback(() => {
    // rAF throttle: iOS fires scroll continuously during momentum, and an
    // unthrottled setState there is the main source of stutter.
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const track = scrollRef.current;
      if (!track) return;

      const viewportCenter = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;

      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        const center =
          slide.offsetLeft - track.offsetLeft + slide.clientWidth / 2;
        const dist = Math.abs(center - viewportCenter);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });

      commitIndex(best);
    });
  }, [commitIndex]);

  /** Pause autoplay while the finger is down, resume after a quiet period. */
  const pauseAutoplay = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const scheduleResume = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_AFTER_TOUCH_MS);
  }, []);

  useEffect(() => {
    const track = scrollRef.current;
    if (!track || jobs.length < 2) return;

    // passive listeners so touch handling never blocks the compositor
    const opts: AddEventListenerOptions = { passive: true };
    track.addEventListener("touchstart", pauseAutoplay, opts);
    track.addEventListener("pointerdown", pauseAutoplay, opts);
    track.addEventListener("touchend", scheduleResume, opts);
    track.addEventListener("touchcancel", scheduleResume, opts);
    track.addEventListener("pointerup", scheduleResume, opts);

    const onVisibility = () => {
      // Never advance in a backgrounded tab — the queued scrolls all fire at
      // once on return, which looks like the slider "jumping" on wake.
      if (document.hidden) pauseAutoplay();
      else scheduleResume();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const interval = setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      // No side effects inside a setState updater — that one ran twice under
      // React StrictMode in dev and double-advanced the slider.
      goTo((indexRef.current + 1) % jobs.length);
    }, AUTOPLAY_MS);

    return () => {
      clearInterval(interval);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      track.removeEventListener("touchstart", pauseAutoplay);
      track.removeEventListener("pointerdown", pauseAutoplay);
      track.removeEventListener("touchend", scheduleResume);
      track.removeEventListener("touchcancel", scheduleResume);
      track.removeEventListener("pointerup", scheduleResume);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [goTo, pauseAutoplay, scheduleResume]);

  return (
    <section className="relative w-full py-20 overflow-hidden font-sans">
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

        {/* Mobile slider */}
        <div className="md:hidden w-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            role="region"
            aria-roledescription="carousel"
            aria-label="Open positions"
            className="flex w-full overflow-x-auto snap-x snap-mandatory gap-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              // Keeps the iOS edge-swipe "back" gesture from stealing the drag,
              // and stops the whole page from rubber-banding sideways.
              overscrollBehaviorX: "contain",
              // Never set `scroll-behavior: smooth` in CSS here — it makes every
              // finger-drag go through the smooth-scroll engine on iOS and feel
              // laggy. Smoothness is opted into per-call in goTo() instead.
              scrollBehavior: "auto",
              touchAction: "pan-x pan-y",
            }}
          >
            {jobs.map((job, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                className="w-full shrink-0 snap-center"
                aria-hidden={activeSlide !== idx}
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
                  pauseAutoplay();
                  scheduleResume();
                  goTo(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeSlide === index}
                // min tap target: the 4px-tall bar alone is unhittable on phones
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
        className="mt-24 w-full overflow-hidden relative z-0"
        aria-hidden="true"
      >
        <div className="animate-marquee motion-reduce:animate-none flex w-max transform-gpu">
          {Array.from({ length: 4 }).map((_, i) => (
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