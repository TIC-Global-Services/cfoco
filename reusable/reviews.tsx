'use client';

import React, { useRef, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// WebGL Specular Shader for Frosted Glass Cards
const PAD = 24;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // Subtle base border hugging edge
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.35;

  // Specular light streak
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base * 0.5 + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

interface GlassSpecularCardProps {
  children?: ReactNode;
  className?: string;
  radius?: number;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  speed?: number;
  proximity?: number;
}

export const GlassSpecularCard = ({
  children,
  className = '',
  radius = 28,
  lineColor = '#ffffff',
  baseColor = '#ffffff',
  intensity = 1.2,
  speed = 0.4,
  proximity = 300,
}: GlassSpecularCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const propsRef = useRef({ radius, lineColor, baseColor, intensity, speed, proximity });
  propsRef.current = { radius, lineColor, baseColor, intensity, speed, proximity };

  useEffect(() => {
    const card = cardRef.current;
    const fx = fxRef.current;
    if (!card || !fx) return;

    // Device-aware flags — these drive most of the mobile/iOS savings below.
    const isCoarsePointer =
      typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Respect reduced-motion: render the plain glass card (CSS only), skip WebGL entirely.
    if (prefersReducedMotion) return;

    // Cap DPR harder on touch devices — a 3x-DPR iPhone rendering 6 canvases at dpr=2
    // is a lot of fill-rate for an effect this subtle.
    const dpr = Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.5 : 2);
    let renderer: Renderer | null = null;

    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        // MSAA is expensive on mobile tile-based GPUs; skip it on touch devices.
        antialias: !isCoarsePointer,
        dpr,
      });
    } catch {
      return;
    }

    if (!renderer) return;
    const gl = renderer.gl;

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: radius * dpr },
        uAngle: { value: 2.4 },
        uPx: { value: dpr },
        uLineColor: { value: [1, 1, 1] },
        uBaseColor: { value: [1, 1, 1] },
        uIntensity: { value: intensity },
        uShineSize: { value: 0.25 },
        uShineFade: { value: 0.75 },
        uThickness: { value: 1.5 * dpr },
        uBaseWidth: { value: 1.0 * dpr },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    if (gl.canvas instanceof HTMLCanvasElement) {
      fx.appendChild(gl.canvas);
    }

    const sizeRef = { w: 1, h: 1 };
    const resize = () => {
      if (!card || !renderer) return;
      const rect = card.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;
      sizeRef.w = w;
      sizeRef.h = h;
      renderer.setSize(w + PAD * 2, h + PAD * 2);
      program.uniforms.uCenter.value = [(PAD + w / 2) * dpr, (PAD + h / 2) * dpr];
      program.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr];
    };

    const ro = new ResizeObserver(resize);
    ro.observe(card);
    resize();

    let pointerAngle: number | null = null;
    let proximityT = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        const nx = (e.clientX - cx) / (rect.width / 2);
        const ny = (cy - e.clientY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
      }

      const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1));
      proximityT = t * t * (3 - 2 * t);
    };

    // Pointer-proximity glow is a mouse-only affordance — skip the listener on touch.
    if (!isCoarsePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    let angle = 2.4;
    let idleAngle = 2.4;
    let bright = 0.5;
    let last = performance.now();
    let raf = 0;

    const lineC = new Color();
    const baseC = new Color();

    const update = (now: number) => {
      raf = requestAnimationFrame(update);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = propsRef.current;

      idleAngle += p.speed * dt;
      const target = pointerAngle != null && proximityT > 0 ? pointerAngle : idleAngle;
      const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += diff * (1 - Math.exp(-dt * 6));

      const brightTarget = 0.45 + 0.55 * proximityT;
      bright += (brightTarget - bright) * (1 - Math.exp(-dt * 7));

      lineC.set(p.lineColor);
      baseC.set(p.baseColor);

      program.uniforms.uAngle.value = angle;
      program.uniforms.uRadius.value = Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
      program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
      program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
      program.uniforms.uIntensity.value = p.intensity * bright;
      program.uniforms.uThickness.value = 1.4 * dpr;

      if (renderer) {
        renderer.render({ scene: mesh });
      }
    };

    // --- Visibility-gated render loop -------------------------------------
    // This is the main fix: previously every card's shader ran forever,
    // regardless of whether it was actually on screen. With 6 cards that's
    // 6 permanently-active WebGL contexts, which is close to iOS Safari's
    // context ceiling and a steady GPU/battery drain. Now the loop only
    // runs while the card is (a) intersecting the viewport and (b) the tab
    // is foregrounded.
    let isIntersecting = false;
    let isPageVisible = document.visibilityState === 'visible';
    const shouldRun = () => isIntersecting && isPageVisible;

    const startLoop = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(update);
    };
    const stopLoop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Capture whatever `backdrop-blur-xs` actually resolves to in this
    // project's Tailwind config (rather than hardcoding a blur radius),
    // then drive it with inline styles for touch devices. Inline styles
    // always take effect regardless of build/purge setup, unlike toggling
    // a utility class at runtime, which depends on that exact class
    // already existing in the compiled stylesheet.
    let restingBackdropFilter = 'none';
    if (isCoarsePointer) {
      restingBackdropFilter = getComputedStyle(card).backdropFilter || 'blur(4px)';
      card.style.backdropFilter = 'none';
      card.style.setProperty('-webkit-backdrop-filter', 'none');
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (shouldRun()) startLoop();
        else stopLoop();
        // Glass stays everywhere. On touch devices, only pay the
        // backdrop-filter compositing cost while the card is actually near
        // the viewport — off-screen cards (most of the 6, at any instant)
        // don't carry it. Desktop/pointer devices keep it always-on since
        // that's not where the iOS jank comes from.
        if (isCoarsePointer) {
          const value = isIntersecting ? restingBackdropFilter : 'none';
          card.style.backdropFilter = value;
          card.style.setProperty('-webkit-backdrop-filter', value);
        }
      },
      { rootMargin: '40% 0px', threshold: 0 }
    );
    io.observe(card);

    const onVisibilityChange = () => {
      isPageVisible = document.visibilityState === 'visible';
      if (shouldRun()) startLoop();
      else stopLoop();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      ro.disconnect();
      if (!isCoarsePointer) {
        window.removeEventListener('pointermove', onPointerMove);
      }
      if (gl?.canvas && gl.canvas instanceof HTMLCanvasElement && gl.canvas.parentNode === fx) {
        fx.removeChild(gl.canvas);
      }
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [radius, lineColor, baseColor, intensity, speed, proximity]);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-visible bg-white/5 backdrop-blur-xs rounded-[24px] sm:rounded-[32px] p-6 sm:p-7 md:p-8 shadow-[0_20px_45px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,0.95)] transition-[box-shadow,transform] duration-300 hover:shadow-[0_25px_60px_rgba(239,143,96,0.14),0_4px_12px_rgba(0,0,0,0.03)] hover:scale-[1.02] ${className}`}
    >
      {/* WebGL Specular Border Canvas */}
      <span
        ref={fxRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 z-10 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
      />
      {/* Card Content */}
      <div className="relative z-[2] flex flex-col gap-2.5 sm:gap-2">
        {children}
      </div>
    </div>
  );
};

export interface ReviewCardItem {
  id: string;
  rating: number;
  quote: string;
  authorName: string;
}

const defaultLeftReviews: ReviewCardItem[] = [
  {
    id: 'rev-1',
    rating: 5,
    quote:
      '"Joyzen transformed the way I approach my healthcare. The continuous support made all the difference."',
    authorName: '-Sarah M.',
  },
  {
    id: 'rev-2',
    rating: 5,
    quote:
      '"Having doctors and wellness mentors in one circle changed everything for my everyday routine."',
    authorName: '-David Ross',
  },
  {
    id: 'rev-3',
    rating: 5,
    quote:
      '"The empathy, quick consultations, and warm community feel is unmatched anywhere else."',
    authorName: '-Elena Rostova',
  },
];

const defaultRightReviews: ReviewCardItem[] = [
  {
    id: 'rev-4',
    rating: 5,
    quote:
      '"From mindful workshops to doctor checkups, everything feels deeply personal and empowering."',
    authorName: '-Michael Chen',
  },
  {
    id: 'rev-5',
    rating: 5,
    quote:
      '"No more guesswork or rushing through appointments. Genuine care and continuous guidance."',
    authorName: '-Sarah Jenkins',
  },
  {
    id: 'rev-6',
    rating: 5,
    quote:
      '"A safe space where healthcare meets human connection. Life is so much better as part of Joyzen."',
    authorName: '-Marcus Vance',
  },
];

const FiveStars = ({ rating = 5 }: { rating?: number }) => (
  <div className="flex items-center text-[#FBBF24]">
    {Array.from({ length: rating }).map((_, i) => (
      <svg
        key={i}
        className="w-4.5 h-4.5 sm:w-6 sm:h-6 fill-current drop-shadow-[0_1px_2px_rgba(251,191,36,0.3)]"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ReviewCard = ({ card }: { card: ReviewCardItem }) => {
  return (
    <GlassSpecularCard className="w-[280px] xs:w-[300px] sm:w-[340px] md:w-[380px] lg:w-[437px]">
      {/* 5 Golden Stars */}
      <FiveStars rating={card.rating} />

      {/* Review Quote Text */}
      <p className="text-lg sm:text-lg lg:text-2xl text-zinc-700 font-normal leading-[1.35] sm:leading-tight tracking-tight mt-1">
        {card.quote}
      </p>

      {/* Author Name in Orange */}
      <span className="text-2xl lg:text-[32px] font-semibold text-[#EF7C48] tracking-tight mt-0.5">
        {card.authorName}
      </span>
    </GlassSpecularCard>
  );
};

export interface ReviewsProps {
  leftReviews?: ReviewCardItem[];
  rightReviews?: ReviewCardItem[];
}

const Reviews = ({
  leftReviews = defaultLeftReviews,
  rightReviews = defaultRightReviews,
}: ReviewsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevents iOS Safari's dynamic-toolbar resize events from forcing a
    // full ScrollTrigger.refresh() mid-scroll (which would reset every
    // card's gsap.set() offscreen position and read as a stutter/reset).
    ScrollTrigger.config({ ignoreMobileResize: true });

    const isTouch =
      typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;

    // GSAP's documented fix for pinned-section jank on iOS Safari, caused by
    // its momentum/rubber-band scroll physics fighting the pin. This is a
    // page-level scroll-physics change (not scoped to this section alone),
    // so it's applied only on touch devices and reverted on unmount — test
    // it against any other scroll-driven sections elsewhere on the page.
    if (isTouch) {
      ScrollTrigger.normalizeScroll(true);
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Helper function to build a continuous, seamlessly fading flow of cards
      const buildScrollTimeline = (
        leftCards: HTMLElement[],
        rightCards: HTMLElement[],
        scrollDistance: number,
        cardDuration: number,
        staggerStep: number,
        scrubSpeed: number
      ) => {
        const vh = window.innerHeight;
        // Travel distance safely past the viewport bounds (top & bottom)
        const travelDistance = Math.max(vh * 1.15, 800);

        // Initially hide all upcoming cards completely offscreen with 0 opacity
        gsap.set([...leftCards, ...rightCards], {
          y: travelDistance,
          opacity: 0,
          autoAlpha: 0,
          force3D: true,
          willChange: 'transform, opacity',
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: `+=${scrollDistance}`,
            scrub: scrubSpeed,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        const totalPairs = Math.max(leftCards.length, rightCards.length);

        for (let i = 0; i < totalPairs; i++) {
          // Left card animation
          if (leftCards[i]) {
            const startTime = i * staggerStep;

            // Travel from bottom to top
            tl.fromTo(
              leftCards[i],
              { y: travelDistance },
              { y: -travelDistance, duration: cardDuration, ease: 'none', force3D: true },
              startTime
            );

            // Fade in as card enters bottom viewport
            tl.fromTo(
              leftCards[i],
              { opacity: 0, autoAlpha: 0 },
              { opacity: 1, autoAlpha: 1, duration: cardDuration * 0.22, ease: 'power1.out' },
              startTime
            );

            // Fade out as card exits top viewport
            tl.to(
              leftCards[i],
              { opacity: 0, autoAlpha: 0, duration: cardDuration * 0.22, ease: 'power1.in' },
              startTime + cardDuration * 0.78
            );
          }

          // Right card animation (interleaved for continuous alternating flow)
          if (rightCards[i]) {
            const rightStartTime = i * staggerStep + staggerStep * 0.5;

            // Travel from bottom to top
            tl.fromTo(
              rightCards[i],
              { y: travelDistance },
              { y: -travelDistance, duration: cardDuration, ease: 'none', force3D: true },
              rightStartTime
            );

            // Fade in
            tl.fromTo(
              rightCards[i],
              { opacity: 0, autoAlpha: 0 },
              { opacity: 1, autoAlpha: 1, duration: cardDuration * 0.22, ease: 'power1.out' },
              rightStartTime
            );

            // Fade out
            tl.to(
              rightCards[i],
              { opacity: 0, autoAlpha: 0, duration: cardDuration * 0.22, ease: 'power1.in' },
              rightStartTime + cardDuration * 0.78
            );
          }
        }
      };

      // ── Mobile / Tablet (≤1024px) ──
      mm.add('(max-width: 1024px)', () => {
        const leftCards = gsap.utils.toArray<HTMLElement>('.review-card-left');
        const rightCards = gsap.utils.toArray<HTMLElement>('.review-card-right');
        // Snappy touch scroll distance, smooth alternating cards without large gaps
        buildScrollTimeline(leftCards, rightCards, 1900, 2.2, 0.7, 0.35);
      });

      // ── Desktop (>1024px) ──
      mm.add('(min-width: 1025px)', () => {
        const leftCards = gsap.utils.toArray<HTMLElement>('.review-card-left');
        const rightCards = gsap.utils.toArray<HTMLElement>('.review-card-right');
        buildScrollTimeline(leftCards, rightCards, 3000, 2.4, 0.8, 1.0);
      });
    }, containerRef);

    return () => {
      ctx.revert();
      if (isTouch) {
        ScrollTrigger.normalizeScroll(false);
      }
    };
  }, []);

  return (
    <section
      id="reviews-section"
      className="relative w-full bg-transparent select-none overflow-hidden"
    >
      <div
        ref={containerRef}
        className="h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden relative px-0 sm:px-[5%]"
      >
        {/* Background Ambient Spotlights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-gradient-to-tr from-[#EF8F60]/12 via-[#78C9CF]/12 to-transparent rounded-full blur-[140px] pointer-events-none" />

        {/* PINNED CENTER EMBLEM & TITLE LAYER (Fixed in Center during scroll) */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center select-none">
          <div className="flex flex-col items-center justify-center">
            {/* Orange Joyzen Logo in Center */}
            <div className="relative w-28 h-28 xs:w-36 xs:h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 mb-1 sm:mb-2 transition-transform duration-500">
              <Image
                src="/joyzen-orange.png"
                alt="Joyzen"
                fill
                priority
                className="object-contain drop-shadow-[0_14px_28px_rgba(239,143,96,0.18)]"
              />
            </div>

            {/* Typography */}
            <div className="flex flex-col items-center">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-bold text-zinc-900 tracking-tight leading-none">
                Hear From Our
              </h2>
              <h2 className="text-[36px] xs:text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-bold text-[#AEDEE4] tracking-tight leading-none">
                Joyzen Club
              </h2>
            </div>
          </div>
        </div>

        {/* FLOATING / SCROLLING REVIEW CARDS LAYER (Columns scroll past the pinned center) */}
        <div className="absolute inset-0 z-10 w-full flex justify-between h-full pointer-events-none px-2 sm:px-4">
          {/* Left Column of Floating Cards */}
          <div className="w-full lg:w-1/2 absolute inset-y-0 left-0 h-full pointer-events-none">
            {leftReviews.map((card, i) => (
              <div
                key={`rev-left-${card.id}-${i}`}
                className="review-card-left absolute inset-0 flex items-center justify-start lg:justify-end pl-3 xs:pl-4 sm:pl-6 lg:pl-0 lg:pr-16 pointer-events-none"
              >
                <div className="pointer-events-auto">
                  <ReviewCard card={card} />
                </div>
              </div>
            ))}
          </div>

          {/* Right Column of Floating Cards */}
          <div className="w-full lg:w-1/2 absolute inset-y-0 right-0 h-full pointer-events-none">
            {rightReviews.map((card, i) => (
              <div
                key={`rev-right-${card.id}-${i}`}
                className="review-card-right absolute inset-0 flex items-center justify-end lg:justify-start pr-3 xs:pr-4 sm:pr-6 lg:pr-0 lg:pl-16 pointer-events-none"
              >
                <div className="pointer-events-auto">
                  <ReviewCard card={card} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;