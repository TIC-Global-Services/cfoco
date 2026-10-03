"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

interface GlobeProps {
  location?: { lat: number; lng: number };
}

const DEFAULT_LOCATION = { lat: 44.8378, lng: -0.5792 };
const SIZE = 600;

const WARMUP_FRAMES = 90; // ~1.5s: redraw every frame so the map image appears the moment it is ready
const REVEAL_FRAME = 12; // ~0.2s: then fade the canvas in (no empty sphere flash)

// lat/lng -> phi/theta that puts this point in the center of the globe
const toAngles = (lat: number, lng: number): [number, number] => [
  Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

export default function Globe({ location }: GlobeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const lat = location?.lat ?? DEFAULT_LOCATION.lat;
  const lng = location?.lng ?? DEFAULT_LOCATION.lng;

  const target = useRef<[number, number]>(toAngles(lat, lng));
  useEffect(() => {
    target.current = toAngles(lat, lng);
  }, [lat, lng]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    let [phi, theta] = target.current;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 1,
      width: SIZE,
      height: SIZE,
      phi,
      theta,
      dark: 1,
      diffuse: 1.2,
      scale: 1.1,
      mapSamples: 20000,
      mapBrightness: 12,
      baseColor: [1, 1, 1],
      markerColor: [1, 0.75, 0],
      glowColor: [1, 1, 1],
      offset: [0, 0],
    });

    let raf = 0;
    let frame = 0;

    const tick = () => {
      frame++;

      const [tPhi, tTheta] = target.current;
      const dPhi = Math.atan2(Math.sin(tPhi - phi), Math.cos(tPhi - phi));
      const dTheta = tTheta - theta;
      const moving = Math.abs(dPhi) > 0.0005 || Math.abs(dTheta) > 0.0005;

      if (moving) {
        phi += dPhi * 0.08;
        theta += dTheta * 0.08;
      }

      // Redraw while moving, AND during warm-up (cobe does not redraw
      // by itself when its internal map image finishes loading).
      if (moving || frame <= WARMUP_FRAMES) {
        globe.update({ phi, theta });
      }

      if (frame === REVEAL_FRAME) setReady(true);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
      host.replaceChildren(canvas);
    };
  }, []);

  return (
    <div ref={hostRef} className="relative mx-auto w-full max-w-[500px] shrink-0">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className={`block h-auto w-full transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}