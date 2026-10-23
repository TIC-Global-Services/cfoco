"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  MotionValue,
  useAnimationFrame,
  useMotionValue,
  useInView,
  useSpring,
  Variants,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────
   TYPES & INTERFACES
   ───────────────────────────────────────────────────────────────────────── */

export interface Milestone {
  year: string;
  title: string;
  descLine1: string;
  descLine2: string;
  theme?: "red" | "cyan";
}

export interface MilestonePoint {
  x: number;
  y: number;
}

interface RoadPoint {
  x: number;
  y: number;
  isPeakOrValley?: boolean;
}

interface ObsessionProps {
  items?: Milestone[];
}

/* ─────────────────────────────────────────────────────────────────────────
   DEFAULT DATA & ROAD CONFIGURATION
   ───────────────────────────────────────────────────────────────────────── */

export const defaultMilestones: Milestone[] = [
  {
    year: "2011",
    title: "The First Fry",
    descLine1: "One Kitchen In Bordeaux.",
    descLine2: "One Recipe Worth Arguing Over.",
    theme: "red",
  },
  {
    year: "2014",
    title: "Word Gets Out",
    descLine1: "Lines Out The Door. Turns Out We",
    descLine2: "Weren't The Ones Tired Of Average.",
    theme: "red",
  },
  {
    year: "2018",
    title: "Beyond Bordeaux",
    descLine1: "Second, Third, Fourth. Same Recipe.",
    descLine2: "Same Standard. No Shortcuts.",
    theme: "cyan",
  },
  {
    year: "2019",
    title: "The Cult Grows",
    descLine1: "Paris, Lyon, Marseille.",
    descLine2: "The Crunch Heard Across France.",
    theme: "red",
  },
  {
    year: "2020",
    title: "The Secret Formula",
    descLine1: "Perfected The 24-Hour Brine.",
    descLine2: "Crispy Outside, Juicy Inside.",
    theme: "cyan",
  },
  {
    year: "2022",
    title: "Going Global",
    descLine1: "New Continents, Same Obsession.",
    descLine2: "Never Freezing, Never Compromising.",
    theme: "red",
  },
];

export const ROAD_CONFIG = {
  // Spacing between milestone pins (px)
  spacingDesktop: 760,
  spacingMobile: 420,

  // Start position for the first milestone (2011)
  startXDesktop: 500,
  startXMobile: 260,

  // Y-axis height: Strictly alternates High and Low for a curvy highway ribbon
  // [2011 (High), 2014 (Low), 2018 (High), 2019 (Low), 2020 (High), 2022 (Low)]
  milestoneHeightsDesktop: [170, 340, 170, 340, 170, 340],
  milestoneHeightsMobile:  [200, 340, 200, 340, 200, 340],

  // Curve smoothness factor (0.44 - 0.50 gives natural highway curvature)
  curveSmoothness: 0.48,

  // Road thickness & shadow widths
  roadWidthDesktop: 54,
  roadWidthMobile: 42,
  shadowWidthDesktop: 64,
  shadowWidthMobile: 52,

  // Road dashed divider line motion
  lineSpeed: 52,         // Idle cruising speed (px/s)
  lineScrollBoost: 2600, // Dynamic dash acceleration while scrolling
  lineDirection: -1,     // Highway drive direction
} as const;

// Transition & pacing constants
const DWELL_RATIO = 0.32;         // Scroll slice ratio spent docked at milestone
const FADE_DISTANCE_THRESHOLD = 0.25; // Distance at which content begins fading in
const FADE_DISTANCE_TARGET = 0.08;    // Distance at which content reaches 100% opacity
const ROAD_CANVAS_HEIGHT = 700;
const ROAD_MEDIAN_Y = 255;

/* ─────────────────────────────────────────────────────────────────────────
   GEOMETRY & SPLINE UTILITIES
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Builds a mathematically continuous, monotonic cubic Bezier spline.
 * Guarantees zero kinks and horizontal tangents at alternating peaks and valleys.
 */
