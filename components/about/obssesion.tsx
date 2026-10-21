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

export interface Milestone {
  year: string;
  title: string;
  descLine1: string;
  descLine2: string;
  theme?: "red" | "cyan";
}

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

// ============================================================================
// ROAD CURVE CONTROLLER: Modify these values to adjust the curves to your taste!
// ============================================================================
export const ROAD_CONFIG = {
  // Horizontal spacing between milestone pins
  spacingDesktop: 760,
  spacingMobile: 420,

  // Start position for the first milestone (2011)
  startXDesktop: 500,
  startXMobile: 260,

  // Y-axis height for each milestone: Strictly alternates HIGH and LOW for a proper curvy road!
  // [2011 (High), 2014 (Low), 2018 (High), 2019 (Low), 2020 (High), 2022 (Low)]
  milestoneHeightsDesktop: [170, 340, 170, 340, 170, 340],
  milestoneHeightsMobile:  [200, 340, 200, 340, 200, 340],

  // Curve smoothness factor (0.42 - 0.50 gives a beautiful curvy highway flow)
  curveSmoothness: 0.48,

  // Road thickness & shadow
  roadWidthDesktop: 54,
  roadWidthMobile: 42,
  shadowWidthDesktop: 64,
  shadowWidthMobile: 52,

  // Road dashed divider line motion settings
  lineSpeed: 52,         // Continuous cruising flow (pixels per second)
  lineScrollBoost: 2600, // Dynamic dash acceleration while scrolling
  lineDirection: -1,     // -1: highway drive flow (along with road translation), 1: forward time flow
};

interface ObsessionProps {
  items?: Milestone[];
}

interface RoadPoint {
  x: number;
  y: number;
  isPeakOrValley?: boolean;
}

interface MilestonePoint {
  x: number;
  y: number;
}

/**
 * Builds a mathematically continuous, monotonic cubic Bezier spline.
 * Guarantees zero kinks, zero bumps, and level horizontal tangent at peaks and valleys.
 */
