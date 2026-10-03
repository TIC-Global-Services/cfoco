"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { matter } from "@/font/fonts";
import Image from "next/image";

export interface ReviewCardItem {
  id: string;
  rating: number;
  quote: string;
  authorName: string;
  avatarColor?: string;
}

const defaultLeftReviews: ReviewCardItem[] = [
  {
    id: "rev-1",
    rating: 5,
    quote:
      "“The crunch is unreal. Every bite is crispy, juicy, and packed with flavor. Definitely my new go-to spot!”",
    authorName: "Michael Chen",
    avatarColor: "from-cyan-500 to-blue-600",
  },
  {
    id: "rev-2",
    rating: 5,
    quote:
      "“Hands down the freshest chicken in town. The secret recipe coating is unmatched anywhere else.”",
    authorName: "Sarah Jenkins",
    avatarColor: "from-amber-400 to-orange-500",
  },
  {
    id: "rev-3",
    rating: 5,
    quote:
      "“Crispy chemistry at its finest. You can literally hear the quality before the first bite.”",
    authorName: "Marcus Vance",
    avatarColor: "from-emerald-400 to-teal-600",
  },
];

const defaultRightReviews: ReviewCardItem[] = [
  {
    id: "rev-4",
    rating: 5,
    quote:
      "“From the food to the vibe, everything feels premium. The burgers are hands down some of the best I've had.”",
    authorName: "Michael Chen",
    avatarColor: "from-blue-500 to-indigo-600",
  },
  {
    id: "rev-5",
    rating: 5,
    quote:
      "“No frozen shortcuts and you can genuinely taste the difference. Absolute perfection!”",
    authorName: "Elena Rostova",
    avatarColor: "from-rose-400 to-red-500",
  },
  {
    id: "rev-6",
    rating: 5,
    quote:
      "“The dipping sauces alone deserve an award. Fast service without losing an ounce of quality.”",
    authorName: "David Ross",
    avatarColor: "from-purple-500 to-pink-500",
  },
];

