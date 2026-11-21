"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { matter } from "@/font/fonts";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { getLocalized, LocalizedValue } from "@/sanity/lib/localized";

gsap.registerPlugin(ScrollTrigger);

export interface ReviewCardItem {
  id: string;
  rating: number;
  quote: LocalizedValue<string>;
  authorName: string;
  avatarColor?: string;
}

const defaultLeftReviews: ReviewCardItem[] = [
  {
    id: "rev-1",
    rating: 5,
    quote: {
      en: "“Great meal deals to share, we had the wings & tenders box, super generous and really tasty. Fast and efficient service.”",
      fr: "“Formules intéressantes à partager, on a pris la box wings-tenders c'était pas mal du tout et généreux. Service rapide et efficace.”",
    },
    authorName: "Yousra Djeddou",
    avatarColor: "from-cyan-500 to-blue-600",
  },
  {
    id: "rev-2",
    rating: 5,
    quote: {
      en: "“A very nice, clean restaurant with fast service and a warm welcome. There's an outdoor terrace. The tacos are good and quite generous.”",
      fr: "“Un restaurant très agréable et propre, avec un service rapide et un accueil chaleureux. Belle terrasse extérieure. Les tacos sont très bons et généreux.”",
    },
    authorName: "Arm",
    avatarColor: "from-amber-400 to-orange-500",
  },
  {
    id: "rev-3",
    rating: 5,
    quote: {
      en: "“Crispy buttermilk tenders, house sauces that make all the difference. Top-notch welcome!”",
      fr: "“Des tenders croustillants marinés au babeurre, des sauces maison qui font toute la différence. Accueil au top !”",
    },
    authorName: "Camille Roussel",
    avatarColor: "from-emerald-400 to-teal-600",
  },
];

const defaultRightReviews: ReviewCardItem[] = [
  {
    id: "rev-4",
    rating: 5,
    quote: {
      en: "“Beautiful place!! The tacos were delicious, the music was great, and just for the service!”",
      fr: "“Un endroit magnifique ! Les tacos étaient délicieux, la musique au top, et que dire du service !”",
    },
    authorName: "Med saleck",
    avatarColor: "from-blue-500 to-indigo-600",
  },
  {
    id: "rev-5",
    rating: 5,
    quote: {
      en: "“The staff were very pleasant and smiling, the food was excellent and served quickly, and the music created a great atmosphere. I highly recommend it.”",
      fr: "“Un personnel très agréable et souriant, une cuisine excellente servie rapidement et une musique qui met une super ambiance. Je recommande vivement.”",
    },
    authorName: "Timeo scerri",
    avatarColor: "from-rose-400 to-red-500",
  },
  {
    id: "rev-6",
    rating: 5,
    quote: {
      en: "“A real treat every single visit. The sharing bucket and crispy fries are simply must-haves.”",
      fr: "“Un vrai régal à chaque passage. Le bucket à partager et les frites croustillantes sont tout simplement incontournables.”",
    },
    authorName: "Thomas Dubois",
    avatarColor: "from-purple-500 to-pink-500",
  },
];

export const DEFAULT_AVATAR_GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-rose-400 to-red-500",
  "from-purple-500 to-pink-500",
];

