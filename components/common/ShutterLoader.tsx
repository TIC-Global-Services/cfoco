import Image from "next/image";

export const LOADER_STEPS = ["Selecting fresh cuts", "Blending the spices", "Heating the oil", "Frying to gold", "Ready"];

/** the CFOCO shutter loader: logo fills from the bottom, then the two halves part. Styles live in globals.css. */
export default function ShutterLoader({ value, leaving }: { value: number; leaving: boolean }) {
  const pct = Math.round(value);
  const step = LOADER_STEPS[Math.min(LOADER_STEPS.length - 1, Math.floor((value / 100) * (LOADER_STEPS.length - 1)))];

  return (
    <div className={`loader ${leaving ? "loader--leaving" : ""}`} role="status" aria-live="polite" aria-label={`Loading ${pct}%`}>
      <div className="loader-panel loader-panel--top" />
      <div className="loader-panel loader-panel--bottom" />
      <div className="loader-content">
        <div className="loader-logo" aria-hidden>
          <span className="loader-logo-ghost" />
          <Image
            src="/logo.svg"
            alt=""
            width={161}
            height={51}
            unoptimized
            priority
            className="loader-logo-fill"
            style={{ clipPath: `inset(${100 - value}% 0 0 0)` }}
          />
        </div>
      </div>
      <div className="loader-meta">
        <span className="loader-step">{step}</span>
        <span className="loader-count">{pct}%</span>
        <span className="loader-bar">
          <span style={{ transform: `scaleX(${value / 100})` }} />
        </span>
      </div>
    </div>
  );
}
