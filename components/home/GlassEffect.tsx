"use client";

import { useFrame } from "@react-three/fiber";
import { BlendFunction, Effect, EffectAttribute } from "postprocessing";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { damp, scrollState } from "@/lib/home/scroll";

// One full-screen pass that makes the scene read as seen through a pane of
// glass. Everything is procedural (no textures) and costs 3 texture reads per
// pixel, so it stays cheap on phones.
const fragment = /* glsl */ `
uniform vec2 uMouse;     // cursor, uv (smoothed)
uniform vec2 uVel;       // cursor velocity, uv / s (smoothed)
uniform float uHover;    // 0..1 over something interactive
uniform float uAspect;
uniform float uTime;
uniform float uStrength;
uniform float uLensSize;   // cursor bump radius
uniform float uLens;       // cursor bump magnification
uniform float uSmear;      // smear along the cursor's motion
uniform float uBevel;      // bend toward the rim
uniform float uFringe;     // chromatic fringe
uniform float uStreak;     // diagonal reflection
uniform float uSheen;      // top-left sheen
uniform vec3 uTint;        // colour of the reflections

float band(float x, float c, float w) { float d = (x - c) / w; return exp(-d * d); }

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 asp = vec2(uAspect, 1.0);
  vec2 c = uv - 0.5;
  float edge = length(c * vec2(1.0, 0.85));

  // cursor: a soft glass bump that magnifies a touch, and smears along the motion
  vec2 d = (uv - uMouse) * asp;
  float dist2 = dot(d, d);
  float speed = min(length(uVel * asp), 3.0);
  float lens = exp(-dist2 / ((0.018 + 0.012 * uHover) * uLensSize * uLensSize));
  vec2 duv = uv;
  duv -= (uv - uMouse) * lens * ((0.035 + 0.04 * uHover) * uLens + 0.03 * speed * uSmear) * uStrength;
  duv -= uVel * lens * 0.018 * uSmear * uStrength;
  // thick-pane bevel: the view bends a little toward the rim
  duv -= c * pow(edge, 4.0) * 0.06 * uBevel * uStrength;

  // chromatic fringe: toward the edges, and around a moving cursor
  vec2 off = (c * smoothstep(0.35, 0.8, edge) * 0.004 + normalize(d + 1e-5) * lens * speed * 0.004) * uFringe * uStrength;
  vec3 col = vec3(
    texture2D(inputBuffer, duv + off).r,
    texture2D(inputBuffer, duv).g,
    texture2D(inputBuffer, duv - off).b
  );

  // reflections: long diagonal streaks that slide against the cursor
  float s = dot(uv * asp, vec2(0.92, 0.39)) - (uMouse.x - 0.5) * 0.08 - (uMouse.y - 0.5) * 0.03;
  float streaks = band(s, 1.42, 0.06) * 0.035 * uStreak; // one broad, soft reflection on the right
  // broad sheen from the top-left
  float sheen = exp(-dot((uv - vec2(0.12, 0.95)) * asp, (uv - vec2(0.12, 0.95)) * asp) / 0.18) * 0.06 * uSheen;

  float light = (streaks + sheen) * uStrength;

  col += light * uTint;
  // opaque: the scene buffer uses alpha 0 under 3D text to keep it out of bloom (SceneText)
  outputColor = vec4(col, 1.0);
}
`;

class GlassEffectImpl extends Effect {
  constructor() {
    super("GlassEffect", fragment, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.CONVOLUTION, // samples neighbours
      uniforms: new Map<string, THREE.Uniform>([
        ["uMouse", new THREE.Uniform(new THREE.Vector2(0.6, 0.6))],
        ["uVel", new THREE.Uniform(new THREE.Vector2())],
        ["uHover", new THREE.Uniform(0)],
        ["uAspect", new THREE.Uniform(1)],
        ["uTime", new THREE.Uniform(0)],
        ["uStrength", new THREE.Uniform(1)],
        ["uLensSize", new THREE.Uniform(1)],
        ["uLens", new THREE.Uniform(1)],
        ["uSmear", new THREE.Uniform(1)],
        ["uBevel", new THREE.Uniform(1)],
        ["uFringe", new THREE.Uniform(1)],
        ["uStreak", new THREE.Uniform(1)],
        ["uSheen", new THREE.Uniform(1)],
        ["uTint", new THREE.Uniform(new THREE.Color(1.0, 0.97, 0.93))],
      ]),
    });
  }
}

export type GlassSettings = {
  strength: number;
  lensSize: number;
  lens: number;
  smear: number;
  bevel: number;
  fringe: number;
  streak: number;
  sheen: number;
  tint: string;
};

/** Glass pane pass. Drop inside <EffectComposer>. Settings come from the "Glass" panel (useGlassControls). */
export function GlassEffect({ settings: g }: { settings: GlassSettings }) {
  const effect = useMemo(() => new GlassEffectImpl(), []);
  useEffect(() => () => effect.dispose(), [effect]);

  const s = useMemo(() => ({ mouse: new THREE.Vector2(0.6, 0.6), prev: new THREE.Vector2(0.6, 0.6), vel: new THREE.Vector2(), hover: 0 }), []);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 20);
    const t = state.clock.elapsedTime;
    const u = effect.uniforms;

    // target: the cursor, or (no mouse — touch devices) a slow drift so the glass still lives
    let tx: number, ty: number;
    if (scrollState.hasPointer) {
      tx = (scrollState.pointer.x + 1) / 2;
      ty = (scrollState.pointer.y + 1) / 2;
    } else {
      tx = 0.5 + Math.sin(t * 0.13) * 0.28;
      ty = 0.55 + Math.sin(t * 0.09 + 1.3) * 0.2;
    }
    const calm = scrollState.reducedMotion;
    s.prev.copy(s.mouse);
    s.mouse.x = damp(s.mouse.x, tx, calm ? 30 : 9, dt);
    s.mouse.y = damp(s.mouse.y, ty, calm ? 30 : 9, dt);
    const vx = (s.mouse.x - s.prev.x) / Math.max(dt, 1e-3);
    const vy = (s.mouse.y - s.prev.y) / Math.max(dt, 1e-3);
    s.vel.x = damp(s.vel.x, calm ? 0 : vx, 8, dt);
    s.vel.y = damp(s.vel.y, calm ? 0 : vy, 8, dt);
    const c = document.body.style.cursor; // set by the chicken / bucket hit areas
    s.hover = damp(s.hover, c === "grab" || c === "grabbing" || c === "pointer" ? 1 : 0, 7, dt);

    (u.get("uMouse")!.value as THREE.Vector2).copy(s.mouse);
    (u.get("uVel")!.value as THREE.Vector2).copy(s.vel);
    u.get("uHover")!.value = s.hover;
    u.get("uAspect")!.value = state.size.width / state.size.height;
    u.get("uTime")!.value = t;
    u.get("uStrength")!.value = g.strength;
    u.get("uLensSize")!.value = g.lensSize;
    u.get("uLens")!.value = g.lens;
    u.get("uSmear")!.value = g.smear;
    u.get("uBevel")!.value = g.bevel;
    u.get("uFringe")!.value = g.fringe;
    u.get("uStreak")!.value = g.streak;
    u.get("uSheen")!.value = g.sheen;
    (u.get("uTint")!.value as THREE.Color).set(g.tint);
  });

  return <primitive object={effect} />;
}
