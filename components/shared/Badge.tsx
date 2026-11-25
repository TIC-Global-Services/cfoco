"use client";

import React from "react";

export type BadgeVariant = "primary" | "secondary" | "accent" | "dark" | "outline";

export interface BadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-white/95 text-[#CC1518] border-neutral-100 shadow-sm",
  secondary: "bg-white/10 text-white border-white/20 backdrop-blur-md",
  accent: "bg-[#CC1518] text-white border-[#CC1518]/50 shadow-sm",
  dark: "bg-neutral-900/90 text-white border-white/10",
  outline: "bg-transparent text-white border-white/40",
};

const sizeStyles = {
  sm: "px-2.5 py-0.5 text-[10px] md:text-xs",
  md: "px-3.5 py-1 text-xs sm:text-sm",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  icon,
  variant = "primary",
  size = "sm",
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border transition-all select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
