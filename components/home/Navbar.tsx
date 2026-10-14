"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NAV_CTA, NAV_ITEMS } from "@/data/navLinks";

// Top navigation. Like the copy and the footer it is drawn in 3D by SceneText
// (type, logo, pills and icons), pinned to the lens so it holds still while the
// cursor moves; this DOM is its layout and the real, focusable links. The
// pills' look lives in --box-* variables so SceneText can draw them too.
// Franchise opens a dropdown (hover, focus or click); its panel and links are
// 3D as well, faded by SceneText from the data-open flag.

const LINKS = NAV_ITEMS;

export function Navbar() {
  return (
    // a <section> so SceneText picks it up; always shown, revealed with the opening
    <section
      aria-label="Site"
      data-index={-1}
      data-t3d-pinned
      data-t3d-layer="top"
      data-reveal="intro"
      className="navbar pointer-events-none fixed inset-x-0 top-0 z-20"
      style={{ opacity: 1, visibility: "visible" }}
    >
      <nav aria-label="Main" className="flex items-center justify-between px-(--gutter) pt-5">
        <Link href="/" aria-label="CFOCO home" className="pointer-events-auto block">
          {/* eslint-disable-next-line @next/next/no-img-element -- drawn in 3D; this only reserves the space */}
          <img
            data-t3d
            data-t3d-img="/logo.png"
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
                  data-t3d={current ? "" : undefined}
                  data-t3d-box={current ? "" : undefined}
                  className={`nav-link ${current ? "nav-link--current" : ""}`}
                >
                  <span data-t3d className="whitespace-nowrap">
                    {l.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href={NAV_CTA.href} data-t3d data-t3d-box className="nav-cta pointer-events-auto hidden lg:inline-flex">
          <span data-t3d data-t3d-color="#3b4252" className="whitespace-nowrap">
            {NAV_CTA.label}
          </span>
          <span data-t3d data-t3d-box className="nav-cta-arrow" aria-hidden>
            <span data-t3d data-t3d-icon="arrow-up-right" className="nav-icon" />
          </span>
        </Link>

        <MobileMenu />
      </nav>
    </section>
  );
}

/** Phones: a menu button that drops a panel with every link (3D too, faded from data-open). */
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
        <span data-t3d data-t3d-icon="menu" data-t3d-gate data-open={!open} />
        <span data-t3d data-t3d-icon="close" data-t3d-gate data-open={open} />
      </button>
      <div id="nav-mobile" className="nav-sheet" data-t3d data-t3d-box data-t3d-gate data-open={open}>
        <ul>
          {LINKS.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="nav-sheet-link"
              >
                <span data-t3d className="whitespace-nowrap">
                  {l.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={NAV_CTA.href} tabIndex={open ? 0 : -1} data-t3d data-t3d-box className="nav-cta mt-4 w-full justify-between">
          <span data-t3d data-t3d-color="#3b4252" className="whitespace-nowrap">
            {NAV_CTA.label}
          </span>
          <span data-t3d data-t3d-box className="nav-cta-arrow" aria-hidden>
            <span data-t3d data-t3d-icon="arrow-up-right" className="nav-icon" />
          </span>
        </Link>
      </div>
    </div>
  );
}
