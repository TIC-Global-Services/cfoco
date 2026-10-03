"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

interface GlobeProps {
  location?: { lat: number; lng: number };
}

const DEFAULT_LOCATION = { lat: 44.8378, lng: -0.5792 };
const WARMUP_FRAMES = 90; // redraw every frame at the start so the map image appears
const REVEAL_FRAME = 12; // then fade the canvas in

const toAngles = (lat: number, lng: number): [number, number] => [
  Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

export default function Globe({ location }: GlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [attempt, setAttempt] = useState(0); // bump this to rebuild after a lost context
  const [failed, setFailed] = useState(false);

  const lat = location?.lat ?? DEFAULT_LOCATION.lat;
  const lng = location?.lng ?? DEFAULT_LOCATION.lng;

  const target = useRef<[number, number]>(toAngles(lat, lng));
  useEffect(() => {
    target.current = toAngles(lat, lng);
  }, [lat, lng]);

  // 1) Know when the globe is near the screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "250px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 2) Build the globe only while it is near the screen
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!inView || !canvas || !host) return;

    setReady(false);

    const size = window.innerWidth < 640 ? 420 : 600; // smaller drawing on phones
    let [phi, theta] = target.current;
    let raf = 0;
    let frame = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 1,
      width: size,
      height: size,
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

    // cobe silently does nothing if WebGL is not available, so check it ourselves
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl || gl.isContextLost()) {
      globe.destroy();
      host.replaceChildren(canvas);
      setFailed(true);
      return;
    }

    const onLost = (e: Event) => {
      e.preventDefault(); // lets the browser restore the context later
      setReady(false);
    };
    const onRestored = () => setAttempt((n) => n + 1); // rebuild the globe
    const onVisible = () => {
      if (document.visibilityState === "visible") frame = 0; // redraw after coming back
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    document.addEventListener("visibilitychange", onVisible);

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
      if (moving || frame <= WARMUP_FRAMES) {
        globe.update({ phi, theta });
      }
      if (frame === REVEAL_FRAME) setReady(true);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      document.removeEventListener("visibilitychange", onVisible);
      globe.destroy();
      host.replaceChildren(canvas);
    };
  }, [inView, attempt]);

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-[500px] shrink-0">
      {/* host holds ONLY the canvas, because cobe moves it around inside this div */}
      <div ref={hostRef} className={failed ? "hidden" : "block"}>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className={`block h-auto w-full transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Simple fallback if the phone gives us no WebGL at all */}
      {failed && (
        <div className="aspect-square w-full rounded-full bg-gradient-to-tr from-[#E5A823]/20 via-[#FFBF00]/10 to-transparent" />
      )}
    </div>
  );
}