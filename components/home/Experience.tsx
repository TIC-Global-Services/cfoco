"use client";

import Lenis from "lenis";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Leva } from "leva";
import { SECTION_VH, scrollApi, scrollState, setProgress } from "@/lib/home/scroll";
import { PROGRESS_MAX } from "./config";
import { Footer } from "./Footer";
import { Loader } from "./Loader";
import { Navbar } from "./Navbar";
import { Overlay } from "./Overlay";
import { Sound } from "./Sound";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function Experience() {
  useEffect(() => {
    scrollState.debug = new URLSearchParams(window.location.search).has("debug");
    scrollState.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.history.scrollRestoration = "manual";

    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, autoRaf: true });

    const update = () => {
      const perSection = window.innerHeight * SECTION_VH;
      setProgress(Math.min(lenis.scroll / perSection, PROGRESS_MAX));
    };
    lenis.on("scroll", update);
    scrollApi.toSection = (i, immediate = false) =>
      lenis.scrollTo(i * window.innerHeight * SECTION_VH, { immediate, force: true, duration: 1.6 });
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    }
    window.addEventListener("resize", update);
    update();

    // read every frame: the "scroll" event stops firing before velocity settles to 0
    let raf = 0;
    const tick = () => {
      scrollState.velocity = lenis.isScrolling ? lenis.velocity : 0;
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // a scrolling finger is not a cursor
      scrollState.hasPointer = true;
      scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.removeEventListener("resize", update);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>
      <Navbar />
      <Overlay />
      <Footer />
      <Sound />
      <Loader />
      {/* dev-only scene controller (top-right) */}
      <Leva
        hidden={process.env.NODE_ENV === "production"}
        collapsed
        titleBar={{ title: "Scene controls", filter: true }}
        theme={{ sizes: { rootWidth: "320px", controlWidth: "170px" } }}
      />
      {/* scroll length: one SECTION_VH per section after the first, plus the outro */}
      <div aria-hidden style={{ height: `${PROGRESS_MAX * SECTION_VH * 100 + 100}svh` }} />
    </>
  );
}
