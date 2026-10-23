"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MenuItem } from "@/sanity/lib/menu";
import { X, Flame, Leaf, UtensilsCrossed } from "lucide-react";

interface MenuItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({ item, onClose }) => {
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (item) {
      setActiveImage(item.image || "/cfc_bucket.png");
      // Prevent background scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [item]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const cardData = item.cardData || {};
  const detailedText = cardData.detailedDescription || item.detailedDescription || item.description;

  const rawGallery = (cardData.gallery && cardData.gallery.length > 0) ? cardData.gallery : (item.gallery || []);
  const galleryItems = [
    { image: item.image, alt: item.title },
    ...rawGallery
      .map((g) => ({
        image: g.image || g.imageUrl || "",
        alt: g.alt || item.title,
      }))
      .filter((g) => Boolean(g.image)),
  ];

  const includesList = (cardData.includes && cardData.includes.length > 0)
    ? cardData.includes
    : (item.includes || []);

  const includesTitle = cardData.includesTitle || item.includesTitle || (item.category === "poulet" ? "Whats In Your Bucket?" : "Combo Includes");

  const highlightsList = (cardData.highlights && cardData.highlights.length > 0)
    ? cardData.highlights
    : (item.highlights || []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/70 backdrop-blur-md transition-all duration-300"
      style={{
        animation: "modal-bg-in 0.25s ease-out forwards",
      }}
    >
      <style>{`
        @keyframes modal-bg-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-card-in {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#dfd6d1] border border-white/50 shadow-[0_24px_70px_rgba(0,0,0,0.4)] rounded-[28px] sm:rounded-[36px] overflow-hidden flex flex-col md:flex-row transition-all duration-300 max-h-[92vh] overflow-y-auto md:overflow-hidden"
        style={{
          animation: "modal-card-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* ================= LEFT SIDE: Food Visuals & Gallery ================= */}
        <div className="w-full md:w-[48%] p-6 sm:p-8 flex flex-col justify-between relative bg-gradient-to-b from-[#e3dad5] to-[#d8cec8]">
          {/* Top-Left Badge */}
          {item.badge && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#CC1518] text-xs sm:text-sm font-bold shadow-sm border border-neutral-100 self-start">
              <Flame className="w-4 h-4 fill-[#CC1518] text-[#CC1518]" />
              <span>{item.badge}</span>
            </div>
          )}

          {/* Main Hero Food Image */}
          <div className="relative w-full h-[220px] sm:h-[280px] md:h-[310px] my-4 flex items-center justify-center">
            <div className="relative w-full h-full max-w-[280px] sm:max-w-[320px]">
              <Image
                src={activeImage || item.image || "/cfc_bucket.png"}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.22)] transition-all duration-300"
                priority
              />
            </div>
          </div>

          {/* Bottom Thumbnails (Only show if multiple images exist) */}
          {galleryItems.length > 1 && (
            <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-1 mt-2">
              {galleryItems.map((thumb, idx) => {
                const isSelected = activeImage === thumb.image;
                return (
                  <button
                    type="button"
                    key={`thumb-${idx}`}
                    onClick={() => thumb.image && setActiveImage(thumb.image)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl p-1 bg-white/40 transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                      isSelected
                        ? "border-2 border-[#CC1518] shadow-md scale-105 bg-white/80"
                        : "border border-white/60 hover:border-white/90 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="relative w-full h-full">
                      {thumb.image && (
                        <Image
                          src={thumb.image}
                          alt={thumb.alt || `thumbnail ${idx + 1}`}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDE: Product Info & Included Items ================= */}
        <div className="w-full md:w-[52%] bg-white rounded-t-[28px] md:rounded-t-none md:rounded-l-[32px] p-6 sm:p-8 flex flex-col justify-between relative shadow-[-12px_0_30px_rgba(0,0,0,0.03)]">
          <div>
            {/* Top Bar with Category & Close Button */}
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-neutral-400 capitalize tracking-wide">
                {item.categoryName || item.category}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Title & Red Subtitle */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#CC1518] tracking-tight leading-tight mt-3">
              {item.title}
            </h2>

            {detailedText && (
              <p className="mt-2 text-sm sm:text-base font-medium text-[#CC1518] leading-relaxed">
                {detailedText}
              </p>
            )}

            {/* Included Items Container (Only if included items are configured in CMS) */}
            {includesList.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h3 className="text-sm sm:text-base font-bold text-neutral-800 mb-3">
                  {includesTitle}
                </h3>

                <div className={`rounded-2xl bg-neutral-50/90 border border-neutral-100 p-3 sm:p-4 grid gap-3 ${
                  includesList.length === 1
                    ? "grid-cols-1"
                    : includesList.length === 2
                    ? "grid-cols-2 divide-x divide-neutral-200/60"
                    : "grid-cols-3 divide-x divide-neutral-200/60"
                }`}>
                  {includesList.map((inc, i) => {
                    const incImage = inc.image || inc.imageUrl;
                    return (
                      <div key={i} className="flex flex-col items-center text-center px-1.5 sm:px-2">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 mb-2">
                          {incImage && (
                            <Image
                              src={incImage}
                              alt={inc.name}
                              fill
                              sizes="60px"
                              className="object-contain"
                            />
                          )}
                        </div>
                        <span className="text-[11px] sm:text-xs font-semibold text-neutral-800 leading-tight">
                          {inc.name}
                        </span>
                        {inc.quantity && (
                          <span className="text-[10px] sm:text-[11px] font-normal text-neutral-500 mt-0.5">
                            {inc.quantity}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quality Highlights Row (Only if highlights configured in CMS) */}
          {highlightsList.length > 0 && (
            <div className={`grid gap-4 pt-6 sm:pt-8 mt-4 border-t border-neutral-100 ${
              highlightsList.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}>
              {highlightsList.map((hl, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="mt-0.5 text-[#CC1518] shrink-0">
                    {hl.icon === "recipe" ? (
                      <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                    ) : (
                      <Leaf className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
                      {hl.title}
                    </span>
                    {hl.subtitle && (
                      <span className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
                        {hl.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
