"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";
import menuData from "@/public/menu_data.json";
import { MenuItem, MenuCategory } from "@/sanity/lib/menu";
import { MenuItemModal } from "./MenuItemModal";
import { useTranslation } from "react-i18next";
import { getLocalized, LocalizedValue } from "@/sanity/lib/localized";

interface CategoryItem {
  id: string;
  name: LocalizedValue<string>;
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
  const { t, i18n } = useTranslation("menu");
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
    const desc = cd?.detailedDescription || item.detailedDescription;
    const hasDetailedDesc = Boolean(
      typeof desc === "string" ? desc.trim().length > 0 : desc && (desc.en?.trim() || desc.fr?.trim())
    );
    return Boolean(
      hasDetailedDesc ||
      (cd?.includes && cd.includes.length > 0) ||
      (cd?.gallery && cd.gallery.length > 0) ||
      (cd?.highlights && cd.highlights.length > 0) ||
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

    const container = scrollRef.current;
    const btn = event?.currentTarget;
    if (container && btn) {
      const targetScroll =
        btn.offsetLeft - container.clientWidth / 2 + btn.offsetWidth / 2;
      container.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  return (
    <section
      className={`relative w-full px-4 sm:px-6 lg:px-[0%] pb-20 select-none ${matter.className}`}
    >
      {/* Category Navigation Bar - Scrollable with Dynamic Arrows */}
      <div className="relative w-full mb-8 sm:mb-14 group/nav">
        {/* Left Edge Gradient Fade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-24 bg-gradient-to-r from-white/95 via-white/50 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Left Arrow Button */}
        <button
          onClick={() => {
            scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" });
          }}
          disabled={!canScrollLeft}
          aria-label={t("section.scrollLeft", "Scroll categories left")}
          className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-neutral-800 hover:text-[#CC1518] shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_25px_rgba(204,21,24,0.2)] border border-neutral-200/80 backdrop-blur-md transition-all duration-300 cursor-pointer ${
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
          className="w-full flex items-end overflow-x-auto py-6 sm:py-8 gap-4 sm:gap-6 md:gap-8 px-6 sm:px-12 md:px-16 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {resolvedCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const iconSrc = typeof cat.icon === "string" ? cat.icon : "/cfc_bucket.png";
            const catKey = cat.id.toLowerCase();
            const rawCatName = getLocalized(cat.name, i18n.language);
            const displayName = t(`categories.${catKey}`, { defaultValue: rawCatName });

            return (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => handleCategoryChange(cat.id, e)}
                className="relative flex flex-col items-center justify-end group shrink-0 flex-none appearance-none bg-transparent border-0 p-0 focus:outline-none transition-all duration-300 w-28 sm:w-36 md:w-44 lg:w-48 cursor-pointer pb-2"
              >
                <div
                  className={`flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 transition-all duration-300 ${
                    isActive
                      ? "grayscale-0 opacity-100 scale-105 sm:scale-110 drop-shadow-xl"
                      : "grayscale opacity-55 contrast-125 group-hover:grayscale-0 group-hover:opacity-90 group-hover:scale-105"
                  }`}
                >
                  <Image
                    src={iconSrc}
                    alt={displayName}
                    width={160}
                    height={160}
                    priority={isActive}
                    draggable={false}
                    className="object-contain drop-shadow-md w-full h-full pointer-events-none select-none"
                  />
                </div>
                <span
                  className={`mt-3 sm:mt-4 text-xs sm:text-base md:text-lg lg:text-xl transition-all duration-200 tracking-tight text-center max-w-full px-1 truncate ${
                    isActive
                      ? "font-extrabold text-neutral-900"
                      : "font-medium text-neutral-500 group-hover:text-neutral-900"
                  }`}
                >
                  {displayName}
                </span>
                {/* Active category indicator */}
                <div
                  className={`mt-1.5 h-1 rounded-full transition-all duration-300 ${
                    isActive ? "w-8 bg-[#CC1518]" : "w-0 bg-transparent"
                  }`}
                />
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
          aria-label={t("section.scrollRight", "Scroll categories right")}
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-neutral-800 hover:text-[#CC1518] shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_25px_rgba(204,21,24,0.2)] border border-neutral-200/80 backdrop-blur-md transition-all duration-300 cursor-pointer ${
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
          className={`absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-24 bg-gradient-to-l from-white/95 via-white/50 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
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
          <p className="text-lg font-medium">{t("section.emptyTitle", "No items yet for this category.")}</p>
          <p className="text-sm mt-1 opacity-70">{t("section.emptySubtitle", "Add items to this category in Sanity Studio.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:px-[5%]">
          {visible.map((item) => {
            const hasDetails = hasModalDetails(item);
            const itemTitle = getLocalized(item.title, i18n.language);
            const itemDesc = item.description ? getLocalized(item.description, i18n.language) : "";
            const itemBadge = item.badge ? getLocalized(item.badge, i18n.language) : null;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (hasDetails) {
                    setSelectedItem(item);
                  }
                }}
                className={`group relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 lg:p-7 bg-white/15 hover:bg-white/30 backdrop-blur-sm border-2 border-white/20 hover:border-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 overflow-hidden ${
                  hasDetails ? "cursor-pointer" : ""
                }`}
              >
                {/* Ambient Card Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/5 opacity-60 pointer-events-none rounded-2xl sm:rounded-3xl" />

                {/* Badge if present */}
                {(itemBadge || item.isBestSeller) && (
                  <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-10 px-2.5 sm:px-3 py-1 rounded-full bg-white/95 text-[#CC1518] text-[9px] sm:text-[10px] md:text-xs font-bold shadow-sm border border-neutral-100">
                    {itemBadge || t("section.bestSelling", "🔥 Best Selling")}
                  </div>
                )}

                {/* Food Image Container - Stable height for Safari */}
                <div className="relative w-full h-36 sm:h-48 md:h-56 mx-auto flex items-center justify-center mb-3 sm:mb-4 md:mb-6 overflow-hidden rounded-xl sm:rounded-2xl shrink-0">
                  <Image
                    src={item.image || "/cfc_bucket.png"}
                    alt={itemTitle}
                    fill
                    draggable={false}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                  />
                </div>

                {/* Content info */}
                <div className="relative z-10 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2">
                      <h3 className="text-sm sm:text-xl md:text-2xl font-bold text-[#CC1518] tracking-tight group-hover:text-[#B01215] transition-colors leading-tight">
                        {itemTitle}
                      </h3>
                      {item.price && (
                        <span className="text-sm sm:text-lg md:text-xl font-extrabold text-neutral-900 shrink-0">
                          {item.price}
                        </span>
                      )}
                    </div>
                    {itemDesc && (
                      <p className="mt-1 text-[11px] sm:text-sm md:text-base font-medium text-neutral-700/90 leading-tight md:leading-snug line-clamp-2 sm:line-clamp-3">
                        {itemDesc}
                      </p>
                    )}
                  </div>
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
            className="group flex items-center gap-2 px-8 py-3.5 cursor-pointer  rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/40 hover:border-white/70 text-neutral-900 font-semibold text-base sm:text-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
          >
            <span>
              {t("section.viewMore", {
                count: filtered.length - visibleCount,
                defaultValue: `View More (${filtered.length - visibleCount} remaining)`,
              })}
            </span>
            <span className="text-lg transition-transform duration-300 group-hover:translate-y-1">&darr;</span>
          </button>
        ) : filtered.length > ITEMS_PER_PAGE ? (
          <button
            type="button"
            onClick={() => setVisibleCount(ITEMS_PER_PAGE)}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/40 hover:border-white/70 text-neutral-900 font-semibold text-base sm:text-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
          >
            <span>{t("section.showLess", "Show Less")}</span>
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
