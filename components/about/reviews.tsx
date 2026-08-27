"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { matter } from "@/font/fonts";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
    <div className="relative overflow-hidden bg-[#182030]/85 backdrop-blur-md border border-neutral-700/60 rounded-2xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] w-[280px] sm:w-[350px] md:w-[400px] lg:w-[420px] pointer-events-auto transition-all duration-300 hover:border-neutral-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
      {/* 5 Golden Stars */}
      <div className="flex items-center gap-1 mb-4 text-[#F59E0B]">
        {Array.from({ length: card.rating }).map((_, i) => (
          <svg
            key={i}
            className="w-4 h-4 sm:w-5 sm:h-5 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Review Quote Text */}
      <p className="text-sm sm:text-base text-neutral-200 font-normal leading-relaxed mb-6">
        {card.quote}
      </p>

      {/* Author Details */}
      <div className="flex items-center gap-3">
        {/* Avatar Graphic with Gradient Ring */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${
            card.avatarColor || "from-cyan-400 to-blue-600"
          } p-[2px] shadow-sm shrink-0`}
        >
          <div className="w-full h-full rounded-full bg-[#111726] flex items-center justify-center text-xs sm:text-sm font-bold text-white uppercase">
            {card.authorName.charAt(0)}
          </div>
        </div>

        {/* Author Name */}
        <span className="text-sm sm:text-base font-semibold text-white tracking-wide">
          {card.authorName}
        </span>
      </div>
    </div>
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 1024px)").matches;
      const staggerDelay = isMobile ? 1.0 : 0.8;
      const startY = isMobile ? "90vh" : "110vh";
      const endY = isMobile ? "-90vh" : "-110vh";

      const leftCards = gsap.utils.toArray<HTMLElement>(".review-card-left");
      const rightCards = gsap.utils.toArray<HTMLElement>(".review-card-right");

      // Set initial positions below viewport
      gsap.set(leftCards, { y: startY });
      gsap.set(rightCards, { y: startY });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: isMobile ? "+=3000" : "+=4500",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Animate left cards upward
      leftCards.forEach((card, i) => {
        const delay = i * staggerDelay;
        tl.to(
          card,
          {
            y: endY,
            duration: 2.2,
            ease: "none",
          },
          delay
        );
      });

      // Animate right cards upward (offset stagger)
      rightCards.forEach((card, i) => {
        const delay = i * staggerDelay + (isMobile ? staggerDelay / 2 : 0.4);
        tl.to(
          card,
          {
            y: endY,
            duration: 2.2,
            ease: "none",
          },
          delay
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="reviews-section"
      className={`relative w-full bg-transparent select-none ${matter.className}`}
    >
      <div
        ref={containerRef}
        className="h-screen w-full flex flex-col items-center justify-center overflow-hidden relative"
      >
        {/* Background Ambient Spotlights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Pinned Title Layer (Fixed in Center during scroll) */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
          <div className="z-10 space-y-1">
            <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-[5.625rem] font-bold tracking-tight text-[#E5A823] leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              16,000
            </h2>
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.735rem] font-bold tracking-tight text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              Reviews Can&apos;t Be Wrong
            </h2>
          </div>
        </div>

        {/* Floating / Scrolling Review Cards Layer */}
        <div className="absolute inset-0 z-10 w-full  flex justify-between h-full pointer-events-none px-4 sm:px-2">
          {/* Left Column of Floating Cards */}
          <div className="w-full lg:w-1/2 absolute inset-y-0 left-0 h-full">
            {leftReviews.map((card, i) => (
              <div
                key={`rev-left-${card.id}-${i}`}
                className="review-card-left absolute inset-0 flex items-center justify-start lg:justify-end pl-2 sm:pl-6 lg:pl-0 lg:pr-16 lg:-mt-[22vh] pointer-events-none"
              >
                <ReviewCard card={card} />
              </div>
            ))}
          </div>

          {/* Right Column of Floating Cards */}
          <div className="w-full lg:w-1/2 absolute inset-y-0 right-0 h-full">
            {rightReviews.map((card, i) => (
              <div
                key={`rev-right-${card.id}-${i}`}
                className="review-card-right absolute inset-0 flex items-center justify-end lg:justify-start pr-2 sm:pr-6 lg:pr-0 lg:pl-16 lg:mt-[22vh] pointer-events-none"
              >
                <ReviewCard card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