const ReviewCard = ({ card, index = 0 }: { card: ReviewCardItem; index?: number }) => {
  const { i18n } = useTranslation();
  const avatarGradient =
    card.avatarColor ||
    DEFAULT_AVATAR_GRADIENTS[index % DEFAULT_AVATAR_GRADIENTS.length];

  return (
    <div className="relative overflow-hidden bg-[#1a1d2be6] border border-[#0000001A] rounded-[30px] py-10 px-5 sm:p-6 lg:p-10 shadow-[0_8px_24px_rgba(0,0,0,0.4)] w-[292px] xs:w-[250px] sm:w-[320px] md:w-[380px] lg:w-[420px] pointer-events-auto">
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
        {getLocalized(card.quote, i18n.language)}
      </p>

      <div className="relative flex items-center gap-2.5 sm:gap-3 pt-2">
        <div
          className={`w-[50px] h-[50px] sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr ${avatarGradient} p-[2px] shadow-sm shrink-0`}
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
  reviews?: ReviewCardItem[];
  reviewCount?: number | string;
  rating?: number;
  heading?: LocalizedValue<string>;
}

const Reviews = ({
  leftReviews = defaultLeftReviews,
  rightReviews = defaultRightReviews,
  reviews,
  reviewCount,
  heading,
}: ReviewsProps) => {
  const { t, i18n } = useTranslation("about");
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveLeftReviews =
    reviews && reviews.length > 0
      ? reviews.filter((_, i) => i % 2 === 0)
      : leftReviews;
  const effectiveRightReviews =
    reviews && reviews.length > 0
      ? reviews.filter((_, i) => i % 2 === 1)
      : rightReviews;

  const displayCount =
    reviewCount != null
      ? typeof reviewCount === "number"
        ? reviewCount.toLocaleString()
        : reviewCount
      : "11,897";

  // GSAP ScrollTrigger timeline configuration using native CSS position: sticky
  // Completely immune to JavaScript pin latency and layout shifts — keeps the title and viewport rock-solid in the center!
  React.useEffect(() => {
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

        gsap.set(all, {
          y: startY,
          autoAlpha: 0,
          force3D: true,
          willChange: "transform, opacity",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: scrubSpeed,
            invalidateOnRefresh: true,
          },
        });

        // Entrance Breathing Room: title is cleanly presented first before cards glide in
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

      // ── Touch / Small Screens (< 1024px) ──
      mm.add("(max-width: 1024px)", () => {
        const { left, right } = collect();
        buildScrollTimeline(left, right, 2.4, 0.9, 1.2, 0.6);
      });

      // ── Desktop Screens (>= 1025px) ──
      mm.add("(min-width: 1025px)", () => {
        const { left, right } = collect();
        buildScrollTimeline(left, right, 2.4, 1.1, 1.0, 0.6);
      });
    }, sectionRef);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);
    if (typeof document !== "undefined" && "fonts" in document) {
      (document as Document).fonts.ready.then(refresh);
    }

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
  }, [effectiveLeftReviews, effectiveRightReviews]);

  return (
    <section
      ref={sectionRef}
      id="reviews-section"
      className={`relative w-full bg-transparent select-none ${matter.className} h-[380vh] lg:h-[320vh]`}
    >
      {/* Pinned Viewport Container - sticky top-0 ensures it is ALWAYS centered in the viewport */}
      <div
        ref={containerRef}
        className="sticky top-0 h-screen supports-[height:100svh]:h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden relative px-0 sm:px-[5%]"
      >
        {/* Ambient glows */}
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

        {/* Centered title layer - locked rock-solid in screen center */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center select-none">
          <div className="z-10 space-y-1">
            <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-[5.625rem] font-bold tracking-tight text-[#E5A823] leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {displayCount}
            </h2>
            <h2 className="text-2xl sm:text-5xl md:text-6xl lg:text-[4.735rem] font-bold tracking-tight text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {heading ? getLocalized(heading, i18n.language) : t("reviews.headingFallback", "Reviews Can't Be Wrong")}
            </h2>
          </div>
        </div>

        {/* Floating cards layer */}
        <div className="absolute inset-0 z-10 w-full flex justify-between h-full pointer-events-none px-2 sm:px-4">
          <div className="w-full lg:w-1/2 absolute inset-y-0 left-0 h-full pointer-events-none">
            {effectiveLeftReviews.map((card, i) => (
              <div
                key={`rev-left-${card.id}-${i}`}
                className="review-card-left absolute inset-0 flex items-center justify-start lg:justify-end pl-3 xs:pl-4 sm:pl-6 lg:pl-0 lg:pr-16 pointer-events-none invisible"
              >
                <div className="pointer-events-auto">
                  <ReviewCard card={card} index={i * 2} />
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/2 absolute inset-y-0 right-0 h-full pointer-events-none">
            {effectiveRightReviews.map((card, i) => (
              <div
                key={`rev-right-${card.id}-${i}`}
                className="review-card-right absolute inset-0 flex items-center justify-end lg:justify-start pr-3 xs:pr-4 sm:pr-6 lg:pr-0 lg:pl-16 pointer-events-none invisible"
              >
                <div className="pointer-events-auto">
                  <ReviewCard card={card} index={i * 2 + 1} />
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