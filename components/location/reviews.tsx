"use client";

import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { matter } from "@/font/fonts";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

/** useLayoutEffect on the client, useEffect during SSR (avoids Next.js warning) */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
    // NOTE: no `will-change` here — GSAP sets/clears it on the animated wrapper.
    // A permanent will-change on many nodes eats GPU memory on iOS.
    <div className="relative overflow-hidden bg-[#1a1d2be6] border border-[#0000001A] rounded-[30px] py-10 px-5 sm:p-6 lg:p-10 shadow-[0_8px_24px_rgba(0,0,0,0.4)] w-[272px] xs:w-[250px] sm:w-[320px] md:w-[380px] lg:w-[420px] pointer-events-auto">
      <div className="flex items-center mb-6 sm:mb-4 text-[#FFBB00]">
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

      <div className="relative flex items-center gap-2.5 sm:gap-3 pt-2">
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

  // Viewport height is LOCKED in JS instead of using 100dvh.
  // On iOS/Android the browser chrome collapses while scrolling; 100dvh then
  // re-lays-out the pinned box every frame, which is the up/down "shake".
  const [lockedVh, setLockedVh] = useState<number | null>(null);

  useIsoLayoutEffect(() => {
    let lastWidth = window.innerWidth;
    setLockedVh(window.innerHeight);

    const onResize = () => {
      // Height-only changes = address-bar show/hide. Ignore them completely.
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      setLockedVh(window.innerHeight);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useIsoLayoutEffect(() => {
    if (lockedVh === null) return;

    const isTouch = ScrollTrigger.isTouch === 1;

    // Do not recalc on mobile toolbar resize.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // The official GSAP fix for iOS Safari pin jitter: ScrollTrigger takes over
    // touch scrolling so the address bar can't fight the pinned element.
    // Remove this line if you also run Lenis / Locomotive smooth scroll.
    if (isTouch) ScrollTrigger.normalizeScroll(true);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      const buildScrollTimeline = (
        leftCards: HTMLElement[],
        rightCards: HTMLElement[],
        scrollDistance: number,
        cardDuration: number,
        staggerStep: number,
        scrubSpeed: number | boolean
      ) => {
        const all = [...leftCards, ...rightCards];
        const travel = Math.max(lockedVh * 1.15, 800);

        // autoAlpha only (opacity + visibility) — never tween opacity and
        // autoAlpha on the same target, they overwrite each other.
        gsap.set(all, {
          y: travel,
          autoAlpha: 0,
          force3D: true,
          willChange: "transform, opacity",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            pin: containerRef.current,
            start: "top top",
            end: `+=${scrollDistance}`,
            scrub: scrubSpeed,
            pinSpacing: true,
            anticipatePin: 1, // kills the one-frame jump at pin start
            // "transform" avoids position:fixed, which is what stutters on iOS
            pinType: isTouch ? "transform" : "fixed",
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        });

        const addCard = (el: HTMLElement, at: number) => {
          tl.fromTo(
            el,
            { y: travel },
            { y: -travel, duration: cardDuration, ease: "none", force3D: true },
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
          if (leftCards[i]) addCard(leftCards[i], i * staggerStep);
          if (rightCards[i])
            addCard(rightCards[i], i * staggerStep + staggerStep * 0.5);
        }
      };

      const collect = () => ({
        left: gsap.utils.toArray<HTMLElement>(".review-card-left"),
        right: gsap.utils.toArray<HTMLElement>(".review-card-right"),
      });

      // ── Touch / small screens ──
      mm.add("(max-width: 1024px)", () => {
        const { left, right } = collect();
        // scrub:true (no smoothing lag) feels far steadier under momentum scroll
        buildScrollTimeline(left, right, 1900, 2.2, 0.7, true);
      });

      // ── Desktop ──
      mm.add("(min-width: 1025px)", () => {
        const { left, right } = collect();
        buildScrollTimeline(left, right, 3000, 2.4, 0.8, 0.6);
      });
    }, sectionRef);

    // Late-loading fonts/images shift layout → recalc once everything settles.
    const refreshAfterLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshAfterLoad);
    if (typeof document !== "undefined" && "fonts" in document) {
      (document as Document).fonts.ready.then(refreshAfterLoad);
    }

    return () => {
      window.removeEventListener("load", refreshAfterLoad);
      if (isTouch) ScrollTrigger.normalizeScroll(false);
      ctx.revert();
    };
  }, [lockedVh]);

  return (
    <section
      ref={sectionRef}
      id="reviews-section"
      // IMPORTANT: no `overflow-hidden` here. An ancestor with overflow:hidden
      // (or a transform/filter) breaks position:fixed pinning in Safari.
      className={`relative w-full bg-transparent select-none ${matter.className}`}
    >
      <div
        ref={containerRef}
        style={{ height: lockedVh ? `${lockedVh}px` : undefined }}
        className="h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden relative px-0 sm:px-[5%]"
      >
        {/* Ambient glows — radial gradients instead of blur(150px).
            Huge blur filters are the single biggest jank source on iOS. */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0) 70%)",
          }}
        />
        <div
          className="absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0) 70%)",
          }}
        />

        {/* Centered title layer */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center select-none">
          <div className="z-10 space-y-1">
            <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-[5.625rem] font-bold tracking-tight text-[#E5A823] leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              16,000
            </h2>
            <h2 className="text-2xl sm:text-5xl md:text-6xl lg:text-[4.735rem] font-bold tracking-tight text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              Reviews Can&apos;t Be Wrong
            </h2>
          </div>
        </div>

        {/* Floating cards layer */}
        <div className="absolute inset-0 z-10 w-full flex justify-between h-full pointer-events-none px-2 sm:px-4">
          <div className="w-full lg:w-1/2 absolute inset-y-0 left-0 h-full pointer-events-none">
            {leftReviews.map((card, i) => (
              <div
                key={`rev-left-${card.id}-${i}`}
                className="review-card-left absolute inset-0 flex items-center justify-start lg:justify-end pl-3 xs:pl-4 sm:pl-6 lg:pl-0 lg:pr-16 pointer-events-none invisible"
              >
                <div className="pointer-events-auto">
                  <ReviewCard card={card} />
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/2 absolute inset-y-0 right-0 h-full pointer-events-none">
            {rightReviews.map((card, i) => (
              <div
                key={`rev-right-${card.id}-${i}`}
                className="review-card-right absolute inset-0 flex items-center justify-end lg:justify-start pr-3 xs:pr-4 sm:pr-6 lg:pr-0 lg:pl-16 pointer-events-none invisible"
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