function buildSmoothHighwaySpline(
  points: RoadPoint[],
  smoothness: number = 0.44
): string {
  if (points.length < 2) return "";

  const n = points.length;
  const slopes: number[] = new Array(n).fill(0);

  // 1. Calculate tangent slopes (horizontal at peaks and valleys)
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1) {
      slopes[i] = 0;
    } else {
      const prev = points[i - 1];
      const cur = points[i];
      const next = points[i + 1];

      const isExtrema =
        points[i].isPeakOrValley ||
        (cur.y - prev.y) * (next.y - cur.y) <= 0;

      slopes[i] = isExtrema ? 0 : (next.y - prev.y) / (next.x - prev.x);
    }
  }

  // 2. Construct cubic Bezier curve segments
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < n - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;

    const cp1x = p1.x + dx * smoothness;
    const cp1y = p1.y + slopes[i] * dx * smoothness;
    const cp2x = p2.x - dx * smoothness;
    const cp2y = p2.y - slopes[i + 1] * dx * smoothness;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

/**
 * Computes exact (x, y) coordinates and tangent angle along the cubic highway
 * for any fractional progress t in [0, N - 1].
 */
function getRoadPointAndAngle(
  t: number,
  points: MilestonePoint[],
  smoothness: number = 0.48
): { x: number; y: number; angle: number } {
  const n = points.length;
  if (n < 2) return { x: 0, y: 0, angle: 0 };

  const clampedT = Math.max(0, Math.min(n - 1, t));
  const i = Math.min(Math.floor(clampedT), n - 2);
  const u = clampedT - i;

  const p1 = points[i];
  const p2 = points[i + 1];
  const dx = p2.x - p1.x;

  // Level tangents at peaks and valleys
  const cp1x = p1.x + dx * smoothness;
  const cp1y = p1.y;
  const cp2x = p2.x - dx * smoothness;
  const cp2y = p2.y;

  // Cubic Bezier interpolation
  const omt = 1 - u;
  const omt2 = omt * omt;
  const omt3 = omt2 * omt;
  const u2 = u * u;
  const u3 = u2 * u;

  const x =
    omt3 * p1.x +
    3 * omt2 * u * cp1x +
    3 * omt * u2 * cp2x +
    u3 * p2.x;

  const y =
    omt3 * p1.y +
    3 * omt2 * u * cp1y +
    3 * omt * u2 * cp2y +
    u3 * p2.y;

  // First derivative for tangent direction
  const dxdt =
    3 * omt2 * (cp1x - p1.x) +
    6 * omt * u * (cp2x - cp1x) +
    3 * u2 * (p2.x - cp2x);

  const dydt =
    3 * omt2 * (cp1y - p1.y) +
    6 * omt * u * (cp2y - cp1y) +
    3 * u2 * (p2.y - cp2y);

  const angle = (Math.atan2(dydt, Math.max(1, dxdt)) * 180) / Math.PI;

  return { x, y, angle };
}

/**
 * Maps linear scroll progress (0..1) into a stepped milestone progress (0..N-1)
 * with comfortable dwell zones at each year destination.
 */
function progressToMilestone(p: number, N: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return N - 1;

  const totalSegments = N - 1;
  const raw = p * totalSegments;
  const k = Math.min(Math.floor(raw), totalSegments - 1);
  const frac = raw - k;

  // Dwell phase at the milestone
  if (frac <= DWELL_RATIO) {
    return k;
  }

  // Smooth cosine acceleration/deceleration to next year
  const travelT = (frac - DWELL_RATIO) / (1 - DWELL_RATIO);
  const smooth = 0.5 - 0.5 * Math.cos(Math.PI * travelT);
  return k + smooth;
}

/* ─────────────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
   ───────────────────────────────────────────────────────────────────────── */

