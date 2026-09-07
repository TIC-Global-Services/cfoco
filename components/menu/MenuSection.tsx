"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";
import menuData from "@/public/menu_data.json";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface MenuItem {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  categoryName: string;
}

// Cast the JSON data
const allItems: MenuItem[] = menuData.items as MenuItem[];

const categoryIcons: Record<string, React.ReactNode> = {
  poulet: (
    <div className="flex items-center justify-center w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px]">
      <Image
        src="/cfc_bucket.png"
        alt="Poulet"
        width={140}
        height={140}
        className="object-contain drop-shadow-md w-full h-full"
      />
    </div>
  ),
  burgers: (
    <div className="flex items-center justify-center w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px]">
      <Image
        src="/category/burger.png"
        alt="Burgers"
        width={140}
        height={140}
        className="object-contain drop-shadow-md w-full h-full"
      />
    </div>
  ),
  "riz-box": (
    <div className="flex items-center justify-center w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px]">
      <Image
        src="/category/riz-box.png"
        alt="Riz Box"
        width={140}
        height={140}
        className="object-contain drop-shadow-md w-full h-full"
      />
    </div>
  ),
  tacos: (
    <div className="flex items-center justify-center w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px]">
      <Image
        src="/category/tacos.png"
        alt="Tacos"
        width={140}
        height={140}
        className="object-contain drop-shadow-md w-full h-full"
      />
    </div>
  ),
  wraps: (
    <div className="flex items-center justify-center w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px]">
      <Image
        src="/category/wraps.png"
        alt="Wraps"
        width={140}
        height={140}
        className="object-contain drop-shadow-md w-full h-full"
      />
    </div>
  ),
  desserts: (
    <div className="flex items-center justify-center w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px]">
      <Image
        src="/category/dessert.png"
        alt="Desserts"
        width={140}
        height={140}
        className="object-contain drop-shadow-md w-full h-full"
      />
    </div>
  ),
  sides: (
    <div className="flex items-center justify-center w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px]">
      <Image
        src="/category/sides.png"
        alt="Sides"
        width={140}
        height={140}
        className="object-contain drop-shadow-md w-full h-full"
      />
    </div>
  ),
};

// Build categories array in display order from JSON
const categories: Category[] = (menuData.categories as { id: string; name: string }[]).map(
  (cat) => ({
    id: cat.id,
    name: cat.name,
    icon: categoryIcons[cat.id] ?? null,
  })
);

const ITEMS_PER_PAGE = 8;

const MenuSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "poulet");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Allow a small buffer of 6px to avoid jitter
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    const ro = new ResizeObserver(() => {
      checkScroll();
    });
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const filtered = allItems.filter((item) => item.category === activeCategory);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleCategoryChange = (
    catId: string,
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    setActiveCategory(catId);
    setVisibleCount(ITEMS_PER_PAGE);

    if (event?.currentTarget) {
      event.currentTarget.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  return (
    <section
      className={`relative w-full px-4 sm:px-6 lg:px-[3%] pb-20 select-none ${matter.className}`}
    >
      {/* Category Navigation Bar - Scrollable with Smart Dynamic Arrows */}
      <div className="relative w-full mb-10 sm:mb-16 group/nav">
        {/* Left Edge Gradient Fade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-12 sm:w-40 bg-gradient-to-r from-white via-white/5 blur-[5px] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Left Arrow Button - only visible when scrolled right */}
        <button
          onClick={() => {
            scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" });
          }}
          disabled={!canScrollLeft}
          aria-label="Scroll categories left"
          className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-neutral-800 hover:text-[#CC1518] shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_25px_rgba(204,21,24,0.2)] border border-neutral-200/80 backdrop-blur-md transition-all duration-300 cursor-pointer ${
            canScrollLeft
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-75 pointer-events-none"
          }`}
        >
          <svg className="w-5 h-5 stroke-[2.4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Scrollable Categories Strip */}
        <div
          ref={scrollRef}
          className="w-full flex items-end overflow-x-auto py-6 gap-6 sm:gap-8 md:gap-12 px-[20%]scroll-smooth"
          style={{
            scrollSnapType: "x mandatory",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={(e) => handleCategoryChange(cat.id, e)}
                style={{ scrollSnapAlign: "center" }}
                className="relative flex flex-col items-center justify-end group flex-shrink-0 focus:outline-none transition-all duration-300 w-[120px] sm:w-[150px] md:w-[170px] cursor-pointer pb-2"
              >
                <div
                  className={`flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "grayscale-0 opacity-100 scale-110 drop-shadow-xl"
                      : "grayscale opacity-55 contrast-125 group-hover:grayscale-0 group-hover:opacity-90 group-hover:scale-105"
                  }`}
                >
                  {cat.icon}
                </div>
                <span
                  className={`mt-4 text-base sm:text-lg md:text-xl lg:text-2xl transition-all duration-200 tracking-tight text-center whitespace-nowrap ${
                    isActive
                      ? "font-extrabold text-neutral-900"
                      : "font-medium text-neutral-500 group-hover:text-neutral-900"
                  }`}
                >
                  {cat.name}
                </span>

                {/* Subtle Active Indicator Dot / Pill */}
                {/* <div
                  className={`mt-2 h-1 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 bg-[#CC1518] shadow-[0_0_8px_rgba(204,21,24,0.5)]"
                      : "w-0 bg-transparent"
                  }`}
                /> */}
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button - only visible when more content exists to the right */}
        <button
          onClick={() => {
            scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" });
          }}
          disabled={!canScrollRight}
          aria-label="Scroll categories right"
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-neutral-800 hover:text-[#CC1518] shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_25px_rgba(204,21,24,0.2)] border border-neutral-200/80 backdrop-blur-md transition-all duration-300 cursor-pointer ${
            canScrollRight
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-75 pointer-events-none"
          }`}
        >
          <svg className="w-5 h-5 stroke-[2.4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Right Edge Gradient Fade */}
        <div
          className={`absolute right-0 top-2 bottom-0 h-50 w-12 sm:w-40 bg-gradient-to-l blur-[5px] from-white via-white/5 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Menu Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
          <svg className="w-20 h-20 mb-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-lg font-medium">No items yet for this category.</p>
          <p className="text-sm mt-1 opacity-70">Run <code className="bg-white/30 px-1 rounded">python remover.py</code> to process images.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-6 px-[5%]">
          {visible.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl p-6 sm:p-7 bg-white/10 hover:bg-white/30 backdrop-blur-xs border-2 border-white/10 hover:border-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer overflow-hidden"
            >
              {/* Ambient Card Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/5 opacity-60 pointer-events-none rounded-3xl" />

              {/* Food Image Container */}
              <div className="relative w-full aspect-square max-h-64 sm:max-h-[35dvh] mx-auto flex items-center justify-center mb-6 overflow-hidden rounded-2xl">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content info */}
              <div className="relative z-10 flex flex-col">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#CC1518] tracking-tight group-hover:text-[#B01215] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm sm:text-lg font-medium text-neutral-700/90 leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All / Load More Button */}
      <div className="mt-12 sm:mt-16 flex justify-center items-center">
        {hasMore ? (
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/40 hover:border-white/70 text-neutral-900 font-semibold text-base sm:text-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
          >
            <span>View More ({filtered.length - visibleCount} remaining)</span>
            <span className="text-lg transition-transform duration-300 group-hover:translate-y-1">&darr;</span>
          </button>
        ) : filtered.length > ITEMS_PER_PAGE ? (
          <button
            type="button"
            onClick={() => setVisibleCount(ITEMS_PER_PAGE)}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/40 hover:border-white/70 text-neutral-900 font-semibold text-base sm:text-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
          >
            <span>Show Less</span>
            <span className="text-lg transition-transform duration-300 group-hover:-translate-y-1">&uarr;</span>
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default MenuSection;
