"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ShutterLoader from "./ShutterLoader";

type Phase = "loading" | "leaving" | "gone";

/**
 * First-load loader for every page except the home page, which runs the same
 * shutter loader tied to its 3D asset progress (components/home/Loader.tsx).
 */
export default function GlobalLoader() {
  const pathname = usePathname();
  // decided once, on the first render: later client navigations never show it
  const [phase, setPhase] = useState<Phase>(pathname === "/" ? "gone" : "loading");
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (phase !== "loading") return;
    let pct = 0;
    let ready = document.readyState === "complete";
    const onLoad = () => (ready = true);
    if (!ready) window.addEventListener("load", onLoad, { once: true });

    const timer = setInterval(() => {
      pct = ready ? pct + 8 : Math.min(88, pct + Math.max(1, (90 - pct) / 10));
      if (pct >= 100) {
        pct = 100;
        clearInterval(timer);
        setTimeout(() => setPhase("leaving"), 450);
      }
      setValue(pct);
    }, 30);
    // never leave the visitor stuck
    const fallback = setTimeout(() => {
      clearInterval(timer);
      setValue(100);
      setPhase("leaving");
    }, 3500);

    return () => {
      clearInterval(timer);
      clearTimeout(fallback);
      window.removeEventListener("load", onLoad);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("gone"), 1900);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;
  return <ShutterLoader value={value} leaving={phase === "leaving"} />;
}
