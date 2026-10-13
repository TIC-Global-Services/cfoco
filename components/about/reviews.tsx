"use client";

import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { matter } from "@/font/fonts";
import Image from "next/image";
import dynamic from "next/dynamic";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** useLayoutEffect on the client, useEffect during SSR (avoids Next.js warning) */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const LiquidGlass = dynamic(
  () => import("@liquidglass/react").then((mod) => mod.LiquidGlass),
  { ssr: false }
);

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

const CardContent = ({ card }: { card: ReviewCardItem }) => (
  <div className="w-full flex flex-col text-left">
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

const ReviewCard = ({ card }: { card: ReviewCardItem }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="relative overflow-hidden bg-[#1a1d2be6] backdrop-blur-md border border-white/10 rounded-[24px] sm:rounded-[30px] py-6 px-5 sm:p-6 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-[88vw] max-w-[340px] sm:w-[320px] md:w-[380px] lg:w-[450px] pointer-events-auto">
        <CardContent card={card} />
      </div>
    );
  }

  return (
    <div className="relative w-[88vw] max-w-[340px] sm:w-[320px] md:w-[380px] lg:w-[450px] pointer-events-auto">
      <LiquidGlass
        borderRadius={28}
        blur={12}
        contrast={1.15}
        brightness={1.08}
        saturation={1.15}
        displacementScale={1.2}
        elasticity={0.45}
        shadowIntensity={0.35}
        zIndex={1}
        className="w-full border border-white/15 bg-[#141824b3] py-6 px-5 sm:p-6 lg:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.55)] transition-all duration-300 hover:border-white/25 !items-start !justify-start"
      >
        <CardContent card={card} />
      </LiquidGlass>
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
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger timeline configuration
  // Uses native CSS position:sticky for rock-solid zero-jitter pinning,
  // while GSAP handles the card glide scrub with buttery smooth inertia.
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      const buildScrollTimeline = (
        leftCards: HTMLElement[],
        rightCards: HTMLElement[],
        cardDuration: number,
        staggerStep: number,
        scrubSpeed: number | boolean,
        leadDelay: number = 0.55
      ) => {
        const all = [...leftCards, ...rightCards];
        const startY = "115vh";
        const endY = "-115vh";

        // Pre-position offscreen with autoAlpha 0 (hides and zeroes opacity)
        gsap.set(all, {
          y: startY,
          autoAlpha: 0,
          force3D: true,
          willChange: "transform, opacity",
        });

        // Trigger strictly when the top of the reviews section reaches the top of the viewport.
        // Pinned via native CSS position: sticky to eliminate any 1-frame transform jitter.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: scrubSpeed,
            invalidateOnRefresh: true,
          },
        });

        // 1. Entrance Breathing Room:
        // When section arrives at 'top top' and pins, the title is presented cleanly first.
        // Cards ONLY start floating after this initial cushion!
        tl.to({}, { duration: leadDelay });

        const addCard = (el: HTMLElement, at: number) => {
          tl.fromTo(
            el,
            { y: startY },
            { y: endY, duration: cardDuration, ease: "none", force3D: true },
            at
          )
            .to(
              el,
              { autoAlpha: 1, duration: cardDuration * 0.22, ease: "power1.out" },
              at
            )
            .to(
              el,
              { autoAlpha: 0, duration: cardDuration * 0.22, ease: "power1.in" },
              at + cardDuration * 0.78
            );
        };

        const totalPairs = Math.max(leftCards.length, rightCards.length);
        for (let i = 0; i < totalPairs; i++) {
          if (leftCards[i]) addCard(leftCards[i], leadDelay + i * staggerStep);
          if (rightCards[i])
            addCard(rightCards[i], leadDelay + i * staggerStep + staggerStep * 0.5);
        }

        // Tail buffer: keeps view clean after last card exits before unsticking
        tl.to({}, { duration: 0.35 });
      };

      const collect = () => ({
        left: gsap.utils.toArray<HTMLElement>(".review-card-left"),
        right: gsap.utils.toArray<HTMLElement>(".review-card-right"),
      });

      // ── Touch & Mobile Screens (< 1024px) ──
      // Clean entrance delay (0.55s): title is presented first before any card enters.
      // Tighter stagger (0.72s) ensures continuous flow once cards start.
      // scrub: 1.2 adds dampened inertia so fast flicks glide smoothly.
      mm.add("(max-width: 1024px)", () => {
        const { left, right } = collect();
        buildScrollTimeline(left, right, 2.4, 0.72, 1.2, 0.55);
      });

      // ── Desktop Screens (>= 1025px) ──
      // Clean entrance delay (0.6s) before parallel columns begin floating.
      mm.add("(min-width: 1025px)", () => {
        const { left, right } = collect();
        buildScrollTimeline(left, right, 2.4, 0.85, 1.0, 0.6);
      });
    }, sectionRef);

    // Dynamic layout sync: Recalculate ScrollTrigger once late fonts, images, or 3D canvases settle
    const refresh = () => ScrollTrigger.refresh();

    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);
    if (typeof document !== "undefined" && "fonts" in document) {
      (document as Document).fonts.ready.then(refresh);
    }

    // Refresh after staggered delays to account for dynamic 3D elements loading above
    const timer1 = setTimeout(refresh, 250);
    const timer2 = setTimeout(refresh, 800);
    const timer3 = setTimeout(refresh, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="reviews-section"
      className={`relative w-full bg-transparent select-none ${matter.className} h-[320vh] lg:h-[280vh]`}
    >
      {/* 
        Native CSS Sticky Viewport Container:
        Handled directly on the browser's GPU compositor thread.
        Completely immune to 1-frame JavaScript pin latency — ZERO SHAKING on the center text!
      */}
      <div
        ref={containerRef}
        className="sticky top-0 h-screen supports-[height:100svh]:h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden relative px-0 sm:px-[5%]"
      >
        {/* Ambient glows */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] rounded-full pointer-events-none transform-gpu"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0) 70%)",
          }}
        />
        <div
          className="absolute top-1/3 left-1/4 w-[300px] sm:w-[350px] h-[300px] sm:h-[350px] rounded-full pointer-events-none transform-gpu"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0) 70%)",
          }}
        />

        {/* Centered title layer — GPU composited, rock solid with ZERO shake */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center select-none transform-gpu">
          <div className="space-y-1 transform-gpu">
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
          {/* Left Column (Centered on mobile, aligned left-column on desktop) */}
          <div className="w-full lg:w-1/2 absolute inset-y-0 left-0 h-full pointer-events-none">
            {leftReviews.map((card, i) => (
              <div
                key={`rev-left-${card.id}-${i}`}
                className="review-card-left absolute inset-0 flex items-center justify-center lg:justify-end px-4 lg:px-0 lg:pr-16 pointer-events-none invisible"
              >
                <div className="pointer-events-auto">
                  <ReviewCard card={card} />
                </div>
              </div>
            ))}
          </div>

          {/* Right Column (Centered on mobile, aligned right-column on desktop) */}
          <div className="w-full lg:w-1/2 absolute inset-y-0 right-0 h-full pointer-events-none">
            {rightReviews.map((card, i) => (
              <div
                key={`rev-right-${card.id}-${i}`}
                className="review-card-right absolute inset-0 flex items-center justify-center lg:justify-start px-4 lg:px-0 lg:pl-16 pointer-events-none invisible"
              >
                <div className="pointer-events-auto">
                  <ReviewCard card={card} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;