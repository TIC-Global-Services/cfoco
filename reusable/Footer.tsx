"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { matter } from "@/font/fonts";
import Reveal from "@/reusable/Reveal";

interface FooterNavLink {
  label: string;
  href: string;
}

const navLinks: FooterNavLink[] = [
  { label: "Menu", href: "/menu" },
   { label: "Our Story", href: "/our-story" },
  { label: "Franchise", href: "/franchise" },
   { label: "Policies", href: "/policies" },
  { label: "Contact Us", href: "/contact" },
  { label: "News & Blogs", href: "/news-blogs" },
 
];

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg
        className="w-7 h-7 fill-current transition-transform duration-200 group-hover:scale-110"
        viewBox="0 0 24 24"
      >
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: "mailto:contact@cfoco.com",
    icon: (
      <svg
        className="w-7 h-7 fill-none stroke-current transition-transform duration-200 group-hover:scale-110"
        viewBox="0 0 24 24"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg
        className="w-7 h-7 fill-none stroke-current transition-transform duration-200 group-hover:scale-110"
        viewBox="0 0 24 24"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer
      className={`relative w-full h-[600px] overflow-hidden select-none ${matter.className} ${className}`}
    >
      <Reveal className="h-full w-full">
        <div className="relative z-10 w-full h-full px-5 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col justify-between items-center">
          {/* Top Navigation Links */}
          <nav className="flex flex-wrap justify-center items-center px-10 md:px-0 gap-6 sm:gap-8 md:gap-10 lg:gap-14 text-lg sm:text-lg font-normal text-white shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors duration-200 hover:text-white relative leading-[0.9]  group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#E5A823] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Center 3D CFOCO Logo */}
          <div className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl flex-1 flex justify-center items-center my-auto">
            <div className="relative w-full h-[220px] sm:h-[280px] md:h-[320px] transition-transform duration-500 hover:scale-[1.02]">
              <Image
                src="/cfc-footer-bg.png"
                alt="CFOCO Logo"
                fill
                priority
                className="object-cover drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              />
            </div>
          </div>

          {/* Bottom Footer Bar */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-2 sm:gap-6 text-base sm:text-base text-[#B0B0B0] shrink-0">
            {/* Copyright */}
            <div className="text-center md:text-left order-2 md:order-1 font-light">
              <span>Copyright © 2026 </span>
              <span className="font-semibold text-[#E5A823]">CFOCO.</span>
              <span> All rights reserved.</span>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 order-1 md:order-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="group p-1 text-[#0088cc] hover:text-[#38bdf8] transition-colors duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Credits */}
            <div className="text-center text-base md:text-right text-[#B0B0B0] order-3 font-light">
              <span>Designed &amp; Developed by </span><br className="md:hidden"/>
              <Link
                href="https://ticglobalservices.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#CC1518] hover:text-red-400 transition-colors duration-200"
              >
                TIC Global services
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </footer>
  );
};

export default Footer;
