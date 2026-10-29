"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NAV_CTA, NAV_ITEMS } from "@/data/navLinks";
import { onProgress, smoothstep } from "@/lib/home/scroll";
import { FOOTER_FROM, FOOTER_TO } from "./config";

// Top navigation: plain DOM on top of the canvas (not drawn in 3D like the copy),
// so the logo, type and pills stay as sharp as on the other pages whatever
// resolution the canvas renders at.

const LINKS = NAV_ITEMS;

export function Navbar() {
  const root = useRef<HTMLElement>(null);

  // the footer has its own links: the navbar fades out as it comes in (SceneText reads the opacity / visibility, like the sections')
  useEffect(
    () =>
      onProgress((p) => {
        const el = root.current;
        if (!el) return;
        const k = 1 - smoothstep(FOOTER_FROM - 0.1, FOOTER_FROM + 0.25, p);
        el.style.opacity = k.toFixed(3);
        el.style.visibility = k > 0.001 ? "visible" : "hidden";
      }),
    [],
  );

  return (
    <section
      ref={root}
      aria-label="Site"
      className="navbar pointer-events-none fixed inset-x-0 top-0 z-20"
      style={{ opacity: 1, visibility: "visible" }}
    >
      <nav aria-label="Main" className="flex items-center justify-between px-(--gutter) pt-5">
        <Link href="/" aria-label="CFOCO home" className="pointer-events-auto block">
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size logo, nothing for next/image to do */}
          <img
            src="/logo.png"
            alt=""
            width={1086}
            height={317}
            className="h-9 w-auto lg:h-10"
          />
        </Link>

        <ul className="pointer-events-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const current = l.href === "/"; // this navbar only lives on the home page
            return (
              <li key={l.label}>
                <Link
                  href={l.href}
                  aria-current={current ? "page" : undefined}
                  className={`nav-link ${current ? "nav-link--current" : ""}`}
                >
                  <span className="whitespace-nowrap">
                    {l.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href={NAV_CTA.href} className="nav-cta pointer-events-auto hidden lg:inline-flex">
          <span className="whitespace-nowrap">{NAV_CTA.label}</span>
          <span className="nav-cta-arrow" aria-hidden>
            <Icon name="arrow-up-right" />
          </span>
        </Link>

        <MobileMenu />
      </nav>
    </section>
  );
}

const ICONS = {
  "arrow-up-right": "M7 17L17 7M17 7H7M17 7V17",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
      <path d={ICONS[name]} />
    </svg>
  );
}

/** Phones: a menu button that drops a panel with every link (faded from data-open). */
function MobileMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const down = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", down);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", down);
    };
  }, [open]);


  return (
    <div ref={root} className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="nav-mobile"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="nav-burger pointer-events-auto"
      >
        <Icon name={open ? "close" : "menu"} />
      </button>
      <div id="nav-mobile" className="nav-sheet" data-open={open}>
        <ul>
          {LINKS.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="nav-sheet-link"
              >
                <span className="whitespace-nowrap">
                  {l.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={NAV_CTA.href} tabIndex={open ? 0 : -1} className="nav-cta mt-4 w-full justify-between">
          <span className="whitespace-nowrap">{NAV_CTA.label}</span>
          <span className="nav-cta-arrow" aria-hidden>
            <Icon name="arrow-up-right" />
          </span>
        </Link>
      </div>
    </div>
  );
}
