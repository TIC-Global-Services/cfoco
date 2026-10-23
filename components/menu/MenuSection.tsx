"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";
import menuData from "@/public/menu_data.json";
import { MenuItem, MenuCategory } from "@/sanity/lib/menu";
import { MenuItemModal } from "./MenuItemModal";

interface CategoryItem {
  id: string;
  name: string;
  icon?: string | React.ReactNode;
}

// Fallback JSON data
const defaultItems: MenuItem[] = (menuData.items as unknown) as MenuItem[];

const categoryIcons: Record<string, string> = {
  poulet: "/cfc_bucket.png",
  burgers: "/category/burger.png",
  "riz-box": "/category/riz-box.png",
  tacos: "/category/tacos.png",
  wraps: "/category/wraps.png",
  desserts: "/category/dessert.png",
  sides: "/category/sides.png",
};

const defaultCategories: CategoryItem[] = (menuData.categories as { id: string; name: string }[]).map(
  (cat) => ({
    id: cat.id,
    name: cat.name,
    icon: categoryIcons[cat.id] || "/cfc_bucket.png",
  })
);

const ITEMS_PER_PAGE = 8;

interface MenuSectionProps {
  categories?: MenuCategory[];
  initialItems?: MenuItem[];
}

const MenuSection: React.FC<MenuSectionProps> = ({
  categories: dynamicCategories,
  initialItems = defaultItems,
}) => {
  // Normalize categories from Sanity or fallback
  const resolvedCategories: CategoryItem[] =
    dynamicCategories && dynamicCategories.length > 0
      ? dynamicCategories.map((c) => ({
          id: c.slug || c.id,
          name: c.name,
          icon: c.icon || categoryIcons[c.slug || c.id] || "/cfc_bucket.png",
        }))
      : defaultCategories;

  const allItems = initialItems && initialItems.length > 0 ? initialItems : defaultItems;

  const [activeCategory, setActiveCategory] = useState<string>(
    resolvedCategories[0]?.id ?? "poulet"
  );
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check if item has modal/cardData configured in CMS
  const hasModalDetails = (item: MenuItem): boolean => {
    const cd = item.cardData;
    return Boolean(
      (cd?.detailedDescription && cd.detailedDescription.trim().length > 0) ||
      (cd?.includes && cd.includes.length > 0) ||
      (cd?.gallery && cd.gallery.length > 0) ||
      (cd?.highlights && cd.highlights.length > 0) ||
      (item.detailedDescription && item.detailedDescription.trim().length > 0) ||
      (item.includes && item.includes.length > 0) ||
      (item.gallery && item.gallery.length > 0) ||
      (item.highlights && item.highlights.length > 0)
    );
  };

  // Sync activeCategory if categories change
  useEffect(() => {
    if (resolvedCategories.length > 0 && !resolvedCategories.some((c) => c.id === activeCategory)) {
      setActiveCategory(resolvedCategories[0].id);
    }
  }, [resolvedCategories, activeCategory]);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
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

  // Match items by category slug or name (case-insensitive for non-technical client ease)
  const filtered = allItems.filter((item) => {
    const itemCat = (item.category || "").toLowerCase().trim();
    const activeCat = (activeCategory || "").toLowerCase().trim();
    return itemCat === activeCat;
  });

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
      className={`relative w-full px-4 sm:px-6 lg:px-[0%] pb-20 select-none ${matter.className}`}
    >
      {/* Category Navigation Bar - Scrollable with Dynamic Arrows */}
      <div className="relative w-full mb-10 sm:mb-16 group/nav">
        {/* Left Edge Gradient Fade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-12 sm:w-40 bg-gradient-to-r from-white via-white/5 blur-[5px] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Left Arrow Button */}
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
          className="w-full flex items-end overflow-x-auto py-6 gap-6 sm:gap-8 md:gap-12 px-[0%] scroll-smooth"
          style={{
            scrollSnapType: "x mandatory",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {resolvedCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const iconSrc = typeof cat.icon === "string" ? cat.icon : "/cfc_bucket.png";

            return (
              <button
                key={cat.id}
                onClick={(e) => handleCategoryChange(cat.id, e)}
                style={{ scrollSnapAlign: "center" }}
                className="relative flex flex-col items-center justify-end group flex-shrink-0 focus:outline-none transition-all duration-300 w-[120px] sm:w-[15vw] md:w-[15vw] cursor-pointer pb-2"
              >
                <div
                  className={`flex items-center justify-center w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px] transition-all duration-300 ${
                    isActive
                      ? "grayscale-0 opacity-100 scale-110 drop-shadow-xl"
                      : "grayscale opacity-55 contrast-125 group-hover:grayscale-0 group-hover:opacity-90 group-hover:scale-105"
                  }`}
                >
                  <Image
                    src={iconSrc}
                    alt={cat.name}
                    width={140}
                    height={140}
                    className="object-contain drop-shadow-md w-full h-full"
                  />
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
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
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
          className={`absolute right-0 top-2 bottom-0 h-70 w-12 sm:w-40 bg-gradient-to-l blur-[10px] from-white via-white/5 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
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
          <p className="text-sm mt-1 opacity-70">Add items to this category in Sanity Studio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-6 px-[5%]">
          {visible.map((item) => {
            const hasDetails = hasModalDetails(item);
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (hasDetails) {
                    setSelectedItem(item);
                  }
                }}
                className={`group relative rounded-3xl p-6 sm:p-7 bg-white/10 hover:bg-white/30 backdrop-blur-xs border-2 border-white/10 hover:border-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 overflow-hidden ${
                  hasDetails ? "cursor-pointer" : ""
                }`}
              >
                {/* Ambient Card Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/5 opacity-60 pointer-events-none rounded-3xl" />

                {/* Badge if present */}
                {(item.badge || item.isBestSeller) && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/90 text-[#CC1518] text-xs font-bold shadow-sm border border-neutral-100">
                    {item.badge || "🔥 Best Selling"}
                  </div>
                )}

                {/* Food Image Container */}
                <div className="relative w-full aspect-square max-h-64 sm:max-h-[35dvh] mx-auto flex items-center justify-center mb-6 overflow-hidden rounded-2xl">
                  <Image
                    src={item.image || "/cfc_bucket.png"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content info */}
                <div className="relative z-10 flex flex-col">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#CC1518] tracking-tight group-hover:text-[#B01215] transition-colors">
                      {item.title}
                    </h3>
                    {item.price && (
                      <span className="text-lg sm:text-xl font-extrabold text-neutral-800 shrink-0">
                        {item.price}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm sm:text-lg font-medium text-neutral-700/90 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
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

      {/* Pop-up detail modal (only rendered/opened if an item with modal cardData is clicked) */}
      <MenuItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
};

export default MenuSection;
