"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FOOTER_LINKS } from "@/data/navLinks";
import { onProgress, smoothstep } from "@/lib/home/scroll";
import { FOOTER_FROM, FOOTER_TO } from "./config";

// The page's end: once the camera has travelled into the neon logo (CameraRig)
// the footer frames it — links above, credits below. Like the section copy it
// is rendered as 3D type (SceneText, pinned to the moving camera); this DOM is
// its layout and the real, focusable links underneath.

const SOCIAL = [
  { icon: "linkedin", label: "LinkedIn", href: "#" },
  { icon: "mail", label: "Email", href: "#" },
  { icon: "instagram", label: "Instagram", href: "#" },
];

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
        // SceneText reads these, like it does for the sections
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
      data-index={99}
      data-t3d-pinned
      data-reveal={`${FOOTER_FROM},${FOOTER_TO}`}
      className="footer fixed inset-0 z-10 text-white"
      style={{ visibility: "hidden", opacity: 0 }}
    >
      <nav aria-label="Footer" className="absolute inset-x-0 top-[27vh] flex justify-center md:top-[17vh] px-(--gutter)">
        <ul className="flex flex-wrap justify-center gap-x-[clamp(20px,3.4vw,50px)] gap-y-3">
          {FOOTER_LINKS.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className="footer-link">
                <span data-t3d className="whitespace-nowrap">
                  {l.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="footer-bar absolute inset-x-0 bottom-[3.2vh] grid items-center gap-4 px-(--gutter) md:grid-cols-[1fr_auto_1fr]">
        <p className="flex flex-wrap justify-center md:justify-start">
          <span data-t3d className="whitespace-nowrap">
            Copyright © {new Date().getFullYear()}
          </span>
          <span data-t3d data-t3d-color={GOLD} className="ml-[0.3em] whitespace-nowrap">
            CFOCO
          </span>
          <span data-t3d className="whitespace-nowrap">
            . All rights reserved.
          </span>
        </p>
        <div className="flex justify-center gap-5">
          {SOCIAL.map((s) => (
            <Link key={s.icon} href={s.href} aria-label={s.label} className="footer-link block p-1">
              <span data-t3d data-t3d-icon={s.icon} data-t3d-color={BLUE} className="block h-6 w-6" />
            </Link>
          ))}
        </div>
        <p className="flex flex-wrap justify-center md:justify-end">
          <span data-t3d className="whitespace-nowrap">
            Designed & Developed by
          </span>
          <Link href="#" className="footer-link ml-[0.3em]">
            <span data-t3d data-t3d-color={RED} className="whitespace-nowrap">
              TIC Global services
            </span>
          </Link>
        </p>
      </div>
    </section>
  );
}
