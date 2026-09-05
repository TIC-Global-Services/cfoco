"use client";

import React, { useState } from "react";
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

// ---------------------------------------------------------------------------
// Category icons (unchanged from original)
// ---------------------------------------------------------------------------
const categoryIcons: Record<string, React.ReactNode> = {
  poulet: (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-44 md:h-24 flex items-center justify-center">
      <Image
        src="/cfc_bucket.png"
        alt="Poulet"
        width={80}
        height={80}
        className="object-cover drop-shadow-md"
      />
    </div>
  ),
  burgers: (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
      <Image
        src="/category/burger.png"
        alt="Burgers"
        width={80}
        height={80}
        className="object-cover drop-shadow-md"
      />
    </div>
  ),
  "riz-box": (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
      <Image
        src="/category/riz-box.png"
        alt="Riz Box"
        width={80}
        height={80}
        className="object-cover drop-shadow-md"
      />
    </div>
  ),
  tacos: (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
      <Image
        src="/category/tacos.png"
        alt="Tacos"
        width={80}
        height={80}
        className="object-cover drop-shadow-md"
      />
    </div>
  ),
  wraps: (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
      <Image
        src="/category/wraps.png"
        alt="Wraps"
        width={80}
        height={80}
        className="object-cover drop-shadow-md"
      />
    </div>
  ),
  desserts: (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
      <Image
        src="/category/dessert.png"
        alt="Desserts"
        width={80}
        height={80}
        className="object-cover drop-shadow-md"
      />
    </div>
  ),
  sides: (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
      <Image
        src="/category/sides.png"
        alt="Sides"
        width={80}
        height={80}
        className="object-cover drop-shadow-md"
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

  const filtered = allItems.filter((item) => item.category === activeCategory);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <section
      className={`relative w-full px-4 sm:px-6 lg:px-[5%] pb-20 select-none ${matter.className}`}
    >
      {/* Category Navigation Bar - Full Width with Active OG Color & Inactive Black and White */}
      <div className="w-full flex items-center justify-between overflow-x-auto no-scrollbar py-6 mb-10 sm:mb-16 gap-3 sm:gap-4 md:gap-6">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className="flex-1 flex flex-col items-center justify-center group flex-shrink-0 sm:flex-shrink focus:outline-none transition-all duration-300 min-w-[70px] sm:min-w-0 cursor-pointer"
            >
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "grayscale-0 opacity-100 scale-110 drop-shadow-md"
                    : "grayscale opacity-50 contrast-125 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                }`}
              >
                {cat.icon}
              </div>
              <span
                className={`mt-3 text-sm sm:text-base md:text-lg transition-all duration-200 tracking-tight text-center ${
                  isActive
                    ? "font-bold text-neutral-900"
                    : "font-normal text-neutral-500 group-hover:text-neutral-900"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-6">
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
                <h3 className="text-2xl sm:text-[2.2rem] font-bold text-[#CC1518] tracking-tight group-hover:text-[#B01215] transition-colors">
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
