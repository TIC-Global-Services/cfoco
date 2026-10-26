import { Quaternion, Vector3 } from "three";

// Shared, mutable scroll state. Written by Lenis, read inside rAF loops
// (R3F useFrame + DOM overlay) so scrolling never triggers React renders.

export const SECTION_VH = 1.4; // viewport heights of scroll per section

export const scrollState = {
  /** continuous section progress: 0 = first section centred, 1 = second, ... */
  progress: 0,
  /** normalised pointer position (-1..1) for subtle parallax */
  pointer: { x: 0, y: 0 },
  /** true once a mouse/pen has moved over the page (touch never sets it) */
  hasPointer: false,
  /** Lenis scroll velocity, px per frame (signed) */
  velocity: 0,
  /** prefers-reduced-motion */
  reducedMotion: false,
  /** set by ?debug — frees the camera for orbiting */
  debug: false,
  /** bucket drop (HeroChicken → Sound): 0..1 while the piece falls in, and a count of landings */
  dropFall: 0,
  dropHits: 0,
  /** seconds (performance clock) when the loader has cleared — the opening copy reveals from here */
  introAt: Infinity,
  /** seconds (performance clock) when the opening camera flight starts (-Infinity: skip it) */
  introFlightAt: Infinity,
  /** sound toggle (Sound → the 3D turntable) */
  sound: "locked" as "locked" | "on" | "off",
  soundHover: false,
};

/** the serving robot (ServeRobot → HeroChicken): where its tray is, in the room, while the bucket rides on it */
export const robotRide = {
  tray: new Vector3(),
  quaternion: new Quaternion(),
  ready: false,
};

/** set by Experience once Lenis exists — lets dev tools jump to a section */
/** set by Sound — lets the 3D turntable flip the sound like the button does */
export const soundApi: { toggle: () => void } = { toggle: () => {} };

export const scrollApi: { toSection: (index: number, immediate?: boolean) => void } = {
  toSection: () => {},
};

type Listener = (progress: number) => void;
const listeners = new Set<Listener>();

export function setProgress(p: number) {
  scrollState.progress = p;
  listeners.forEach((l) => l(p));
}

export function onProgress(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// ---------- keyframe tracks ----------

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** gravity-like: starts slow, accelerates into the end */
export const easeIn = (t: number) => t * t * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
/** overshoots past the end and settles back */
export const easeOutBack = (t: number, s = 1.4) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
/** in-out, but sails a little past the end before settling (bump only in the last ~45%) */
export const easeInOutOvershoot = (t: number, amount = 0.07) =>
  easeInOut(t) + amount * Math.sin(Math.PI * clamp((t - 0.55) / 0.45));
/** pulls back before it goes */
export const easeInBack = (t: number, s = 1.4) => (s + 1) * t * t * t - s * t * t;

/**
 * Finds the segment of a sorted keyframe list that contains `p` and returns
 * the two surrounding keys plus an eased 0..1 blend factor. A key may carry
 * its own `ease`, which then shapes the segment that ends on it.
 */
export function sampleTrack<K extends { p: number; ease?: (t: number) => number }>(
  keys: K[],
  p: number,
  ease: (t: number) => number = easeInOut,
): [K, K, number] {
  if (p <= keys[0].p) return [keys[0], keys[0], 0];
  const last = keys[keys.length - 1];
  if (p >= last.p) return [last, last, 0];
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].p) i++;
  const a = keys[i];
  const b = keys[i + 1];
  return [a, b, (b.ease ?? ease)((p - a.p) / (b.p - a.p))];
}

export function sampleScalar(
  keys: { p: number; v: number }[],
  p: number,
  ease?: (t: number) => number,
) {
  const [a, b, t] = sampleTrack(keys, p, ease);
  return a.v + (b.v - a.v) * t;
}

// ---------- springs (time-based secondary motion) ----------

/** Critically-ish damped spring. `stiffness` ~ how fast, `damping` 0..1 ~ how little it wobbles. */
export class Spring {
  x: number;
  v = 0;
  constructor(x = 0) {
    this.x = x;
  }
  step(target: number, dt: number, stiffness = 120, damping = 0.5) {
    // fixed sub-steps keep it stable on long frames
    const n = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = Math.min(dt, 0.1) / n;
    const c = 2 * Math.sqrt(stiffness) * damping;
    for (let i = 0; i < n; i++) {
      this.v += ((target - this.x) * stiffness - this.v * c) * h;
      this.x += this.v * h;
    }
    return this.x;
  }
  kick(v: number) {
    this.v += v;
  }
}

/** frame-rate independent exponential approach */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