const pinBounceVariants: Variants = {
  inactive: {
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  active: {
    y: [0, -24, 0, -9, 0, -3, 0],
    transition: {
      duration: 0.75,
      times: [0, 0.32, 0.58, 0.74, 0.86, 0.94, 1],
      ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
    },
  },
};

const shadowPulseVariants: Variants = {
  inactive: {
    opacity: 0.25,
    transition: { duration: 0.3 },
  },
  active: {
    opacity: [0.55, 0.18, 0.6, 0.3, 0.58, 0.45, 0.55],
    transition: {
      duration: 0.75,
      times: [0, 0.32, 0.58, 0.74, 0.86, 0.94, 1],
      ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   SUBCOMPONENTS
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Pulsing neon charging ring around the active map pin
 */
const PinChargingRing: React.FC<{
  index: number;
  primaryColor: string;
  opacity: MotionValue<number>;
}> = React.memo(({ index, primaryColor, opacity }) => (
  <motion.div
    className="glow-ring absolute w-[70px] h-[70px] pointer-events-none z-0 transform-gpu"
    style={{
      left: "50%",
      top: 32,
      x: "-50%",
      y: "-50%",
      opacity,
    }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <filter id={`milestoneRingGlow-${index}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="41"
        fill="none"
        stroke={primaryColor}
        strokeWidth="4"
        filter={`url(#milestoneRingGlow-${index})`}
      />
      <circle
        cx="50"
        cy="50"
        r="41"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity="0.95"
      />
    </svg>
  </motion.div>
));
PinChargingRing.displayName = "PinChargingRing";

/**
 * Teardrop map pin housing the CFOCO chicken emblem
 */
const TeardropPinBody: React.FC<{
  index: number;
  isRed: boolean;
  primaryColor: string;
}> = React.memo(({ index, isRed, primaryColor }) => (
  <div className="relative w-[64px] h-[82px] flex flex-col items-center z-10">
    <svg viewBox="-32 -32 64 82" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={`pinGrad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#141c2d" />
          <stop offset="60%" stopColor="#0d1422" />
          <stop offset="100%" stopColor={isRed ? "#3b0c10" : "#08263a"} />
        </linearGradient>
      </defs>
      {/* Teardrop contour */}
      <path
        d="M 0 -28 A 28 28 0 0 1 21 18.5 L 0 46 L -21 18.5 A 28 28 0 0 1 0 -28 Z"
        fill={`url(#pinGrad-${index})`}
        stroke={primaryColor}
        strokeWidth="1.8"
        filter="drop-shadow(0 6px 14px rgba(0,0,0,0.85))"
      />
      {/* Inner circular frame */}
      <circle
        cx="0"
        cy="0"
        r="22"
        fill="#080e1b"
        stroke={isRed ? "rgba(239, 68, 68, 0.45)" : "rgba(0, 212, 255, 0.45)"}
        strokeWidth="1"
      />
    </svg>

    {/* Center chicken emblem */}
    <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-7 h-7 flex items-center justify-center pointer-events-none">
      <div className="relative w-6 h-6">
        <Image
          src="/chicken_logo.svg"
          alt="CFOCO Chicken Icon"
          fill
          className="object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        />
      </div>
    </div>
  </div>
));
TeardropPinBody.displayName = "TeardropPinBody";

/**
 * Milestone story content (Year, Title, Descriptions)
 * Reveals strictly when the user reaches each destination.
 */
const MilestoneStoryContent: React.FC<{
  data: Milestone;
  primaryColor: string;
  isRed: boolean;
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
}> = React.memo(({ data, primaryColor, isRed, opacity, y, scale }) => (
  <motion.div
    className="absolute -translate-x-1/2 flex flex-col items-center text-center w-[290px] sm:w-[320px] pointer-events-none"
    style={{
      opacity,
      y,
      scale,
    }}
  >
    {/* Year Header with Neon Double-Glow */}
    <div className="relative inline-block mb-1 sm:mb-1.5">
      <span
        className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-wider inline-block select-none"
        style={{ color: primaryColor }}
      >
        {data.year}
      </span>
      <motion.span
        className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-wider inline-block absolute inset-0 select-none pointer-events-none transform-gpu"
        style={{
          color: primaryColor,
          textShadow: isRed
            ? "0 0 8px rgba(239, 68, 68, 0.95), 0 0 16px rgba(239, 68, 68, 0.6)"
            : "0 0 8px rgba(0, 212, 255, 0.95), 0 0 16px rgba(0, 212, 255, 0.6)",
          opacity,
        }}
      >
        {data.year}
      </motion.span>
    </div>

    {/* Milestone Title */}
    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-cyan-300 mb-1 sm:mb-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
      {data.title}
    </h3>

    {/* Description Lines */}
    <div className="text-slate-300 text-xs sm:text-base font-normal leading-[1.2] px-2">
      <p>{data.descLine1}</p>
      <p>{data.descLine2}</p>
    </div>
  </motion.div>
));
MilestoneStoryContent.displayName = "MilestoneStoryContent";

/**
 * Milestone Marker: Composes ground shadow, map pin, and destination story
 */
const MilestoneMarker: React.FC<{
  data: Milestone;
  index: number;
  point: MilestonePoint;
  smoothMilestone: MotionValue<number>;
  onSelect?: (idx: number) => void;
}> = React.memo(({ data, index, point, smoothMilestone, onSelect }) => {
  const isRed = data.theme === "red" || (!data.theme && index % 2 === 0);
  const primaryColor = isRed ? "#EF4444" : "#00D4FF";

  // Distance from this milestone station in float units
  const distMotion = useTransform(smoothMilestone, (m) => Math.abs(m - index));

  const [isActive, setIsActive] = useState(index === 0);

  useMotionValueEvent(distMotion, "change", (dist) => {
    const active = dist < 0.16;
    if (active !== isActive) {
      setIsActive(active);
    }
  });

  // Charging ring glow: active upon arrival
  const ringOpacity = useTransform(distMotion, (dist) => {
    if (dist >= 0.24) return 0;
    if (dist <= 0.08) return 1;
    return (0.24 - dist) / (0.24 - 0.08);
  });

  // Map pin opacity: subtle in distance, fully illuminated on approach
  const pinOpacity = useTransform(distMotion, (dist) => {
    if (dist >= 0.75) return 0.25;
    if (dist <= 0.18) return 1;
    return 0.25 + 0.75 * ((0.75 - dist) / (0.75 - 0.18));
  });

  // Content reveal: STRICTLY ONLY WHEN REACHING THE DESTINATION
  const contentOpacity = useTransform(distMotion, (dist) => {
    if (dist >= FADE_DISTANCE_THRESHOLD) return 0;
    if (dist <= FADE_DISTANCE_TARGET) return 1;
    const t = (FADE_DISTANCE_THRESHOLD - dist) / (FADE_DISTANCE_THRESHOLD - FADE_DISTANCE_TARGET);
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
  });

  const contentY = useTransform(distMotion, (dist) => {
    if (dist >= FADE_DISTANCE_THRESHOLD) return 18;
    if (dist <= FADE_DISTANCE_TARGET) return 0;
    const t = (FADE_DISTANCE_THRESHOLD - dist) / (FADE_DISTANCE_THRESHOLD - FADE_DISTANCE_TARGET);
    return (1 - t) * 18;
  });

  const contentScale = useTransform(distMotion, (dist) => {
    if (dist >= FADE_DISTANCE_THRESHOLD) return 0.88;
    if (dist <= FADE_DISTANCE_TARGET) return 1;
    const t = (FADE_DISTANCE_THRESHOLD - dist) / (FADE_DISTANCE_THRESHOLD - FADE_DISTANCE_TARGET);
    return 0.88 + 0.12 * t;
  });

  return (
    <div
      className="absolute pointer-events-auto select-none"
      style={{
        left: point.x,
        top: 0,
      }}
      onClick={() => onSelect?.(index)}
    >
      {/* Ground Contact Shadow */}
      <motion.div
        className="absolute -translate-x-1/2 pointer-events-none rounded-full"
        style={{
          top: point.y - 4,
          left: 0,
          width: 32,
          height: 8,
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 75%)",
        }}
        variants={shadowPulseVariants}
        animate={isActive ? "active" : "inactive"}
      />

      {/* Map Pin */}
      <motion.div
        className="absolute -translate-x-1/2 flex flex-col items-center transform-gpu cursor-pointer"
        style={{
          top: point.y - 78,
          opacity: pinOpacity,
        }}
        variants={pinBounceVariants}
        animate={isActive ? "active" : "inactive"}
      >
        <PinChargingRing
          index={index}
          primaryColor={primaryColor}
          opacity={ringOpacity}
        />
        <TeardropPinBody
          index={index}
          isRed={isRed}
          primaryColor={primaryColor}
        />
      </motion.div>

      {/* Story Content: Revealed strictly at destination */}
      <div style={{ position: "absolute", top: point.y + 44, left: 0 }}>
        <MilestoneStoryContent
          data={data}
          primaryColor={primaryColor}
          isRed={isRed}
          opacity={contentOpacity}
          y={contentY}
          scale={contentScale}
        />
      </div>
    </div>
  );
});
MilestoneMarker.displayName = "MilestoneMarker";

/* ─────────────────────────────────────────────────────────────────────────
   MAIN OBSESSION HIGHWAY COMPONENT
   ───────────────────────────────────────────────────────────────────────── */

const Obsession: React.FC<ObsessionProps> = ({ items }) => {
  const milestones = items && items.length > 0 ? items : defaultMilestones;
  const N = milestones.length;

  const targetRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(targetRef, { margin: "200px 0px" });

  const [viewportWidth, setViewportWidth] = useState<number>(1440);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Responsive viewport dimensions
  useEffect(() => {
    let lastW = window.innerWidth;
    setViewportWidth(lastW);
    setIsMobile(lastW < 768);

    const handleResize = () => {
      const w = window.innerWidth;
      if (Math.abs(w - lastW) > 10) {
        lastW = w;
        setViewportWidth(w);
        setIsMobile(w < 768);
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const config = ROAD_CONFIG;
  const spacing = isMobile ? config.spacingMobile : config.spacingDesktop;
  const startX = isMobile ? config.startXMobile : config.startXDesktop;
  const heights = isMobile ? config.milestoneHeightsMobile : config.milestoneHeightsDesktop;

  // Milestone points with their precise X and Y coordinates
  const milestonePoints: MilestonePoint[] = useMemo(() => {
    return milestones.map((_, i) => ({
      x: startX + i * spacing,
      y: heights[i % heights.length],
    }));
  }, [milestones, spacing, startX, heights]);

  // Stepped progress with dwell zones mapped to physics spring
  const rawMilestoneProgress = useTransform(scrollYProgress, (p) =>
    progressToMilestone(p, N)
  );

  const smoothMilestone = useSpring(rawMilestoneProgress, {
    stiffness: 150,
    damping: 24,
    mass: 0.28,
  });

  // Camera tracking in X and Y to keep road smoothly centered
  const trackX = useTransform(smoothMilestone, (m) => {
    const pt = getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness);
    return viewportWidth / 2 - pt.x;
  });

  const trackY = useTransform(smoothMilestone, (m) => {
    const pt = getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness);
    return (ROAD_MEDIAN_Y - pt.y) * 0.42;
  });

  // Continuous highway SVG spline that spans edge-to-edge
  const { roadPath, minX, maxX } = useMemo(() => {
    const pts: RoadPoint[] = [];
    const EXTENSION = isMobile ? 650 : 2000;

    // 1. Pre-road extension (to the left)
    const leftSteps = Math.ceil(EXTENSION / (spacing * 0.5));
    for (let k = leftSteps; k >= 1; k--) {
      const x = startX - k * spacing * 0.5;
      const y = k % 2 === 1 ? heights[1] : heights[0];
      pts.push({ x, y, isPeakOrValley: true });
    }

    // 2. Road through milestones: alternating High and Low
    for (let i = 0; i < milestonePoints.length; i++) {
      pts.push({ ...milestonePoints[i], isPeakOrValley: true });
    }

    // 3. Post-road extension (to the right)
    const last = milestonePoints[milestonePoints.length - 1];
    const rightSteps = Math.ceil(EXTENSION / (spacing * 0.5));
    for (let k = 1; k <= rightSteps; k++) {
      const x = last.x + k * spacing * 0.5;
      const y = k % 2 === 1 ? heights[0] : heights[1];
      pts.push({ x, y, isPeakOrValley: true });
    }

    const minRoadX = Math.min(startX - EXTENSION, pts[0]?.x ?? (startX - EXTENSION));
    const maxRoadX = Math.max(last.x + EXTENSION, pts[pts.length - 1]?.x ?? (last.x + EXTENSION));
    const roadSvg = buildSmoothHighwaySpline(pts, config.curveSmoothness);

    return {
      roadPath: roadSvg,
      minX: minRoadX,
      maxX: maxRoadX,
    };
  }, [milestonePoints, spacing, startX, heights, config.curveSmoothness, isMobile]);

  // Center dashed divider line cruising flow
  const animDashOffset = useMotionValue(0);
  const lastScrollProgressRef = useRef(0);

  useAnimationFrame((_, delta) => {
    if (isMobile || !isInView) return;

    const safeDelta = Math.min(delta, 64);
    const baseStep = (safeDelta / 1000) * config.lineSpeed * config.lineDirection;
    const currentP = scrollYProgress.get();
    const scrollDelta =
      (currentP - lastScrollProgressRef.current) * config.lineScrollBoost * config.lineDirection;

    lastScrollProgressRef.current = currentP;
    animDashOffset.set(animDashOffset.get() + baseStep + scrollDelta);
  });

  const mobileDashOffset = useTransform(
    scrollYProgress,
    [0, 1],
    [0, config.lineScrollBoost * config.lineDirection * 0.8]
  );

  const activeDashOffset = isMobile ? mobileDashOffset : animDashOffset;

  /**
   * Smoothly drives directly to a specific milestone year when clicking a pin
   */
  const scrollToMilestone = useCallback(
    (index: number) => {
      if (!targetRef.current) return;
      const rect = targetRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top;
      const totalTravel = targetRef.current.offsetHeight - window.innerHeight;
      const targetP = index / Math.max(1, N - 1);
      const targetY = scrollTop + targetP * totalTravel;

      window.scrollTo({
        top: targetY,
        behavior: "smooth",
      });
    },
    [N]
  );

  return (
    <div
      ref={targetRef}
      className="relative w-full bg-transparent select-none overflow-clip"
      style={{ height: `${N * 85 + 100}vh` }}
    >
      <section
        className={`sticky top-0 w-full h-screen supports-[height:100svh]:h-[100svh] overflow-hidden flex flex-col justify-center ${matter.className} bg-transparent`}
      >
        {/* Section Header */}
        <header className="w-full text-center space-y-1 sm:space-y-2 px-4 absolute top-8 sm:top-12 md:top-14 left-0 right-0 z-20 pointer-events-none">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            13 Years
          </h2>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            One Obsession
          </h2>
        </header>

        {/* Winding Highway Canvas */}
        <div className="relative w-full h-full flex flex-col justify-center overflow-visible pointer-events-none">
          <motion.div
            className="absolute left-0 top-[26%] sm:top-[24%] md:top-[22%] h-[700px] pointer-events-none transform-gpu will-change-transform"
            style={{
              x: trackX,
              y: trackY,
            }}
          >
            {/* SVG Road Surface */}
            <svg
              className="absolute top-0 overflow-visible pointer-events-none"
              style={{
                left: minX,
                width: maxX - minX,
                height: ROAD_CANVAS_HEIGHT,
              }}
              viewBox={`${minX} 0 ${maxX - minX} ${ROAD_CANVAS_HEIGHT}`}
            >
              <defs>
                <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#182337" />
                  <stop offset="50%" stopColor="#101726" />
                  <stop offset="100%" stopColor="#0b101b" />
                </linearGradient>
              </defs>

              {/* 1. Road Soft Outer Shadow */}
              <path
                d={roadPath}
                fill="none"
                stroke="rgba(0, 0, 0, 0.28)"
                strokeWidth={
                  (isMobile ? config.shadowWidthMobile : config.shadowWidthDesktop) +
                  (isMobile ? 10 : 16)
                }
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 2. Road Deep Inner Shadow */}
              <path
                d={roadPath}
                fill="none"
                stroke="rgba(0, 0, 0, 0.65)"
                strokeWidth={isMobile ? config.shadowWidthMobile : config.shadowWidthDesktop}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. Asphalt Road Bed */}
              <path
                d={roadPath}
                fill="none"
                stroke="url(#asphaltGrad)"
                strokeWidth={isMobile ? config.roadWidthMobile : config.roadWidthDesktop}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 4. Center Dashed Divider Line */}
              <motion.path
                d={roadPath}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={isMobile ? "2.2" : "2.8"}
                strokeDasharray={isMobile ? "10 12" : "14 16"}
                style={{
                  strokeDashoffset: activeDashOffset,
                }}
                opacity="0.85"
                strokeLinecap="round"
              />
            </svg>

            {/* Road Location Pins & Milestone Stories */}
            {milestones.map((data, index) => (
              <MilestoneMarker
                key={data.year}
                data={data}
                index={index}
                point={milestonePoints[index]}
                smoothMilestone={smoothMilestone}
                onSelect={scrollToMilestone}
              />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Obsession;