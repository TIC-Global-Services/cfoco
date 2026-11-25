"use client";

import React from "react";
import Badge, { BadgeVariant } from "./Badge";

export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  badgeVariant?: BadgeVariant;
  align?: "left" | "center" | "right";
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeVariant = "primary",
  align = "center",
  className = "",
}) => {
  const alignClass =
    align === "center"
      ? "items-center text-center mx-auto"
      : align === "right"
      ? "items-end text-right ml-auto"
      : "items-start text-left mr-auto";

  return (
    <div className={`flex flex-col max-w-3xl mb-8 sm:mb-12 md:mb-16 ${alignClass} ${className}`}>
      {badge && (
        <div className="mb-3 sm:mb-4">
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-neutral-300 font-normal leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