const ReviewCard = ({ card }: { card: ReviewCardItem }) => {
  return (
    <div className="relative overflow-hidden bg-[#1a1d2be6] backdrop-blur-md border border-white/10 rounded-[24px] sm:rounded-[30px] py-6 px-5 sm:p-6 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-[88vw] max-w-[340px] sm:w-[320px] md:w-[380px] lg:w-[450px] pointer-events-auto">
      <div className="flex items-center mb-4 text-[#FFBB00]">
        {Array.from({ length: card.rating }).map((_, i) => (
          <svg
            key={i}
            className="w-4.5 h-4.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 fill-current"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <p className="text-base sm:text-sm md:text-base text-neutral-200 font-normal leading-[1.2] mb-4 sm:mb-6">
        {card.quote}
      </p>

      <div className="relative flex items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
        <div
          className={`w-12.5 h-12.5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr ${
            card.avatarColor || "from-cyan-400 to-blue-600"
          } p-[2px] shadow-sm shrink-0`}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden bg-[#111726]">
            <Image
              alt=""
              fill
              sizes="50px"
              src="/avatar.jpg"
              className="object-cover"
            />
          </div>
        </div>

        <span className="text-lg sm:text-sm lg:text-xl font-medium text-white tracking-wide">
          {card.authorName}
        </span>
      </div>
    </div>
  );
};

const AnimatedReviewCard = ({
  card,
  startP,
  endP,
  scrollYProgress,
  className,
}: {
  card: ReviewCardItem;
  startP: number;
  endP: number;
  scrollYProgress: MotionValue<number>;
  className: string;
}) => {
  // y starts completely below viewport ("100vh") and glides upward past the top ("-100vh")
  const y = useTransform(scrollYProgress, [startP, endP], ["100vh", "-100vh"]);

  const pointerEvents = useTransform(scrollYProgress, (p) =>
    p >= startP && p <= endP ? "auto" : "none"
  );

  const visibility = useTransform(scrollYProgress, (p) =>
    p >= startP ? "visible" : "hidden"
  );

  return (
    <motion.div
      className={`${className} transform-gpu`}
      style={{ y, pointerEvents, visibility }}
    >
      <div className="pointer-events-auto">
        <ReviewCard card={card} />
      </div>
    </motion.div>
  );
};

export interface ReviewsProps {
  leftReviews?: ReviewCardItem[];
  rightReviews?: ReviewCardItem[];
}

const Reviews = ({
  leftReviews = defaultLeftReviews,
  rightReviews = defaultRightReviews,
}: ReviewsProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Framer Motion native useScroll:
  // Starts strictly when the top of the reviews section reaches the top of viewport ("start start")
  // Clamped at 0 before the section is reached — zero chance of starting early!
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Calculate timing windows for each card.
  // [0.00 to 0.08]: Clean entrance breathing room — title is presented cleanly, no cards floating yet.
  // [0.08 to 0.96]: Cards float through the viewport.
  const getCardTiming = (side: "left" | "right", index: number) => {
    if (isDesktop) {
      // Desktop: 2 parallel floating columns with slight horizontal alternation
      const ranges = {
        left: [
          { start: 0.08, end: 0.52 },
          { start: 0.24, end: 0.68 },
          { start: 0.40, end: 0.84 },
        ],
        right: [
          { start: 0.16, end: 0.60 },
          { start: 0.32, end: 0.76 },
          { start: 0.48, end: 0.92 },
        ],
      };
      return ranges[side][index] || { start: 0.08, end: 0.52 };
    }

    // Mobile / Tablet: Sequential 1-by-1 spotlights (left, right, left, right...)
    // Each card gets its own dedicated window without screen crowding
    const mobileSchedule = [
      { side: "left", idx: 0, start: 0.08, end: 0.34 },
      { side: "right", idx: 0, start: 0.20, end: 0.46 },
      { side: "left", idx: 1, start: 0.32, end: 0.58 },
      { side: "right", idx: 1, start: 0.44, end: 0.70 },
      { side: "left", idx: 2, start: 0.56, end: 0.82 },
      { side: "right", idx: 2, start: 0.68, end: 0.94 },
    ];

    const match = mobileSchedule.find(
      (item) => item.side === side && item.idx === index
    );
    return match ? { start: match.start, end: match.end } : { start: 0.08, end: 0.34 };
  };

  return (
    <section
      ref={sectionRef}
      id="reviews-section"
      className={`relative w-full bg-transparent select-none ${matter.className} h-[360vh] lg:h-[280vh]`}
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen supports-[height:100svh]:h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden px-0 sm:px-[5%]">
        {/* Ambient glows */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0) 70%)",
          }}
        />
        <div
          className="absolute top-1/3 left-1/4 w-[300px] sm:w-[350px] h-[300px] sm:h-[350px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0) 70%)",
          }}
        />

        {/* Centered title layer */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center select-none">
          <div className="space-y-1">
            <h2 className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-[5.625rem] font-bold tracking-tight text-[#E5A823] leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              16,000
            </h2>
            <h2 className="text-xl xs:text-2xl sm:text-5xl md:text-6xl lg:text-[4.735rem] font-bold tracking-tight text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              Reviews Can&apos;t Be Wrong
            </h2>
          </div>
        </div>

        {/* Floating cards layer */}
        <div className="absolute inset-0 z-10 w-full flex justify-between h-full pointer-events-none px-2 sm:px-4">
          {/* Left Column */}
          <div className="w-full lg:w-1/2 absolute inset-y-0 left-0 h-full pointer-events-none">
            {leftReviews.map((card, i) => {
              const { start, end } = getCardTiming("left", i);
              return (
                <AnimatedReviewCard
                  key={`rev-left-${card.id}-${i}`}
                  card={card}
                  startP={start}
                  endP={end}
                  scrollYProgress={scrollYProgress}
                  className="absolute inset-0 flex items-center justify-start lg:justify-end px-4 lg:px-0 lg:pr-16 pointer-events-none"
                />
              );
            })}
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-1/2 absolute inset-y-0 right-0 h-full pointer-events-none">
            {rightReviews.map((card, i) => {
              const { start, end } = getCardTiming("right", i);
              return (
                <AnimatedReviewCard
                  key={`rev-right-${card.id}-${i}`}
                  card={card}
                  startP={start}
                  endP={end}
                  scrollYProgress={scrollYProgress}
                  className="absolute inset-0 flex items-center justify-end lg:justify-start px-4 lg:px-0 lg:pl-16 pointer-events-none"
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;