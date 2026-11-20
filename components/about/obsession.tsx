    "use client";

    import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
    import Image from "next/image";
    import { matter } from "@/font/fonts";
    import { useTranslation } from "react-i18next";
    import {
      motion,
      useScroll,
      useTransform,
      useMotionValueEvent,
      MotionValue,
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
        theme: "cyan",
      },
      {
        year: "2018",
        title: "Beyond Bordeaux",
        descLine1: "Second, Third, Fourth. Same Recipe.",
        descLine2: "Same Standard. No Shortcuts.",
        theme: "red",
      },
      {
        year: "2019",
        title: "The Cult Grows",
        descLine1: "Paris, Lyon, Marseille.",
        descLine2: "The Crunch Heard Across France.",
        theme: "cyan",
      },
      {
        year: "2020",
        title: "The Secret Formula",
        descLine1: "Perfected The 24-Hour Brine.",
        descLine2: "Crispy Outside, Juicy Inside.",
        theme: "red",
      },
      {
        year: "2022",
        title: "Going Global",
        descLine1: "New Continents, Same Obsession.",
        descLine2: "Never Freezing, Never Compromising.",
        theme: "cyan",
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

      // Road dashed divider line motion direction
      lineDirection: -1,
    } as const;

    // Transition & pacing constants
    const DWELL_RATIO = 0.38;             // Ratio of scroll spent docked at milestone station
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

      // The travel across all milestones completes at 76% of scroll progress.
      // The remaining 24% is a dedicated dwell buffer where the location pin
      // is stopped at the final milestone, glowing, and displaying the content
      // before the section unlocks to scroll into the next section.
      const END_TRAVEL_P = 0.76;

      if (p >= END_TRAVEL_P) {
        return N - 1;
      }

      const normP = p / END_TRAVEL_P;
      const totalSegments = N - 1;
      const raw = normP * totalSegments;
      const k = Math.min(Math.floor(raw), totalSegments - 1);
      const frac = raw - k;

      // Dwell phase at milestone k
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
        opacity: 0.35,
        scale: 0.85,
        transition: { duration: 0.3 },
      },
      active: {
        opacity: [0.55, 0.18, 0.6, 0.3, 0.58, 0.45, 0.55],
        scale: [1, 0.7, 1, 0.8, 1, 0.9, 1],
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
     * Pulsing neon charging ring around the active map pin.
     * Only illuminates when the pin has arrived and stopped at a milestone.
     */
    const PinChargingRing: React.FC<{
      primaryColor: string;
      opacity: MotionValue<number>;
    }> = React.memo(({ primaryColor, opacity }) => (
      <motion.div
        className="glow-ring absolute w-[76px] h-[76px] pointer-events-none z-0 transform-gpu"
        style={{
          left: "50%",
          top: 36,
          x: "-50%",
          y: "-50%",
          opacity,
        }}
      >
        <svg viewBox="-38 -38 76 76" className="w-full h-full overflow-visible">
          <defs>
            <filter id="travelingPinRingGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="0"
            cy="0"
            r="30"
            fill="none"
            stroke={primaryColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#travelingPinRingGlow)"
          />
          <circle
            cx="0"
            cy="0"
            r="30"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      </motion.div>
    ));
    PinChargingRing.displayName = "PinChargingRing";

    /**
     * Luminous location pin housing the CFOCO 3D chicken mascot.
     * Styled with a hollow circular window, brilliant glowing neon crest,
     * and rich vertical body gradient matching the official design.
     */
    const TeardropPinBody: React.FC<{
      isRed: boolean;
      primaryColor: string;
    }> = React.memo(({ isRed }) => {
      const R_out = 30;
      const R_in = 22.5;
      const Y_tip = 60;
      const xt = 25.98;
      const yt = 15.0;

      // Seamless compound teardrop geometry with hollow circular window:
      // Outer perimeter + inner circular hole rendered via evenodd fill rule
      const compoundPath = `M 0 ${Y_tip} L ${xt} ${yt} A ${R_out} ${R_out} 0 1 0 -${xt} ${yt} Z M 0 -${R_in} A ${R_in} ${R_in} 0 1 0 0 ${R_in} A ${R_in} ${R_in} 0 1 0 0 -${R_in} Z`;

      return (
        <div className="relative w-[72px] h-[98px] flex flex-col items-center z-10 pointer-events-none select-none">
          <svg viewBox="-36 -36 72 98" className="w-full h-full overflow-visible">
            <defs>
              {/* Blue Body Gradient */}
              <linearGradient id="pinBodyGrad_blue" x1="0%" y1="-30" x2="0%" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="28%" stopColor="#2563EB" />
                <stop offset="60%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>

              {/* Red Body Gradient */}
              <linearGradient id="pinBodyGrad_red" x1="0%" y1="-30" x2="0%" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="28%" stopColor="#DC2626" />
                <stop offset="60%" stopColor="#B91C1C" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </linearGradient>
            </defs>

            {/* 1. Main Teardrop Pin Body with Hollow Window (Evenodd fill) */}
            <path
              d={compoundPath}
              fill={`url(#${isRed ? "pinBodyGrad_red" : "pinBodyGrad_blue"})`}
              fillRule="evenodd"
              filter="drop-shadow(0 6px 14px rgba(0,0,0,0.85))"
            />

            {/* 2. Subtle Inner Rim around the circular window */}
            <circle
              cx="0"
              cy="0"
              r={R_in}
              fill="none"
              stroke={isRed ? "rgba(254, 205, 211, 0.4)" : "rgba(186, 230, 253, 0.4)"}
              strokeWidth="0.8"
            />
          </svg>

          {/* 3. Center 3D Chicken Mascot */}
          <div className="absolute top-[19px] left-1/2 -translate-x-1/2 w-[30px] h-[34px] flex items-center justify-center pointer-events-none select-none">
            <div className="relative w-full h-full">
              <Image
                src="/chicken_logo.svg"
                alt="CFOCO Chicken Mascot"
                fill
                sizes="34px"
                className="object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)]"
                priority
              />
            </div>
          </div>
        </div>
      );
    });
    TeardropPinBody.displayName = "TeardropPinBody";

    /**
     * Milestone story content (Year, Title, Descriptions)
     * Reveals strictly when the user reaches and stops at each destination.
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
     * Single Traveling Pin: Rides along the highway spline with the scroll,
     * docks and bounces at destinations, and only glows upon arrival.
     */
    const TravelingPin: React.FC<{
      pinX: MotionValue<number>;
      pinY: MotionValue<number>;
      pinAngle: MotionValue<number>;
      glowOpacity: MotionValue<number>;
      isDocked: boolean;
      isRed: boolean;
      primaryColor: string;
    }> = React.memo(
      ({ pinX, pinY, pinAngle, glowOpacity, isDocked, isRed, primaryColor }) => {
        // Subtle banking angle along the road curvature (max ±10deg)
        const bankAngle = useTransform(pinAngle, (a) => Math.max(-10, Math.min(10, a * 0.2)));

        // Vertical offsets so pin tip touches pinY on the road
        const pinTop = useTransform(pinY, (y) => y - 96);
        const shadowTop = useTransform(pinY, (y) => y - 4);

        return (
          <>
            {/* Ground Contact Shadow riding directly on asphalt surface */}
            <motion.div
              className="absolute -translate-x-1/2 pointer-events-none rounded-full z-20"
              style={{
                left: pinX,
                top: shadowTop,
                width: 36,
                height: 9,
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 75%)",
              }}
              variants={shadowPulseVariants}
              animate={isDocked ? "active" : "inactive"}
            />

            {/* Traveling Map Pin */}
            <motion.div
              className="absolute -translate-x-1/2 flex flex-col items-center transform-gpu z-30 pointer-events-none"
              style={{
                left: pinX,
                top: pinTop,
                rotate: bankAngle,
              }}
              variants={pinBounceVariants}
              animate={isDocked ? "active" : "inactive"}
            >
              {/* Neon Charging Ring: Glows in red/blue only when arrived and showing content */}
              <PinChargingRing
                primaryColor={primaryColor}
                opacity={glowOpacity}
              />
              <TeardropPinBody
                isRed={isRed}
                primaryColor={primaryColor}
              />
            </motion.div>
          </>
        );
      }
    );
    TravelingPin.displayName = "TravelingPin";

    /**
     * Milestone Station: Destination story content.
     * Content reveals strictly when the traveling pin stops at this station.
     * No pinpoint dots are rendered on the road surface.
     */
    const MilestoneStation: React.FC<{
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

      // Content reveal: STRICTLY ONLY WHEN STOPPED AT THE DESTINATION
      // Fades out immediately when scrolling starts so no content is shown while traveling
      const contentOpacity = useTransform(distMotion, (dist) => {
        if (dist >= 0.16) return 0;
        if (dist <= 0.05) return 1;
        const t = (0.16 - dist) / (0.16 - 0.05);
        return 0.5 - 0.5 * Math.cos(Math.PI * t);
      });

      const contentY = useTransform(distMotion, (dist) => {
        if (dist >= 0.16) return 20;
        if (dist <= 0.05) return 0;
        const t = (0.16 - dist) / (0.16 - 0.05);
        return (1 - t) * 20;
      });

      const contentScale = useTransform(distMotion, (dist) => {
        if (dist >= 0.16) return 0.88;
        if (dist <= 0.05) return 1;
        const t = (0.16 - dist) / (0.16 - 0.05);
        return 0.88 + 0.12 * t;
      });

      return (
        <div
          className="absolute pointer-events-auto select-none"
          style={{
            left: point.x,
            top: 0,
          }}
        >
          {/* Story Content: Revealed strictly at destination (no pinpoint on road) */}
          <div
            style={{ position: "absolute", top: point.y + 44, left: 0 }}
            onClick={() => onSelect?.(index)}
            role="button"
            tabIndex={0}
            aria-label={`Milestone ${data.year}: ${data.title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelect?.(index);
              }
            }}
          >
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
    MilestoneStation.displayName = "MilestoneStation";

    /* ─────────────────────────────────────────────────────────────────────────
      MAIN OBSESSION HIGHWAY COMPONENT
      ───────────────────────────────────────────────────────────────────────── */

    const Obsession: React.FC<ObsessionProps> = ({ items }) => {
      const { t } = useTranslation("about");
      const baseMilestones = items && items.length > 0 ? items : defaultMilestones;
      const milestones = useMemo(() => {
        return baseMilestones.map((m) => {
          const yearKey = m.year;
          return {
            ...m,
            title: t(`obsession.milestones.${yearKey}.title` as any, m.title),
            descLine1: t(`obsession.milestones.${yearKey}.descLine1` as any, m.descLine1),
            descLine2: t(`obsession.milestones.${yearKey}.descLine2` as any, m.descLine2),
          };
        });
      }, [baseMilestones, t]);
      const N = milestones.length;

      const targetRef = useRef<HTMLDivElement>(null);

      const [viewportWidth, setViewportWidth] = useState<number>(1440);
      const [isMobile, setIsMobile] = useState<boolean>(false);

      // Responsive viewport dimensions
      useEffect(() => {
        let animationFrameId: number;
        let lastW = typeof window !== "undefined" ? window.innerWidth : 1440;

        const handleResize = () => {
          animationFrameId = requestAnimationFrame(() => {
            const w = window.innerWidth;
            if (Math.abs(w - lastW) > 10) {
              lastW = w;
              setViewportWidth(w);
              setIsMobile(w < 768);
            }
          });
        };

        handleResize();
        window.addEventListener("resize", handleResize, { passive: true });
        return () => {
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener("resize", handleResize);
        };
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
        stiffness: 140,
        damping: 24,
        mass: 0.3,
      });

      // Coordinates and angle for the single traveling pin
      const pinX = useTransform(smoothMilestone, (m) => {
        return getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness).x;
      });

      const pinY = useTransform(smoothMilestone, (m) => {
        return getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness).y;
      });

      const pinAngle = useTransform(smoothMilestone, (m) => {
        return getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness).angle;
      });

      // Pin glow opacity: NO GLOW while mobile/traveling; glows strictly when reached and showing content
      const pinGlowOpacity = useTransform(smoothMilestone, (m) => {
        const closest = Math.round(m);
        const dist = Math.abs(m - closest);
        if (dist >= 0.14) return 0;
        if (dist <= 0.05) return 1;
        const t = (0.14 - dist) / (0.14 - 0.05);
        return 0.5 - 0.5 * Math.cos(Math.PI * t);
      });

      const [activeIdx, setActiveIdx] = useState<number>(0);
      const [isDocked, setIsDocked] = useState<boolean>(true);
      const isAtEndMilestoneRef = useRef<boolean>(false);

      useMotionValueEvent(smoothMilestone, "change", (m) => {
        const closest = Math.max(0, Math.min(N - 1, Math.round(m)));
        const dist = Math.abs(m - closest);
        const docked = dist < 0.08;

        if (docked !== isDocked) {
          setIsDocked(docked);
        }
        if (closest !== activeIdx) {
          setActiveIdx(closest);
        }

        // Unlock scrolling to next section ONLY after reaching the final milestone and docking
        if (m >= N - 1 - 0.05 && docked) {
          isAtEndMilestoneRef.current = true;
        } else if (m < N - 1 - 0.25) {
          isAtEndMilestoneRef.current = false;
        }
      });

      // Guard to lock scrolling until the location pin reaches the end and reveals the final content
      useEffect(() => {
        const handleScrollLock = () => {
          if (!targetRef.current) return;
          const rect = targetRef.current.getBoundingClientRect();
          const currentScrollY = window.scrollY;
          const sectionTop = currentScrollY + rect.top;
          const maxScroll = sectionTop + targetRef.current.offsetHeight - window.innerHeight;

          // If user attempts to scroll past the bottom into the next section
          // before the location pin has arrived and finished revealing the final content:
          if (currentScrollY > maxScroll && !isAtEndMilestoneRef.current) {
            window.scrollTo({
              top: maxScroll,
              behavior: "instant",
            });
          }
        };

        window.addEventListener("scroll", handleScrollLock, { passive: false });
        return () => window.removeEventListener("scroll", handleScrollLock);
      }, []);

      const currentMilestone = milestones[activeIdx] || milestones[0];
      const isCurrentRed =
        currentMilestone.theme === "red" || (!currentMilestone.theme && activeIdx % 2 === 0);
      const currentPrimaryColor = isCurrentRed ? "#EF4444" : "#00D4FF";

      // Camera tracking in X and Y to keep road and active pin smoothly centered
      const trackX = useTransform(smoothMilestone, (m) => {
        const pt = getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness);
        return viewportWidth / 2 - pt.x;
      });

      const trackY = useTransform(smoothMilestone, (m) => {
        const pt = getRoadPointAndAngle(m, milestonePoints, config.curveSmoothness);
        return (ROAD_MEDIAN_Y - pt.y) * 0.42;
      });

      // Center dashed divider line moves strictly when user scrolls (completely stationary when idle)
      const activeDashOffset = useTransform(
        smoothMilestone,
        (m) => m * spacing * config.lineDirection
      );

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

      /**
       * Smoothly drives directly to a specific milestone year when clicking a station
       */
      const scrollToMilestone = useCallback(
        (index: number) => {
          if (!targetRef.current) return;
          const rect = targetRef.current.getBoundingClientRect();
          const scrollTop = window.scrollY + rect.top;
          const totalTravel = targetRef.current.offsetHeight - window.innerHeight;
          const END_TRAVEL_P = 0.76;
          const targetNormP = index / Math.max(1, N - 1);
          const targetP = index === N - 1 ? END_TRAVEL_P + 0.05 : targetNormP * END_TRAVEL_P;
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
          style={{ height: `${N * 90 + 130}vh` }}
        >
          <section
            className={`sticky top-0 w-full h-screen supports-[height:100svh]:h-[100svh] overflow-hidden flex flex-col justify-center ${matter.className} bg-transparent`}
          >
            {/* Section Header */}
            <header className="w-full text-center space-y-1 sm:space-y-2 px-4 absolute top-8 sm:top-12 md:top-14 left-0 right-0 z-20 pointer-events-none">
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {t("obsession.headerLine1", "13 Years")}
              </h2>
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {t("obsession.headerLine2", "One Obsession")}
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

                  {/* 4. Center Dashed Divider Line: Moves strictly when scrolling */}
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

                {/* 1. Road Station Story Contents (No pinpoint dots on the road) */}
                {milestones.map((data, index) => (
                  <MilestoneStation
                    key={data.year}
                    data={data}
                    index={index}
                    point={milestonePoints[index]}
                    smoothMilestone={smoothMilestone}
                    onSelect={scrollToMilestone}
                  />
                ))}

                {/* 2. Single Traveling Pin: Glides along the road, stops at milestones */}
                <TravelingPin
                  pinX={pinX}
                  pinY={pinY}
                  pinAngle={pinAngle}
                  glowOpacity={pinGlowOpacity}
                  isDocked={isDocked}
                  isRed={isCurrentRed}
                  primaryColor={currentPrimaryColor}
                />
              </motion.div>
            </div>
          </section>
        </div>
      );
    };

    export default Obsession;
