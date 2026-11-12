"use client";

import { ArrowUpRight } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { matter } from "@/font/fonts";
import { JobPost } from "@/sanity/lib/types";

// ── Fallback static jobs (shown when Sanity returns nothing) ─────────────────
const FALLBACK_JOBS: JobPost[] = [
  {
    _id: "fallback-1",
    location: "Bordeaux Centre",
    type: "Full & Part-Time",
    role: "Delivery Coordinator",
    youare: "A Natural Leader, Organized, Not The Office.",
    nicetohave: "Team-Lead Or Supervisory Experience In Food/Retail.",
    hours: "Full-Time, Rotating Shifts.",
    pay: "Competitive Salary + Progression Path To Restaurant Manager.",
    applyMethod: "email",
    applyEmail: "careers@cfoco.fr",
    applySubject: "Application for {role} at {location}",
  },
  {
    _id: "fallback-2",
    location: "Mérignac",
    type: "Full-Time",
    role: "Store Supervisor",
    youare: "A Natural Leader, Organized, Not The Office.",
    nicetohave: "Team-Lead Or Supervisory Experience In Food/Retail.",
    hours: "Full-Time, Rotating Shifts.",
    pay: "Competitive Salary + Progression Path To Restaurant Manager.",
    applyMethod: "email",
    applyEmail: "careers@cfoco.fr",
    applySubject: "Application for {role} at {location}",
  },
];

const marqueetext = "Your Best Job Yet Starts Here";
const AUTOPLAY_MS = 3500;
const RESUME_AFTER_TOUCH_MS = 6000;

// ── Build the href for the Apply Now button ──────────────────────────────────
function buildApplyHref(job: JobPost): string {
  if (job.applyMethod === "link" && job.applyLink) {
    return job.applyLink;
  }
  // email (default)
  const email = job.applyEmail ?? "careers@cfoco.fr";
  const rawSubject = job.applySubject ?? "Application for {role} at {location}";
  const subject = rawSubject
    .replace("{role}", job.role)
    .replace("{location}", job.location);
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

// ── Job Card ─────────────────────────────────────────────────────────────────
const JobCard = ({ job }: { job: JobPost }) => {
  const details = [
    { label: "You Are", value: job.youare },
    { label: "Nice To Have", value: job.nicetohave },
    { label: "Hours", value: job.hours },
    { label: "Pay", value: job.pay },
  ].filter((item): item is { label: string; value: string } =>
    Boolean(item.value)
  );

  const isExternalLink = job.applyMethod === "link" && Boolean(job.applyLink);

  return (
    <article className="flex h-full w-full flex-col justify-between rounded-[20px] sm:rounded-[24px] border border-white/15 bg-[#0a0c12]/90 p-5 sm:p-7 md:p-8 backdrop-blur-md transition-colors duration-300 hover:border-[#F6B90B]/50">
      <div>
        {/* Location & Employment Type */}
        <p className="text-xs sm:text-sm font-medium text-white/75 tracking-tight leading-[1.3] mb-1.5">
          {job.location}
          {job.type ? ` · ${job.type}` : ""}
        </p>

        {/* Role Title */}
        <h3 className="text-xl sm:text-2xl md:text-[1.75rem] font-bold text-[#F6B90B] tracking-tight leading-[1.3] mb-5 sm:mb-6">
          {job.role}
        </h3>

        {/* Details */}
        {details.length > 0 && (
          <div className="space-y-2.5 sm:space-y-3 border-t border-white/10 pt-4 sm:pt-5">
            {details.map(({ label, value }) => (
              <p
                key={label}
                className="text-sm sm:text-base text-white/90 leading-[1.3] tracking-tight"
              >
                <span className="text-[#F6B90B] font-semibold mr-2">
                  {label}:
                </span>
                {value}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 pt-4 border-t border-white/10 flex items-center justify-end">
        <a
          href={buildApplyHref(job)}
          {...(isExternalLink
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="group/btn inline-flex items-center gap-3 rounded-full bg-white/80 hover:bg-white py-1 pl-4 pr-1 text-xs sm:text-sm font-semibold text-[#232E45] transition-colors duration-200"
        >
          <span className="tracking-tight leading-[1.3]">Apply Now</span>
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#1e293b] text-white transition-transform duration-200 group-hover/btn:scale-105">
            <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        </a>
      </div>
    </article>
  );
};

// ── Main Section ─────────────────────────────────────────────────────────────
interface WhatWeRefuseProps {
  jobs?: JobPost[];
}

const WhatWeRefuse = ({ jobs: jobsProp }: WhatWeRefuseProps) => {
  const jobs = jobsProp && jobsProp.length > 0 ? jobsProp : FALLBACK_JOBS;

  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef(0);
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
    [commitIndex],
  );

  const handleScroll = useCallback(() => {
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
    const opts: AddEventListenerOptions = { passive: true };
    track.addEventListener("touchstart", pauseAutoplay, opts);
    track.addEventListener("pointerdown", pauseAutoplay, opts);
    track.addEventListener("touchend", scheduleResume, opts);
    track.addEventListener("touchcancel", scheduleResume, opts);
    track.addEventListener("pointerup", scheduleResume, opts);
    const onVisibility = () => {
      if (document.hidden) pauseAutoplay();
      else scheduleResume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const interval = setInterval(() => {
      if (pausedRef.current || document.hidden) return;
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
  }, [goTo, pauseAutoplay, scheduleResume, jobs.length]);

  return (
    <section className={`relative w-full py-16 sm:py-20 overflow-hidden ${matter.className}`}>
      <div className="px-4 sm:px-[5%] relative z-10">
        {/* Title */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-[#F6B90B] font-bold tracking-tight">
            <span className="block text-3xl md:text-[3.125rem] leading-[1.3]">
              What We Refuse
            </span>
            <span className="block text-3xl md:text-[4.375rem] leading-[1.1]">
              To Compromise
            </span>
          </h2>
        </div>

        {/* Desktop & Tablet grid */}
        <div
          className={`hidden md:grid gap-6 lg:gap-8 mx-auto items-stretch ${
            jobs.length === 1
              ? "grid-cols-1 max-w-2xl"
              : "grid-cols-2 max-w-6xl"
          }`}
        >
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
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
            className="flex w-full items-stretch overflow-x-auto snap-x snap-mandatory gap-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              overscrollBehaviorX: "contain",
              scrollBehavior: "auto",
              touchAction: "pan-x pan-y",
            }}
          >
            {jobs.map((job, idx) => (
              <div
                key={job._id}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                className="w-full shrink-0 snap-center flex"
                aria-hidden={activeSlide !== idx}
              >
                <JobCard job={job} />
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
                className="py-3 -my-3 px-1 -mx-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? "w-7 bg-[#F6B90B]"
                      : "w-2 bg-white/25"
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
