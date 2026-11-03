"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FOOTER_LINKS } from "@/data/navLinks";
import { onProgress, smoothstep } from "@/lib/home/scroll";
import { FOOTER_FROM, FOOTER_TO } from "./config";

// The page's end: once the camera has travelled into the neon logo (CameraRig)
// the footer frames it — links above, credits below. Like the section copy it
// is plain DOM text over the canvas, like the navbar.

const SOCIAL = [
  { icon: "linkedin", label: "LinkedIn", href: "#" },
  { icon: "mail", label: "Email", href: "#" },
  { icon: "instagram", label: "Instagram", href: "#" },
];

/** 24-unit line icons (lucide shapes) */
const ICON_PATHS: Record<string, string[]> = {
  linkedin: ["M4.5 2.5h15a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2z", "M7 10v7M7 7v.01M11 17v-4a2.5 2.5 0 0 1 5 0v4M11 10v7"],
  mail: ["M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"],
  instagram: ["M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z", "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", "M17.5 6.5h.01"],
};

const GOLD = "#e9b949";
const RED = "#e5322d";
const BLUE = "#4f8cff";

export function Footer() {
  const root = useRef<HTMLElement>(null);

  useEffect(
    () =>
      onProgress((p) => {
        const el = root.current;
        if (!el) return;
        const k = smoothstep(FOOTER_FROM, FOOTER_TO, p);
        el.style.opacity = k.toFixed(3);
        el.style.visibility = k > 0.001 ? "visible" : "hidden";
        // only clickable once it is (nearly) all there
        el.style.pointerEvents = k > 0.9 ? "auto" : "none";
      }),
    [],
  );

  return (
    <section
      ref={root}
      aria-label="Footer"
      className="footer fixed inset-0 z-10 text-white"
      style={{ visibility: "hidden", opacity: 0 }}
    >
      <nav aria-label="Footer" className="absolute inset-x-0 top-[27vh] flex justify-center md:top-[17vh] px-(--gutter)">
        <ul className="flex flex-wrap justify-center gap-x-[clamp(20px,3.4vw,50px)] gap-y-3">
          {FOOTER_LINKS.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className="footer-link">
                <span className="whitespace-nowrap">
                  {l.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="footer-bar absolute inset-x-0 bottom-[3.2vh] grid items-center gap-4 px-(--gutter) md:grid-cols-[1fr_auto_1fr]">
        <p className="footer-pill justify-self-center md:justify-self-start">
          <span className="whitespace-nowrap">
            Copyright © {new Date().getFullYear()}
          </span>
          <span style={{ color: GOLD }} className="ml-[0.3em] whitespace-nowrap">
            CFOCO
          </span>
          <span className="whitespace-nowrap">
            . All rights reserved.
          </span>
        </p>
        <div className="footer-pill justify-self-center gap-5">
          {SOCIAL.map((s) => (
            <Link key={s.icon} href={s.href} aria-label={s.label} className="footer-link block p-1">
              <svg viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="block h-6 w-6" aria-hidden>
                {ICON_PATHS[s.icon].map((d) => (
                  <path key={d} d={d} />
                ))}
              </svg>
            </Link>
          ))}
        </div>
        <p className="footer-pill justify-self-center md:justify-self-end">
          <span className="whitespace-nowrap">
            Designed & Developed by
          </span>
          <Link href="#" className="footer-link ml-[0.3em]">
            <span style={{ color: RED }} className="whitespace-nowrap">
              TIC Global services
            </span>
          </Link>
        </p>
      </div>
    </section>
  );
}
