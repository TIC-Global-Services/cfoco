"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, onProgress, scrollState, smoothstep, soundApi } from "@/lib/home/scroll";
import { type Sfx, createSfx } from "@/lib/home/sfx";
import { FOOTER_FROM, HOVER_AT, RISE_FROM, SWAP_FROM, SWAP_TO } from "./config";
import { useSoundControls } from "./controls";

type State = "locked" | "on" | "off";

/**
 * Scroll-driven sound for the hero, all on one Web Audio graph (lib/sfx):
 *  - fry sizzle swells through the raw → fried swap and dies away after
 *  - a whoosh while the chicken rises and is tossed — loudness follows how
 *    fast you scroll through it, pitch sweeping up — and as it falls back
 *    into the bucket (the baked drop, which plays in real time), sweeping down
 *  - a thump + crunch the moment it lands in the pile
 *  - background music (leberch-ambient) very low under everything, plus a
 *    faint room tone and distant kitchen clinks through the food story
 * Everything follows scroll progress (or the drop it triggers), so scrubbing back replays it.
 *
 * Browsers only start audio after a click / key / tap (a wheel scroll does not
 * count), so the first such gesture anywhere unlocks it; the button toggles it.
 */
export function Sound() {
  const [state, setState] = useState<State>("locked");
  const stateRef = useRef<State>("locked");
  const ctl = useSoundControls();
  const levels = useRef(ctl);
  useEffect(() => {
    levels.current = ctl;
  }, [ctl]);

  const sfx = useRef<Sfx | null>(null);

  // builds the graph on first unlock (must run inside a user gesture)
  const start = () => {
    if (!sfx.current) {
      sfx.current = createSfx(new AudioContext());
      if (process.env.NODE_ENV !== "production") (window as unknown as { __sfx: Sfx }).__sfx = sfx.current;
    }
    void sfx.current.resume();
  };

  const set = (s: State) => {
    stateRef.current = s;
    scrollState.sound = s;
    setState(s);
    if (s === "on") start();
    else if (s === "off") void sfx.current?.pause();
  };

  // the turntable in the room toggles through this
  useEffect(() => {
    soundApi.toggle = () => set(stateRef.current === "on" ? "off" : "on");
    return () => {
      soundApi.toggle = () => {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the button bows out while the footer is up (its credits own that corner)
  const bar = useRef<HTMLElement>(null);
  useEffect(
    () =>
      onProgress((p) => {
        const el = bar.current;
        if (!el) return;
        const k = 1 - smoothstep(FOOTER_FROM - 0.2, FOOTER_FROM + 0.1, p);
        el.style.opacity = k.toFixed(3);
        el.style.visibility = k > 0.001 ? "visible" : "hidden";
      }),
    [],
  );

  // first gesture anywhere unlocks the sound (unless the user turned it off)
  useEffect(() => {
    const unlock = (e: Event) => {
      // the toggles handle their own click (the button, or the turntable under the cursor)
      if ((e.target as Element | null)?.closest?.("[data-sound-toggle]") || scrollState.soundHover) return;
      if (stateRef.current === "locked") set("on");
    };
    const opts = { capture: true } as const;
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    return () => {
      window.removeEventListener("pointerdown", unlock, opts);
      window.removeEventListener("keydown", unlock, opts);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sound follows scroll; pauses with the tab
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let prevP = scrollState.progress;
    let hits = scrollState.dropHits;
    let speed = 0; // smoothed |d progress / dt|, sections per second

    const tick = (now: number) => {
      const dt = Math.max(1e-3, Math.min((now - last) / 1000, 0.1));
      last = now;
      const p = scrollState.progress;
      const v = (p - prevP) / dt;
      speed += (Math.abs(v) - speed) * (1 - Math.exp(-dt * 12));
      const a = sfx.current;

      if (a && stateRef.current === "on") {
        const L = levels.current;

        // fry sizzle
        const fry = smoothstep(SWAP_FROM - 0.2, SWAP_FROM + 0.15, p) * (1 - smoothstep(SWAP_TO - 0.05, SWAP_TO + 0.3, p));
        a.setFry(fry * L.volume);

        // whoosh: inside the rise as loud as you scroll through it, then the fall
        const tRise = clamp((p - RISE_FROM) / (HOVER_AT - RISE_FROM));
        const fall = scrollState.dropFall;
        const motion = Math.min(1, speed * 0.75);
        if (fall > 0) {
          // the piece accelerates down, so it gets louder and lower on the way
          a.setWhoosh((0.3 + 0.7 * fall * fall) * L.whoosh, 1700 - 1250 * fall);
        } else if (p > RISE_FROM && p < HOVER_AT) {
          a.setWhoosh(motion * Math.sqrt(Math.sin(Math.PI * tRise)) * L.whoosh, 350 + 1500 * tRise);
        } else {
          a.setWhoosh(0, 500);
        }

        // ambience: the music under everything; kitchen clinks only through the food story
        const kitchen = 1 - smoothstep(4.6, 5.4, p);
        a.setAmbience(L.music, L.ambience, kitchen, fry);

        // landing hit — each time the drop lands
        if (scrollState.dropHits !== hits) a.land(L.impact);
      }
      prevP = p;
      hits = scrollState.dropHits;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onVis = () => {
      const a = sfx.current;
      if (!a) return;
      if (document.hidden) void a.pause();
      else if (stateRef.current === "on") void a.resume();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      void sfx.current?.pause();
      void sfx.current?.ctx.close();
      sfx.current = null;
    };
  }, []);

  const on = state === "on";
  return (
    // drawn in 3D by SceneText (pinned to the lens, so it holds still); this is the real button
    <section
      ref={bar}
      aria-label="Sound"
      data-index={-2}
      data-t3d-pinned
      data-reveal="intro"
      className="pointer-events-none fixed right-(--gutter) bottom-6 z-20"
      style={{ opacity: 1, visibility: "visible" }}
    >
      <button
        type="button"
        data-sound-toggle
        aria-pressed={on}
        aria-label={on ? "Turn sound off" : "Turn sound on"}
        onClick={(e) => {
          e.stopPropagation();
          set(on ? "off" : "on");
        }}
        className="sound-btn pointer-events-auto"
      >
        {/* speaker with waves when on, crossed out when off — both laid out, SceneText fades between them */}
        <span className="sound-icon" aria-hidden>
          <span data-t3d data-t3d-icon="volume-on" data-t3d-gate data-open={on} />
          <span data-t3d data-t3d-icon="volume-off" data-t3d-gate data-open={!on} />
        </span>
        <span data-t3d data-t3d-live className="whitespace-nowrap">
          {on ? "SOUND ON" : "SOUND OFF"}
        </span>
      </button>
    </section>
  );
}
