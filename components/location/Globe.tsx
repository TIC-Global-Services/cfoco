"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

interface GlobeProps {
  location?: { lat: number; lng: number };
}

const DEFAULT_LOCATION = { lat: 44.8378, lng: -0.5792 };
const SIZE = 600; // drawing size; CSS scales it down on small screens

// lat/lng -> phi/theta that puts this point in the center of the globe
const toAngles = (lat: number, lng: number): [number, number] => [
  Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

export default function Globe({ location }: GlobeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lat = location?.lat ?? DEFAULT_LOCATION.lat;
  const lng = location?.lng ?? DEFAULT_LOCATION.lng;

  // Where the globe should be facing. Changing this does NOT rebuild the globe.
  const target = useRef<[number, number]>(toAngles(lat, lng));
  useEffect(() => {
    target.current = toAngles(lat, lng);
  }, [lat, lng]);

  // Create the globe ONCE
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    let [phi, theta] = target.current; // start already facing the first city

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: SIZE,
      height: SIZE,
      phi,
      theta,
      dark: 1,
      diffuse: 1.2,
      scale: 1.1,
      mapSamples: 40000,
      mapBrightness: 12,
      baseColor: [1, 1, 1],
      markerColor: [1, 0.75, 0],
      glowColor: [1, 1, 1],
      offset: [0, 0],
      // no cobe marker: your HTML beacon in StepInside is the pin
    });

    // v2 has no built-in loop, so we make our own and ease toward the target
    let raf = 0;
    const tick = () => {
      const [tPhi, tTheta] = target.current;
      const dPhi = Math.atan2(Math.sin(tPhi - phi), Math.cos(tPhi - phi)); // shortest way round
      const dTheta = tTheta - theta;

      if (Math.abs(dPhi) > 0.0005 || Math.abs(dTheta) > 0.0005) {
        phi += dPhi * 0.08;
        theta += dTheta * 0.08;
        globe.update({ phi, theta }); // only redraw while moving
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
      host.replaceChildren(canvas); // remove cobe's wrapper div so they don't pile up
    };
  }, []);

  return (
    <div ref={hostRef} className="relative mx-auto w-full max-w-[400px] shrink-0">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="block h-auto w-full"
      />
    </div>
  );
}