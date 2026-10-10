"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { matter } from "@/font/fonts";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

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
};

interface ObsessionProps {
  items?: Milestone[];
}

interface RoadPoint {
  x: number;
  y: number;
  isPeakOrValley?: boolean;
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

interface MilestonePoint {
  x: number;
  y: number;
}

const MilestoneMarker = ({
  data,
  index,
  N,
  point,
  scrollYProgress,
}: {
  data: Milestone;
  index: number;
  N: number;
  point: MilestonePoint;
  scrollYProgress: MotionValue<number>;
}) => {
  const isRed = data.theme === "red" || (!data.theme && index % 2 === 0);
  const targetPos = index / Math.max(1, N - 1);

  // Proximity to viewport center for active item
  const intensity = useTransform(scrollYProgress, (p) => {
    return Math.max(0, 1 - Math.abs(p - targetPos) / 0.22);
  });

  const ringOpacity = useTransform(intensity, (i) => i);
  const ringScale = useTransform(intensity, (i) => 0.9 + 0.16 * i);
  const markerScale = useTransform(intensity, (i) => 0.88 + 0.22 * i);
  const contentOpacity = useTransform(intensity, (i) => 0.35 + 0.65 * i);
  const contentScale = useTransform(intensity, (i) => 0.9 + 0.1 * i);

  const primaryColor = isRed ? "#EF4444" : "#00D4FF";

  const yearGlow = useTransform(
    intensity,
    [0, 0.45, 1],
    [
      "drop-shadow(0 0 0px rgba(0,0,0,0))",
      "drop-shadow(0 0 4px rgba(0,0,0,0.3))",
      isRed
        ? "drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))"
        : "drop-shadow(0 0 16px rgba(0, 212, 255, 0.95))",
    ]
  );

  return (
    <div
      className="absolute pointer-events-auto select-none"
      style={{
        left: point.x,
        top: 0,
      }}
    >
      {/* 1. Map Pin: tip touches the road surface at point.y */}
      <motion.div
        className="absolute -translate-x-1/2 flex flex-col items-center"
        style={{
          top: point.y - 78,
          scale: markerScale,
        }}
      >
        {/* Outer Charging Ring Glow (Exactly like before) */}
        <motion.div
          className="glow-ring absolute w-[104px] h-[104px] sm:w-[70px] sm:h-[70px] pointer-events-none z-0 transform-gpu"
          style={{
            left: "50%",
            top: 32,
            x: "-50%",
            y: "-50%",
            opacity: ringOpacity,
            scale: ringScale,
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
            {/* Map pin teardrop path: circle at top, tapering down to sharp tip at (0, 46) */}
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

      {/* 2. Text Content: Sits cleanly below the road ribbon */}
      <motion.div
        className="absolute -translate-x-1/2 flex flex-col items-center text-center w-[290px] sm:w-[320px] pointer-events-none"
        style={{
          top: point.y + 44,
          opacity: contentOpacity,
          scale: contentScale,
        }}
      >
        {/* Year: Glows intensely when centered */}
        <div className="mb-1 sm:mb-1.5">
          <motion.span
            className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-wider inline-block transform-gpu"
            style={{
              color: primaryColor,
              filter: yearGlow,
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
};

const Obsession: React.FC<ObsessionProps> = ({ items }) => {
  const milestones = items && items.length > 0 ? items : defaultMilestones;
  const N = milestones.length;

  const targetRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(1440);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setViewportWidth(w);
      setIsMobile(w < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
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

  // Generate continuous winding highway ribbon that spans edge-to-edge across any screen
  const { roadPath, minX, maxX } = useMemo(() => {
    const pts: RoadPoint[] = [];
    const EXTENSION = 4200; // Extra road span on both sides so it always hits screen edges

    // 1. Pre-road extension (thousands of pixels to the left)
    // Symmetrically alternates: Low -> High -> Low -> High into 2011 (which is High)
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
    // 2022 is Low (heights[1]). Symmetrically alternates: High -> Low -> High -> Low
    const last = milestonePoints[milestonePoints.length - 1];
    const rightSteps = Math.ceil(EXTENSION / (spacing * 0.5));
    for (let k = 1; k <= rightSteps; k++) {
      const x = last.x + k * spacing * 0.5;
      const y = k % 2 === 1 ? heights[0] : heights[1];
      pts.push({ x, y, isPeakOrValley: true });
    }

    const minRoadX = startX - EXTENSION;
    const maxRoadX = last.x + EXTENSION;
    const roadSvg = buildSmoothHighwaySpline(pts, config.curveSmoothness);

    return {
      roadPath: roadSvg,
      minX: minRoadX,
      maxX: maxRoadX,
    };
  }, [milestonePoints, spacing, startX, heights, config.curveSmoothness]);

  // Translate track so active milestone aligns directly with viewport center
  const firstX = milestonePoints[0]?.x || 0;
  const lastX = milestonePoints[N - 1]?.x || 1;
  const trackStartX = viewportWidth / 2 - firstX;
  const trackEndX = viewportWidth / 2 - lastX;

  const trackX = useTransform(scrollYProgress, [0, 1], [trackStartX, trackEndX]);

  return (
    <div
      ref={targetRef}
      className="relative w-full bg-transparent select-none"
      // Smooth scroll track
      style={{ height: `${N * 75 + 100}vh` }}
    >
      <section
        className={`sticky top-0 w-full h-screen supports-[height:100svh]:h-[100svh] overflow-hidden flex flex-col justify-center ${matter.className} bg-transparent`}
      >
        {/* Section Header (Centered at Top) */}
        <div className="w-full text-center space-y-1 sm:space-y-2 px-4 absolute top-10 sm:top-14 md:top-16 left-0 right-0 z-20 pointer-events-none">
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
            className="absolute left-0 top-[58%] sm:top-[50%] md:top-[22%] h-[700px] pointer-events-none transform-gpu"
            style={{
              x: trackX,
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
                {/* Soft road drop shadow filter */}
                <filter id="roadShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="8" result="shadowBlur" />
                  <feMerge>
                    <feMergeNode in="shadowBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Road surface asphalt gradient */}
                <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#182337" />
                  <stop offset="50%" stopColor="#101726" />
                  <stop offset="100%" stopColor="#0b101b" />
                </linearGradient>
              </defs>

              {/* 1. Road Heavy Shadow */}
              <path
                d={roadPath}
                fill="none"
                stroke="rgba(0, 0, 0, 0.6)"
                strokeWidth={isMobile ? config.shadowWidthMobile : config.shadowWidthDesktop}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#roadShadow)"
              />

              {/* 2. Asphalt Road Bed */}
              <path
                d={roadPath}
                fill="none"
                stroke="url(#asphaltGrad)"
                strokeWidth={isMobile ? config.roadWidthMobile : config.roadWidthDesktop}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. Center White/Grey Dashed Divider Line */}
              <path
                d={roadPath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.4"
                strokeDasharray={isMobile ? "10 12" : "14 16"}
                opacity="0.65"
              />
            </svg>

            {/* Road Location Pins & Milestone Stories */}
            {milestones.map((data, index) => (
              <MilestoneMarker
                key={data.year}
                data={data}
                index={index}
                N={N}
                point={milestonePoints[index]}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Obsession;