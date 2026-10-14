"use client";

import { useEffect, useRef } from "react";
import { damp, onProgress, scrollState, smoothstep } from "@/lib/home/scroll";
import { SECTIONS, SHOW_COPY, type Section } from "./config";

/**
 * Fixed text layer. Every section's copy sits in the same viewport-sized box
 * and is faded/translated from the shared scroll progress, in the same frame
 * the 3D scene reads it — so text and camera never drift apart.
 */
export function Overlay() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  // cursor parallax: title and body drift a few px against the pointer, at
  // different depths, matching the camera's orbit. Plus a very small morph:
  // each visible text block is pulled a few px toward an approaching cursor
  // and leans with its sideways speed (transform only — no layout work).
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const m = { x: 0, y: 0 };
    const cur = { x: 0, y: 0, vx: 0 };
    const blocks = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-morph]") ?? []).map((el) => ({
      el,
      section: el.closest("section") as HTMLElement | null,
      x: 0,
      y: 0,
      sk: 0,
      s: 0,
    }));
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const on = scrollState.hasPointer && !scrollState.reducedMotion;
      m.x = damp(m.x, on ? scrollState.pointer.x : 0, 3, dt);
      m.y = damp(m.y, on ? scrollState.pointer.y : 0, 3, dt);
      rootRef.current?.style.setProperty("--mx", m.x.toFixed(4));
      rootRef.current?.style.setProperty("--my", m.y.toFixed(4));

      // cursor in px + smoothed horizontal speed
      const px = ((scrollState.pointer.x + 1) / 2) * window.innerWidth;
      const py = ((1 - scrollState.pointer.y) / 2) * window.innerHeight;
      cur.vx = damp(cur.vx, (px - cur.x) / Math.max(dt, 1e-3), 10, dt);
      cur.x = px;
      cur.y = py;

      // read all rects first, then write (one layout per frame at most)
      const live = blocks.filter((b) => b.section && b.section.style.visibility !== "hidden");
      const rects = live.map((b) => b.el.getBoundingClientRect());
      live.forEach((b, i) => {
        const r = rects[i];
        let tx = 0, ty = 0, tsk = 0, ts = 0;
        if (on) {
          const dx = Math.max(r.left - px, 0, px - r.right);
          const dy = Math.max(r.top - py, 0, py - r.bottom);
          const near = Math.exp(-Math.hypot(dx, dy) / 170);
          const dirX = Math.max(-1, Math.min(1, (px - (r.left + r.right) / 2) / (r.width / 2 || 1)));
          const dirY = Math.max(-1, Math.min(1, (py - (r.top + r.bottom) / 2) / (r.height / 2 || 1)));
          tx = dirX * 5 * near;
          ty = dirY * 3 * near;
          tsk = Math.max(-1.2, Math.min(1.2, -cur.vx * 0.0007)) * near;
          ts = 0.008 * near;
        }
        b.x = damp(b.x, tx, 8, dt);
        b.y = damp(b.y, ty, 8, dt);
        b.sk = damp(b.sk, tsk, 6, dt);
        b.s = damp(b.s, ts, 8, dt);
        b.el.style.setProperty("--mo-x", `${b.x.toFixed(2)}px`);
        b.el.style.setProperty("--mo-y", `${b.y.toFixed(2)}px`);
        b.el.style.setProperty("--mo-sk", `${b.sk.toFixed(3)}deg`);
        b.el.style.setProperty("--mo-s", (1 + b.s).toFixed(4));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(
    () =>
      onProgress((p) => {
        refs.current.forEach((el, i) => {
          if (!el) return;
          const d = p - i;
          const a = Math.abs(d);
          const visible = 1 - smoothstep(0.16, 0.42, a);
          el.style.opacity = visible.toFixed(3);
          // soft focus pull on the way in / out
          const blur = (1 - visible) * 10;
          el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
          el.style.visibility = visible < 0.001 ? "hidden" : "visible";
          el.style.setProperty("--shift", `${(-d * 70).toFixed(1)}px`);
          el.style.setProperty("--shift-late", `${(-d * 110).toFixed(1)}px`);
        });
      }),
    [],
  );

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-10 text-white">
      {SECTIONS.map((s, i) => (
        <section
          key={s.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          data-index={i}
          aria-label={s.title.replace(/\n/g, " ")}
          className="absolute inset-0 opacity-0"
          style={{ visibility: i === 0 ? "visible" : "hidden" }}
        >
          {/* copy hidden for now (SHOW_COPY): the sections stay, so scroll and timing don't change */}
          {SHOW_COPY && <SectionCopy s={s} />}
        </section>
      ))}
    </div>
  );
}

function Title({ s, className = "" }: { s: Section; className?: string }) {
  const grad = s.gradient ? "text-gradient" : "";
  return (
    <h2 data-morph className={`title shift ${className}`}>
      {s.kicker && (
        <span data-t3d className={`kicker block ${grad}`}>
          {s.kicker}
        </span>
      )}
      {/* one element per line, so each line can rise in on its own (SceneText) */}
      {s.title.split("\n").map((line, i) => (
        <span key={i} data-t3d className={`block ${grad}`}>
          {line.trim()}
        </span>
      ))}
    </h2>
  );
}

function Body({ s, className = "" }: { s: Section; className?: string }) {
  return (
    <div data-morph className={`shift-late ${className}`}>
      {s.body && (
        <p data-t3d className="body">
          {s.body}
        </p>
      )}
      {s.subBody && (
        <p data-t3d className="sub-body mt-5">
          {s.subBody}
        </p>
      )}
    </div>
  );
}

// Phones: the hero fills the middle of a tall screen, so the copy splits to
// the top (title) and the bottom (body) there; lg: and up restore the frames.
function SectionCopy({ s }: { s: Section }) {
  switch (s.layout) {
    case "split":
      return (
        <div className="frame justify-between pt-[max(13vh,84px)] pb-[11vh] lg:justify-center lg:py-0">
          <Title s={s} className="max-w-[46rem]" />
          <Body s={s} className="max-w-[30rem] lg:absolute lg:right-[3.5vw] lg:top-1/2 lg:-translate-y-[20%]" />
        </div>
      );
    case "top-center-body-right":
      return (
        <div className="frame">
          <Title s={s} className="mx-auto pt-[max(13vh,84px)] text-center lg:pt-[20vh]" />
          <Body s={s} className="mt-auto mb-[11vh] max-w-[27rem] lg:ml-auto lg:mr-[3.5vw] lg:mb-[28vh]" />
        </div>
      );
    case "center":
      return (
        <div className="frame items-center justify-center text-center">
          <Title s={s} className="mx-auto" />
        </div>
      );
    case "left-bullets":
      return (
        <div className="frame pt-[max(13vh,84px)] lg:justify-center lg:pt-0">
          <Title s={s} className="title-xl" />
          <div data-morph className="shift-late mt-6 lg:mt-10">
            <ul className="space-y-1.5">
              {s.bullets?.map((b) => (
                <li key={b} className="body flex items-center gap-2.5">
                  <span className="inline-block h-2.5 w-2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-white" />
                  <span data-t3d>{b}</span>
                </li>
              ))}
            </ul>
                </div>
        </div>
      );
    case "top-center":
      return (
        <div className="frame items-center">
          <Title s={s} className="pt-[max(13vh,84px)] text-center" />
          <Waveform />
        </div>
      );
    case "top-left-body-br":
      return (
        <div className="frame">
          <Title s={s} className="pt-[max(13vh,84px)] lg:pt-[16vh]" />
          <Body s={s} className="mt-auto mb-[12vh] max-w-[27rem] lg:ml-auto lg:mr-[3.5vw] lg:mb-[26vh]" />
        </div>
      );
    case "bottom-left":
      return (
        <div className="frame justify-end pb-[11vh]">
          <Title s={s} />
          <Body s={s} className="mt-6 max-w-[41rem]" />
        </div>
      );
    case "top-left":
      return (
        <div className="frame pt-[14vh]">
          <Title s={s} />
          <Body s={s} className="mt-8 max-w-[36rem]" />
        </div>
      );
  }
}

function Waveform() {
  const bars = [10, 10, 10, 10, 10, 20, 30, 20, 10, 10, 10, 10, 10];
  return (
    <div className="shift-late absolute bottom-[5vh] left-1/2 flex -translate-x-1/2 items-center gap-[5px]" aria-hidden>
      {bars.map((h, i) => (
        <span key={i} className="waveform-bar w-px bg-white/80" style={{ height: h, animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}
