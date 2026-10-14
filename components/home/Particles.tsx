"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { damp, scrollState } from "@/lib/home/scroll";
import { CAMERA } from "./config";
import { useParticleControls } from "./controls";

// Air in the room: slow-drifting dust motes, one point cloud animated entirely
// on the GPU (one draw, no per-frame buffer uploads). Fake depth of field
// (motes near the lens are big soft bokeh discs), a twinkle as they turn in
// the light, brighter where the hero's key light hits them, pushed aside by
// the cursor and stirred by scrolling.
//
// It adds light without touching alpha, so the bloom mask (Scene.tsx) and the
// 3D copy (SceneText) are unaffected.

/** where the hero hangs: the authored lens axis, 4 m in */
const HERO = CAMERA.position.clone().add(new THREE.Vector3(0, 0, -4));

const DUST_MIN = new THREE.Vector3(-7, -0.2, -8);
const DUST_SIZE = new THREE.Vector3(14, 6.8, 18.8); // reaches ~1 m in front of the lens

function additive(m: THREE.ShaderMaterial) {
  // premultiplied colour added on top; destination alpha left as is
  m.blending = THREE.CustomBlending;
  m.blendEquation = THREE.AddEquation;
  m.blendSrc = THREE.OneFactor;
  m.blendDst = THREE.OneFactor;
  m.blendSrcAlpha = THREE.ZeroFactor;
  m.blendDstAlpha = THREE.OneFactor;
  m.transparent = true;
  m.depthWrite = false;
  return m;
}

const dustVertex = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uStir;
uniform vec3 uMin;
uniform vec3 uSize;
uniform vec3 uHero;
uniform vec2 uMouse;
uniform float uAspect;
uniform float uScale;   // px per world unit at 1 m
uniform float uPointSize;
uniform float uFocus;
varying float vAlpha;
varying float vSoft;
varying float vWarm;

void main() {
  // slow rise + lateral wander, wrapped inside the box
  vec3 u = position;
  u.y += uTime * (0.004 + 0.01 * aSeed.x) + uStir * (0.6 + aSeed.y);
  u.x += sin(uTime * (0.07 + 0.1 * aSeed.y) + aSeed.z * 40.0) * 0.012;
  u.z += cos(uTime * (0.05 + 0.08 * aSeed.z) + aSeed.x * 40.0) * 0.01;
  vec3 p = uMin + fract(u) * uSize;
  p += vec3(sin(uTime * 0.6 + aSeed.w * 50.0), cos(uTime * 0.45 + aSeed.x * 50.0), sin(uTime * 0.5 + aSeed.y * 50.0)) * 0.05;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;

  // the cursor parts the air: push away from it on screen
  vec2 ndc = clip.xy / clip.w;
  vec2 dl = (ndc - uMouse) * vec2(uAspect, 1.0);
  float f = exp(-dot(dl, dl) / 0.025);
  ndc += normalize(dl + 1e-5) / vec2(uAspect, 1.0) * f * 0.07;
  clip.xy = ndc * clip.w;
  gl_Position = clip;

  float depth = -mv.z;
  // fake depth of field around the hero distance
  float coc = clamp(abs(depth - uFocus) / max(depth, 0.3), 0.0, 3.0);
  float size = uPointSize * (0.45 + aSeed.w) * (1.0 + coc * 2.2);
  gl_PointSize = clamp(size * uScale / depth, 1.0, 90.0);

  float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed.x * 1.6) + aSeed.y * 30.0);
  float lit = 0.35 + 1.8 * exp(-dot(p - uHero, p - uHero) / 2.2) + 0.25 * smoothstep(3.5, 6.5, p.y);
  float fadeEdge = smoothstep(0.4, 1.3, depth) * (1.0 - smoothstep(16.0, 22.0, depth));
  vAlpha = twinkle * lit * fadeEdge / (1.0 + coc * coc * 2.0);
  vSoft = clamp(coc * 0.6, 0.0, 0.85);
  vWarm = exp(-dot(p - uHero, p - uHero) / 3.0);
}
`;

const dustFragment = /* glsl */ `
uniform float uOpacity;
varying float vAlpha;
varying float vSoft;
varying float vWarm;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  // sharp specks in focus, flat soft discs out of it
  float a = 1.0 - smoothstep(1.0 - (0.75 * (1.0 - vSoft) + 0.1), 1.0, d);
  a *= mix(1.0 - d * d, 1.0, vSoft * 0.7);
  if (a <= 0.002) discard;
  vec3 col = mix(vec3(0.82, 0.86, 1.0), vec3(1.0, 0.8, 0.55), 0.35 + 0.65 * vWarm);
  gl_FragColor = vec4(col * a * vAlpha * uOpacity, 0.0);
}
`;

function cloud(count: number, seedFn: (i: number) => [number, number, number]) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    pos.set(seedFn(i), i * 3);
    seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  // positions are computed on the GPU: never cull
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
  return g;
}

export function Particles({ lite }: { lite: boolean }) {
  const c = useParticleControls();
  const count = Math.round(c.dust * (lite ? 0.5 : 1));

  const dust = useMemo(() => {
    const geometry = cloud(count, () => [Math.random(), Math.random(), Math.random()]);
    const material = additive(
      new THREE.ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        uniforms: {
          uTime: { value: 0 },
          uStir: { value: 0 },
          uMin: { value: DUST_MIN },
          uSize: { value: DUST_SIZE },
          uHero: { value: HERO },
          uMouse: { value: new THREE.Vector2(9, 9) },
          uAspect: { value: 1 },
          uScale: { value: 500 },
          uPointSize: { value: 0.02 },
          uFocus: { value: 4.2 },
          uOpacity: { value: 1 },
        },
      }),
    );
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = 2;
    return points;
  }, [count]);

  useEffect(
    () => () => {
      dust.geometry.dispose();
      (dust.material as THREE.Material).dispose();
    },
    [dust],
  );

  const s = useMemo(() => ({ stir: 0, mouse: new THREE.Vector2(9, 9) }), []);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 20);
    const t = state.clock.elapsedTime;
    const cam = state.camera as THREE.PerspectiveCamera;
    const motion = scrollState.reducedMotion ? 0.15 : 1;
    // px per world unit at 1 m in front of the lens
    const scale = (state.size.height * state.gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));

    const du = (dust.material as THREE.ShaderMaterial).uniforms;
    du.uTime.value = t * motion;
    // scrolling stirs the air a little (wraps, so it never runs away)
    s.stir = (s.stir + THREE.MathUtils.clamp(scrollState.velocity, -60, 60) * dt * 0.00012 * motion) % 1;
    du.uStir.value = s.stir;
    const on = scrollState.hasPointer && !scrollState.reducedMotion;
    s.mouse.x = damp(s.mouse.x, on ? scrollState.pointer.x : 9, 6, dt);
    s.mouse.y = damp(s.mouse.y, on ? scrollState.pointer.y : 9, 6, dt);
    (du.uMouse.value as THREE.Vector2).copy(s.mouse);
    du.uAspect.value = state.size.width / state.size.height;
    du.uScale.value = scale;
    du.uPointSize.value = c.size;
    du.uOpacity.value = c.opacity;
  });

  return <primitive object={dust} />;
}
