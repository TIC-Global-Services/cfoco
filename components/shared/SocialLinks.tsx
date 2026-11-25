"use client";

import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export interface SocialLinkItem {
  name: string;
  href: string;
  icon: "linkedin" | "email" | "instagram";
}

export const DEFAULT_SOCIALS: SocialLinkItem[] = [
  { name: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  { name: "Email", href: "mailto:contact@cfoco.com", icon: "email" },
  { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
];

export interface SocialLinksProps {
  links?: SocialLinkItem[];
  className?: string;
  iconSizeClassName?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  links = DEFAULT_SOCIALS,
  className = "",
  iconSizeClassName = "w-5 h-5 sm:w-6 sm:h-6",
}) => {
  const renderIcon = (type: SocialLinkItem["icon"]) => {
    switch (type) {
      case "linkedin":
        return (
          <svg className={`${iconSizeClassName} fill-current`} viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37z" />
          </svg>
        );
      case "email":
        return <Mail className={iconSizeClassName} />;
      case "instagram":
        return (
          <svg className={`${iconSizeClassName} fill-none stroke-current`} viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      {links.map((s) => (
        <Link
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className="group p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer hover:scale-110"
        >
          {renderIcon(s.icon)}
        </Link>
      ))}
    </div>
  );
};

export default SocialLinks;
