"use client";

import { useProgress } from "@react-three/drei";
import ShutterLoader from "@/components/common/ShutterLoader";
import { useEffect, useRef, useState } from "react";
import { scrollState } from "@/lib/home/scroll";

// Loading screen. The CFOCO logo (public/logo.svg) sits as a faint ghost and
// fills in, in full colour, from the bottom as the models stream in; a counter
// and a line of kitchen copy keep time. Once everything is in, the logo fades out, the
// screen splits open like a shutter, and the camera — which starts right at
// the neon CFOCO logo on the back wall — glides back into the room
// (CameraRig). The section copy rises in after it lands (SceneText).

/** seconds from the shutter opening to the camera landing / the copy starting */
const OPEN_DELAY = 0.75;
export const INTRO_FLIGHT = 2.8;

type Phase = "loading" | "leaving" | "gone";

/** set once the shutter has played: coming back to the home page by client-side navigation skips it (models are already cached) */
let played = false;

export function Loader() {
  const { progress, active } = useProgress();
  const [phase, setPhase] = useState<Phase>(played ? "gone" : "loading");
  const shown = useRef(0);
  const [value, setValue] = useState(0);

  // the counter eases toward the real progress, so it never jumps
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // rAF's timestamp can sit a little before performance.now(): never let dt go negative
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
      last = now;
      // drei's figure can be NaN or dip while new files are discovered: the counter only ever climbs
      const real = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 100) : 0;
      const target = Math.max(shown.current, active || real < 100 ? Math.min(real, 99) : 100);
      shown.current += (target - shown.current) * (1 - Math.exp(-dt * 5));
      if (target - shown.current < 0.4) shown.current = target;
      shown.current = Math.min(Math.max(shown.current, 0), 100);
      setValue(shown.current);
      if (shown.current < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, active]);

  // revisit: no shutter, no camera flight — land straight in the room
  useEffect(() => {
    if (!played) return;
    scrollState.introFlightAt = -Infinity;
    scrollState.introAt = performance.now() / 1000;
  }, []);

  useEffect(() => {
    if (phase !== "loading" || value < 100) return;
    const reduced = scrollState.reducedMotion;
    // hold on the full wordmark for a beat, then open
    const t1 = setTimeout(() => {
      setPhase("leaving");
      const now = performance.now() / 1000;
      // camera flight starts as the shutter opens; skipped if the page was reloaded mid-scroll
      scrollState.introFlightAt = reduced || scrollState.progress > 0.2 ? -Infinity : now + 0.35;
      scrollState.introAt = now + (reduced ? 0.3 : OPEN_DELAY + INTRO_FLIGHT * 0.62);
    }, 450);
    return () => clearTimeout(t1);
  }, [value, phase]);

  // unmount once the shutter has opened (0.4 s delay + 1.3 s). Its own effect: the one
  // above re-runs on the phase change, and its cleanup would cancel this timer.
  useEffect(() => {
    if (phase !== "leaving") return;
    played = true;
    const t = setTimeout(() => setPhase("gone"), 1900);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;
  return <ShutterLoader value={value} leaving={phase === "leaving"} />;
}
