"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
   { label: "Our Story", href: "/about" },
  { label: "Location", href: "/location" },
  { label: "Menu", href: "/menu" },
  { label: "Franchise", href: "/franchise" },
  { label: "News & Blogs", href: "/news-blogs" },
 
];

interface NavbarProps {
  className?: string;
}

const NavbarOther: React.FC<NavbarProps> = ({ className = "" }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className={`absolute top-5 left-0 right-0 z-50 w-full  transition-all duration-300 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-[5%]">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="relative h-10 w-36 sm:h-12 sm:w-40 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/cfc_logo.svg"
                alt="CFOCO Logo"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-sm lg:text-base font-medium transition-colors duration-200 relative py-1 ${
                    isActive
                      ? "text-black"
                      : "text-black hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Contact Us CTA Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="/contact"
              className="group flex items-center gap-3 pl-6 pr-1 py-1 rounded-full bg-[#FFFFFF99] hover:bg-[#8799a5]/45 border border-white/20 backdrop-blur-md text-white font-medium text-sm lg:text-lg transition-all duration-300 shadow-sm hover:shadow-md hover:border-white/40"
            >
              <span className="tracking-tight font-semibold text-[#232E45] group-hover:text-white transition-colors">
                Contact Us
              </span>
              <div className="w-8 h-8 rounded-full bg-[#232E45] border border-white/10 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 group-hover:scale-105">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7V17"
                  />
                </svg>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d121c]/95 backdrop-blur-xl border-b border-white/10 px-4 pt-2 pb-6 space-y-4">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-neutral-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between w-full pl-5 pr-2 py-2 rounded-full bg-[#8799a5]/30 hover:bg-[#8799a5]/45 border border-white/20 text-white font-medium text-base transition-all"
            >
              <span>Contact Us</span>
              <div className="w-8 h-8 rounded-full bg-[#101726] border border-white/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7V17"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavbarOther;