"use client";

import React from "react";

export interface CardGlowProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "white" | "red" | "dark";
  interactive?: boolean;
  onClick?: () => void;
}

export const CardGlow: React.FC<CardGlowProps> = ({
  children,
  className = "",
  glowColor = "white",
  interactive = false,
  onClick,
}) => {
  const glowGradients = {
    white: "from-white/30 via-transparent to-white/5",
    red: "from-[#CC1518]/25 via-transparent to-transparent",
    dark: "from-white/10 via-transparent to-black/20",
  };

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 bg-white/10 hover:bg-white/25 backdrop-blur-sm border-2 border-white/15 hover:border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden ${
        interactive ? "cursor-pointer hover:-translate-y-1.5" : ""
      } ${className}`}
    >
      {/* Ambient Radial / Angular Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${glowGradients[glowColor]} opacity-60 pointer-events-none rounded-2xl sm:rounded-3xl`}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default CardGlow;