function buildSmoothHighwaySpline(
  points: RoadPoint[],
  smoothness: number = 0.44
): string {
  if (points.length < 2) return "";

  const n = points.length;
  const slopes: number[] = new Array(n).fill(0);

  // 1. Calculate tangent slopes
  for (let i = 0; i < n; i++) {
    if (i === 0) {
      slopes[i] = 0;
    } else if (i === n - 1) {
      slopes[i] = 0;
    } else {
      const prev = points[i - 1];
      const cur = points[i];
      const next = points[i + 1];

      // At peaks or valleys, slope must be horizontal (0)
      const isExtrema =
        points[i].isPeakOrValley ||
        (cur.y - prev.y) * (next.y - cur.y) <= 0;

      if (isExtrema) {
        slopes[i] = 0;
      } else {
        // Average slope
        slopes[i] = (next.y - prev.y) / (next.x - prev.x);
      }
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
 * between milestones for any fractional progress t in [0, N - 1].
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

  // Tangents at milestone peaks & valleys are level (slope = 0)
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

  // Derivative for tangent direction
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
 * with comfortable dwell zones at each year, giving the user a clear feeling
 * of traveling along the highway from one year to the next.
 */
function progressToMilestone(p: number, N: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return N - 1;

  const totalSegments = N - 1;
  const raw = p * totalSegments;
  const k = Math.min(Math.floor(raw), totalSegments - 1);
  const frac = raw - k;

  // First 32% of each scroll slice is a stable dwell at the milestone
  const DWELL = 0.32;
  if (frac <= DWELL) {
    return k;
  }

  // Remaining 68% is smooth accelerating/decelerating highway cruise to next year
  const travelT = (frac - DWELL) / (1 - DWELL);
  const smooth = 0.5 - 0.5 * Math.cos(Math.PI * travelT);
  return k + smooth;
}

// Pure vertical Google Maps drop & bounce
const pinVariants: Variants = {
  inactive: {
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
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

// Fixed ground shadow
const shadowVariants: Variants = {
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
   ROAD TRAVELER: CF&CO Crispy Courier driving along the road curves
   ───────────────────────────────────────────────────────────────────────── */
const RoadTraveler: React.FC<{ themeColor?: string }> = ({
  themeColor = "#FFBF00",
}) => {
  return (
    <g className="pointer-events-none select-none">
      {/* Ground Contact Shadow on Asphalt */}
      <ellipse
        cx="-2"
        cy="15"
        rx="34"
        ry="7"
        fill="rgba(0, 0, 0, 0.8)"
        filter="blur(2.5px)"
      />

      {/* Forward Headlight Beam illuminating the road ahead */}
      <polygon
        points="22,0 160,-26 160,26 22,5"
        fill="url(#travelerHeadlightBeam)"
        opacity="0.55"
      />

      {/* Headlight bulb flare */}
      <circle cx="24" cy="2" r="7" fill="#FFF5C4" filter="blur(2.5px)" opacity="0.9" />

      {/* Back Wheel */}
      <circle cx="-20" cy="11" r="9" fill="#0A0E17" stroke="#334155" strokeWidth="2.5" />
      <circle cx="-20" cy="11" r="4.5" fill="#1E293B" stroke={themeColor} strokeWidth="1.2" />

      {/* Front Wheel */}
      <circle cx="20" cy="11" r="9" fill="#0A0E17" stroke="#334155" strokeWidth="2.5" />
      <circle cx="20" cy="11" r="4.5" fill="#1E293B" stroke={themeColor} strokeWidth="1.2" />

      {/* Chassis Frame */}
      <path
        d="M -20 11 L -8 4 L 4 4 L 18 11"
        stroke="#475569"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Underglow Neon */}
      <ellipse
        cx="0"
        cy="9"
        rx="18"
        ry="4"
        fill={themeColor}
        opacity="0.45"
        filter="blur(3px)"
      />

      {/* Scooter Body Streamlined Fairing */}
      <path
        d="M -16 4 L -6 -6 L 12 -6 L 24 2 L 14 6 L -14 6 Z"
        fill="#0F172A"
        stroke="#334155"
        strokeWidth="1.2"
      />

      {/* Racing Stripe */}
      <path
        d="M -12 2 L 14 2"
        stroke={themeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* CF&CO Delivery Hotbox (carrying the crispy formula) */}
      <rect
        x="-22"
        y="-18"
        width="18"
        height="18"
        rx="3"
        fill="#1E293B"
        stroke={themeColor}
        strokeWidth="1.5"
      />
      {/* Chicken emblem silhouette on hotbox */}
      <circle cx="-13" cy="-9" r="5" fill="#0F172A" />
      <path
        d="M -15 -8 Q -13 -12 -11 -8 Q -12 -6 -15 -8 Z"
        fill={themeColor}
      />

      {/* Rider Helmet & Visor */}
      <circle cx="-1" cy="-14" r="7.5" fill="#1E293B" stroke="#475569" strokeWidth="1" />
      <path
        d="M 2 -16 Q 6 -14 5 -11 Q 2 -11 1 -13 Z"
        fill="#38BDF8"
        opacity="0.95"
      />

      {/* Rider Body */}
      <path d="M -6 -6 Q -2 -10 6 -6 L 8 4 L -4 4 Z" fill="#0F172A" />

      {/* Handlebars */}
      <path d="M 8 -4 L 14 -2" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

      {/* Red Taillight on Hotbox */}
      <rect x="-24" y="-12" width="2.5" height="5" rx="1" fill="#EF4444" />
      <circle cx="-24" cy="-9.5" r="3" fill="#EF4444" filter="blur(2px)" opacity="0.9" />
    </g>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   MILESTONE MARKER: Location Pin & Story Card
   ───────────────────────────────────────────────────────────────────────── */
const MilestoneMarker = React.memo(({
  data,
  index,
  point,
  smoothMilestone,
  onSelect,
}: {
  data: Milestone;
  index: number;
  point: MilestonePoint;
  smoothMilestone: MotionValue<number>;
  onSelect?: (idx: number) => void;
}) => {
  const isRed = data.theme === "red" || (!data.theme && index % 2 === 0);

  // Distance to this milestone station
  const distMotion = useTransform(smoothMilestone, (m) => Math.abs(m - index));

  const [isActive, setIsActive] = useState(index === 0);

  useMotionValueEvent(distMotion, "change", (dist) => {
    const active = dist < 0.16;
    if (active !== isActive) {
      setIsActive(active);
    }
  });

  // Pin charging ring only glows on arrival
  const ringOpacity = useTransform(distMotion, (dist) => {
    if (dist >= 0.24) return 0;
    if (dist <= 0.08) return 1;
    return (0.24 - dist) / (0.24 - 0.08);
  });

  // Map pin is subtle in the distance and becomes fully opaque on arrival
  const pinOpacity = useTransform(distMotion, (dist) => {
    if (dist >= 0.75) return 0.25;
    if (dist <= 0.18) return 1;
    return 0.25 + 0.75 * ((0.75 - dist) / (0.75 - 0.18));
  });

  // CONTENT (Year, Title, Description) SHOWS ONLY WHEN REACHING THE DESTINATION
  const contentOpacity = useTransform(distMotion, (dist) => {
    if (dist >= 0.25) return 0;
    if (dist <= 0.08) return 1;
    const t = (0.25 - dist) / (0.25 - 0.08);
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
  });

  const contentY = useTransform(distMotion, (dist) => {
    if (dist >= 0.25) return 18;
    if (dist <= 0.08) return 0;
    const t = (0.25 - dist) / (0.25 - 0.08);
    return (1 - t) * 18;
  });

  const contentScale = useTransform(distMotion, (dist) => {
    if (dist >= 0.25) return 0.88;
    if (dist <= 0.08) return 1;
    const t = (0.25 - dist) / (0.25 - 0.08);
    return 0.88 + 0.12 * t;
  });

  const primaryColor = isRed ? "#EF4444" : "#00D4FF";

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
        variants={shadowVariants}
        animate={isActive ? "active" : "inactive"}
      />

      {/* 1. Map Pin: pure vertical bounce without any scale expansion */}
      <motion.div
        className="absolute -translate-x-1/2 flex flex-col items-center transform-gpu cursor-pointer"
        style={{
          top: point.y - 78,
          opacity: pinOpacity,
        }}
        variants={pinVariants}
        animate={isActive ? "active" : "inactive"}
      >
        {/* Outer Charging Ring Glow */}
        <motion.div
          className="glow-ring absolute w-[70px] h-[70px] sm:w-[70px] sm:h-[70px] pointer-events-none z-0 transform-gpu"
          style={{
            left: "50%",
            top: 32,
            x: "-50%",
            y: "-50%",
            opacity: ringOpacity,
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              <filter id={`trainRingGlow-${index}`} x="-60%" y="-60%" width="220%" height="220%">
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
              filter={`url(#trainRingGlow-${index})`}
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

        {/* Teardrop Pin Body */}
        <div className="relative w-[64px] h-[82px] flex flex-col items-center z-10">
          <svg viewBox="-32 -32 64 82" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`pinBodyGrad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#141c2d" />
                <stop offset="60%" stopColor="#0d1422" />
                <stop offset="100%" stopColor={isRed ? "#3b0c10" : "#08263a"} />
              </linearGradient>
            </defs>
            {/* Map pin teardrop path */}
            <path
              d="M 0 -28 A 28 28 0 0 1 21 18.5 L 0 46 L -21 18.5 A 28 28 0 0 1 0 -28 Z"
              fill={`url(#pinBodyGrad-${index})`}
              stroke={primaryColor}
              strokeWidth="1.8"
              filter="drop-shadow(0 6px 14px rgba(0,0,0,0.85))"
            />
            {/* Inner Circular Frame for chicken icon */}
            <circle
              cx="0"
              cy="0"
              r="22"
              fill="#080e1b"
              stroke={isRed ? "rgba(239, 68, 68, 0.45)" : "rgba(0, 212, 255, 0.45)"}
              strokeWidth="1"
            />
          </svg>

          {/* Chicken Icon inside head of pin */}
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
      </motion.div>

      {/* 2. Text Content: Sits cleanly below the road ribbon - SHOWS ONLY ON ARRIVAL */}
      <motion.div
        className="absolute -translate-x-1/2 flex flex-col items-center text-center w-[290px] sm:w-[320px] pointer-events-none"
        style={{
          top: point.y + 44,
          opacity: contentOpacity,
          y: contentY,
          scale: contentScale,
        }}
      >
        {/* Year: Glows intensely when centered */}
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
              opacity: contentOpacity,
            }}
          >
            {data.year}
          </motion.span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-cyan-300 mb-1 sm:mb-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          {data.title}
        </h3>

        {/* Description */}
        <div className="text-slate-300 text-xs sm:text-base font-normal leading-[1.2] px-2">
          <p>{data.descLine1}</p>
          <p>{data.descLine2}</p>
        </div>
      </motion.div>
    </div>
  );
});

MilestoneMarker.displayName = "MilestoneMarker";

/* ─────────────────────────────────────────────────────────────────────────
   MAIN OBSESSION COMPONENT
   ───────────────────────────────────────────────────────────────────────── */
const Obsession: React.FC<ObsessionProps> = ({ items }) => {
  const milestones = items && items.length > 0 ? items : defaultMilestones;
  const N = milestones.length;

  const targetRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(targetRef, { margin: "200px 0px" });

  const [viewportWidth, setViewportWidth] = useState<number>(1440);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number>(0);
  const [isTraveling, setIsTraveling] = useState<boolean>(false);

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

  // Pull settings from ROAD_CONFIG
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

  // Stepped milestone progress (0..N-1) with comfortable dwell zones at each year
  const rawMilestoneProgress = useTransform(scrollYProgress, (p) =>
    progressToMilestone(p, N)
  );

  // Physics spring smoothing for organic acceleration and highway deceleration
  const smoothMilestone = useSpring(rawMilestoneProgress, {
    stiffness: 150,
    damping: 24,
    mass: 0.28,
  });

  // Track active milestone index and traveling state for UI HUD
  useMotionValueEvent(smoothMilestone, "change", (m) => {
    const rounded = Math.min(N - 1, Math.max(0, Math.round(m)));
    if (rounded !== activeMilestoneIndex) {
      setActiveMilestoneIndex(rounded);
    }
    const distToStation = Math.abs(m - rounded);
    setIsTraveling(distToStation > 0.12);
  });

  // Smooth camera tracking: keep the road traveler centered horizontally and vertically framed
  const trackX = useTransform(smoothMilestone, (m) => {
    const pt = getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness);
    return viewportWidth / 2 - pt.x;
  });

  const trackY = useTransform(smoothMilestone, (m) => {
    const pt = getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness);
    // Subtle Y undulation keeps High (170) and Low (340) road points perfectly framed
    return (255 - pt.y) * 0.42;
  });

  // Traveler position and rotation angle directly on the asphalt curve
  const travelerX = useTransform(
    smoothMilestone,
    (m) => getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness).x
  );
  const travelerY = useTransform(
    smoothMilestone,
    (m) => getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness).y
  );
  const travelerAngle = useTransform(
    smoothMilestone,
    (m) => getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness).angle
  );

  // Generate continuous winding highway ribbon that spans edge-to-edge across any screen.
  const { roadPath, minX, maxX } = useMemo(() => {
    const pts: RoadPoint[] = [];
    const EXTENSION = isMobile ? 650 : 2000;

    // 1. Pre-road extension (thousands of pixels to the left)
    const leftSteps = Math.ceil(EXTENSION / (spacing * 0.5));
    for (let k = leftSteps; k >= 1; k--) {
      const x = startX - k * spacing * 0.5;
      const y = k % 2 === 1 ? heights[1] : heights[0];
      pts.push({ x, y, isPeakOrValley: true });
    }

    // 2. Road passing through milestones: strictly alternating High and Low
    for (let i = 0; i < milestonePoints.length; i++) {
      pts.push({ ...milestonePoints[i], isPeakOrValley: true });
    }

    // 3. Post-road extension (thousands of pixels to the right)
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

  // Road dashed divider line continuous animation
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
   * Smoothly drives directly to a specific milestone year on click
   */
  const scrollToMilestone = useCallback(
    (index: number) => {
      if (!targetRef.current) return;
      const rect = targetRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top;
      const totalTravel = targetRef.current.offsetHeight - window.innerHeight;

      // Each milestone index corresponds to scroll checkpoint index / (N - 1)
      const targetP = index / Math.max(1, N - 1);
      const targetY = scrollTop + targetP * totalTravel;

      window.scrollTo({
        top: targetY,
        behavior: "smooth",
      });
    },
    [N]
  );

  const activeThemeColor =
    milestones[activeMilestoneIndex]?.theme === "cyan" ? "#00D4FF" : "#EF4444";

  return (
    <div
      ref={targetRef}
      className="relative w-full bg-transparent select-none overflow-clip"
      style={{ height: `${N * 85 + 100}vh` }}
    >
      <section
        className={`sticky top-0 w-full h-screen supports-[height:100svh]:h-[100svh] overflow-hidden flex flex-col justify-center ${matter.className} bg-transparent`}
      >
        {/* Section Header (Centered at Top) */}
        <div className="w-full text-center space-y-1 sm:space-y-2 px-4 absolute top-8 sm:top-12 md:top-14 left-0 right-0 z-20 pointer-events-none">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            13 Years
          </h2>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            One Obsession
          </h2>
        </div>

        {/* Moving Roadmap Highway Canvas */}
        <div className="relative w-full h-full flex flex-col justify-center overflow-visible pointer-events-none">
          <motion.div
            className="absolute left-0 top-[26%] sm:top-[24%] md:top-[22%] h-[700px] pointer-events-none transform-gpu will-change-transform"
            style={{
              x: trackX,
              y: trackY,
            }}
          >
            {/* SVG Road Ribbon Only: spans from minX to maxX edge-to-edge */}
            <svg
              className="absolute top-0 overflow-visible pointer-events-none"
              style={{
                left: minX,
                width: maxX - minX,
                height: 700,
              }}
              viewBox={`${minX} 0 ${maxX - minX} 700`}
            >
              <defs>
                {/* Road surface asphalt gradient */}
                <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#182337" />
                  <stop offset="50%" stopColor="#101726" />
                  <stop offset="100%" stopColor="#0b101b" />
                </linearGradient>

                {/* Headlight beam gradient extending forward on the road */}
                <linearGradient
                  id="travelerHeadlightBeam"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#FFF7D0" stopOpacity="0.85" />
                  <stop offset="25%" stopColor="#FFE066" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#FFBF00" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FFBF00" stopOpacity="0" />
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

              {/* 4. Center White/Grey Dashed Divider Line */}
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

              {/* 5. Road Traveler (The CF&CO Courier Driving on the Road) - Commented out as requested */}
              {/* <motion.g
                style={{
                  x: travelerX,
                  y: travelerY,
                  rotate: travelerAngle,
                }}
              >
                <RoadTraveler themeColor={activeThemeColor} />
              </motion.g> */}
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