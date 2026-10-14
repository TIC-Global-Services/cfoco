"use client";

// Dev scene controller (leva). Every tweakable value in the scene is defined
// here with its production default; the panel is hidden in production builds,
// so these hooks simply return the defaults there.
//
// Workflow: tweak in the panel → "Log config" → paste values back as defaults.

import { button, folder, levaStore, useControls } from "leva";
import { scrollApi } from "@/lib/home/scroll";
import { CAMERA, SECTIONS } from "./config";

const v3 = (v: { x: number; y: number; z: number }) => [v.x, v.y, v.z] as [number, number, number];

// ---------- Section navigation (top of the panel) ----------

export function useSectionControls() {
  return useControls(
    "Section",
    {
      jump: {
        label: "go to",
        options: Object.fromEntries(SECTIONS.map((s, i) => [`${i + 1}. ${s.title.replace(/\n/g, " ")}`, i])),
        value: 0,
        onChange: (i: number, _path, ctx) => {
          if (!ctx.initial) scrollApi.toSection(i);
        },
        transient: true,
      },
      "Log config": button(() => {
        const data = levaStore.getData() as Record<string, { value?: unknown }>;
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(data)) if (v && "value" in v) out[k] = v.value;
        console.log(JSON.stringify(out, null, 2));
      }),
    },
    { order: -2 },
  );
}

// ---------- Camera (locked view) ----------

export function useCameraControls() {
  return useControls(
    "Camera",
    {
      position: { value: v3(CAMERA.position), step: 0.05 },
      target: { value: v3(CAMERA.target), step: 0.05 },
      fov: { value: CAMERA.fov, min: 20, max: 75, step: 0.5 },
    },
    { collapsed: true },
  );
}

// ---------- Hero (hand + chicken + bucket) ----------

export function useHeroControls() {
  return useControls(
    "Hero",
    {
      scale: { value: 1, min: 0.3, max: 2, step: 0.01 },
      offset: { value: [0, 0, 0] as [number, number, number], step: 0.01, hint: "right / up / toward camera (m)" },
      spin: { value: 0, min: -180, max: 180, step: 1, label: "yaw°" },
      parallax: { value: 1, min: 0, max: 3, step: 0.05, label: "cursor drift" },
    },
    { collapsed: true },
  );
}

// ---------- Models: position / rotation / scale ----------

type V3 = [number, number, number];
const xyz = (v: V3, step = 0.01, label?: string) => ({ value: v, step, ...(label ? { label } : {}) });

export function useRoomControls() {
  return useControls(
    "Room",
    {
      position: xyz([0, 0, 0] as V3),
      rotation: { ...xyz([0, 0, 0] as V3, 0.5), label: "rotation°" },
      scale: { value: 1, min: 0.2, max: 3, step: 0.01 },
    },
    { collapsed: true },
  );
}

/** The neon CFOCO logo on the back wall (Restaurant). Offsets are from where it was authored. */
export function useLogoControls() {
  return useControls(
    "Logo",
    {
      visible: true,
      position: { ...xyz([0, 0, 0] as V3), label: "offset" },
      rotation: { ...xyz([0, 0, 0] as V3, 0.5), label: "rotation°" },
      scale: { value: 1, min: 0.2, max: 3, step: 0.01, label: "size" },
      glow: { value: 0.5, min: 0, max: 3, step: 0.01, label: "glow (all)" },
      letters: { value: "#ffffff", label: "letters colour" },
      lettersGlow: { value: 0, min: 0, max: 3, step: 0.01, label: "letters glow" },
      comb: { value: "#ff1927", label: "comb colour" },
      combGlow: { value: 0.5, min: 0, max: 3, step: 0.01, label: "comb glow" },
      beak: { value: "#ffc100", label: "beak / ring colour" },
      beakGlow: { value: 0.5, min: 0, max: 3, step: 0.01, label: "beak / ring glow" },
    },
    { collapsed: true },
  );
}

export function useChickenControls() {
  return useControls(
    "Chicken",
    {
      offset: { ...xyz([0, 0, 0] as V3), hint: "right / up / toward camera (m)" },
      rotation: { ...xyz([0, 0, 0] as V3, 0.5), label: "rotation°", hint: "extra tilt on top of the hero pose" },
      scale: { value: 1, min: 0.3, max: 2.5, step: 0.01 },
      landedScale: { value: 1, min: 0.3, max: 2.5, step: 0.01, label: "scale in bucket" },
    },
    { collapsed: true },
  );
}

export function useBucketControls() {
  return useControls(
    "Bucket",
    {
      offset: { ...xyz([0, 0, 0] as V3), hint: "right / up / toward camera (m)" },
      rotation: { ...xyz([0, 0, 0] as V3, 0.5), label: "rotation°" },
      scale: { value: 1, min: 0.3, max: 2.5, step: 0.01 },
    },
    { collapsed: true },
  );
}

// ---------- Lights (environment dimmed; ambient + hemisphere + a soft key fill the room) ----------

export function useLightControls() {
  return useControls(
    "Light",
    {
      background: "#04060c",
      intensity: { value: 0.5, min: 0, max: 4, step: 0.05, label: "environment" },
      exposure: { value: 0.5, min: 0.2, max: 3, step: 0.05 },
      ambient: folder({
        ambientColor: { value: "#ffffff", label: "color" },
        ambientIntensity: { value: 0.3, min: 0, max: 3, step: 0.01, label: "intensity" },
      }),
      hemisphere: folder({
        hemiSky: { value: "#9db4ff", label: "sky" },
        hemiGround: { value: "#2a1a10", label: "ground" },
        hemiIntensity: { value: 3, min: 0, max: 3, step: 0.01, label: "intensity" },
      }),
      key: folder({
        keyColor: { value: "#fff1e0", label: "color" },
        keyIntensity: { value: 1, min: 0, max: 10, step: 0.05, label: "intensity" },
        keyPos: { ...xyz([4, 6, 8] as V3, 0.25), label: "position" },
      }),
      fill: folder({
        fillColor: { value: "#a8c0ff", label: "color" },
        fillIntensity: { value: 0, min: 0, max: 10, step: 0.05, label: "intensity" },
        fillPos: { ...xyz([-5, 3, 8] as V3, 0.25), label: "position" },
      }),
      point: folder({
        pointColor: { value: "#ffb070", label: "color" },
        pointIntensity: { value: 0, min: 0, max: 300, step: 1, label: "intensity" },
        pointPos: { ...xyz([0, 4, 6] as V3, 0.25), label: "position" },
        pointDistance: { value: 7.5, min: 1, max: 40, step: 0.5, label: "reach" },
      }),
      spot: folder({
        spotColor: { value: "#ffd9a8", label: "color" },
        spotIntensity: { value: 0, min: 0, max: 600, step: 1, label: "intensity" },
        spotPos: { ...xyz([0, 7, 9] as V3, 0.25), label: "position" },
        spotTarget: { ...xyz([0, 1, 7] as V3, 0.25), label: "aims at" },
        spotAngle: { value: 0.6, min: 0.1, max: 1.5, step: 0.01, label: "cone" },
        spotPenumbra: { value: 0.7, min: 0, max: 1, step: 0.01, label: "softness" },
      }),
    },
    { collapsed: true },
  );
}

// ---------- Hero lighting (a studio rig that travels with the chicken + bucket) ----------

export function useHeroLightControls() {
  return useControls(
    "Hero light",
    {
      envIntensity: { value: 0.75, min: 0, max: 3, step: 0.05, label: "studio reflections" },
      key: folder({
        keyColor: { value: "#ffd3a1", label: "color" },
        keyIntensity: { value: 32, min: 0, max: 150, step: 1, label: "intensity" },
      }),
      rim: folder({
        rimColor: { value: "#86a8ff", label: "color" },
        rimIntensity: { value: 70, min: 0, max: 250, step: 1, label: "intensity" },
      }),
      cursor: folder({
        cursorColor: { value: "#fff0dc", label: "color" },
        cursorIntensity: { value: 0, min: 0, max: 40, step: 0.5, label: "intensity" },
        cursorHoverBoost: { value: 1.6, min: 1, max: 5, step: 0.1, label: "on hover ×" },
      }),
      fryGlow: { value: 7, min: 0, max: 60, step: 0.5, label: "fry glow (swap)" },
      bucket: folder({
        bucketEnv: { value: 1.5, min: 0, max: 4, step: 0.05, label: "reflections" },
        bucketGloss: { value: 0.8, min: 0, max: 1, step: 0.01, label: "gloss (clearcoat)" },
        bucketKeyColor: { value: "#fff3e2", label: "light color" },
        bucketKeyIntensity: { value: 45, min: 0, max: 200, step: 1, label: "light" },
      }),
    },
    { collapsed: true },
  );
}

// ---------- Post (bloom / vignette) ----------

export function usePostControls() {
  return useControls(
    "Post",
    {
      enabled: true,
      bloom: { value: 0.4, min: 0, max: 3, step: 0.05 },
      threshold: { value: 1, min: 0, max: 2, step: 0.01, label: "bloom threshold" },
      vignette: { value: 0.4, min: 0, max: 1, step: 0.01 },
    },
    { collapsed: true },
  );
}

/** The glass pane the scene is seen through (GlassEffect). Each part is a multiplier on the shader's base amount (1). */
export function useGlassControls() {
  return useControls(
    "Glass",
    {
      enabled: true,
      strength: { value: 0.4, min: 0, max: 3, step: 0.05, label: "overall" },
      lensSize: { value: 0.7, min: 0.2, max: 4, step: 0.05, label: "cursor lens size" },
      lens: { value: 0.65, min: 0, max: 4, step: 0.05, label: "cursor magnify" },
      smear: { value: 1, min: 0, max: 4, step: 0.05, label: "motion smear" },
      bevel: { value: 1, min: 0, max: 4, step: 0.05, label: "edge bevel" },
      fringe: { value: 1, min: 0, max: 5, step: 0.05, label: "colour fringe" },
      streak: { value: 1, min: 0, max: 5, step: 0.05, label: "reflection streak" },
      sheen: { value: 1, min: 0, max: 5, step: 0.05, label: "top sheen" },
      tint: { value: "#fff8ed", label: "reflection tint" },
    },
    { collapsed: true },
  );
}

// ---------- Cursor interaction ----------

export function useInteractionControls() {
  return useControls(
    "Interaction",
    {
      cameraParallax: { value: 0.15, min: 0, max: 1.2, step: 0.01, label: "camera orbit (m)" },
      lean: { value: 0.6, min: 0, max: 3, step: 0.05, label: "lean to cursor" },
      hoverScale: { value: 1.06, min: 1, max: 1.3, step: 0.01, label: "hover scale" },
      dragSpeed: { value: 1, min: 0.2, max: 3, step: 0.05, label: "drag spin" },
    },
    { collapsed: true },
  );
}

// ---------- Sound ----------

export function useSoundControls() {
  return useControls(
    "Sound",
    {
      volume: { value: 1, min: 0, max: 1.5, step: 0.05, label: "fry sizzle" },
      whoosh: { value: 0.5, min: 0, max: 1.5, step: 0.05, label: "rise / drop whoosh" },
      impact: { value: 0.75, min: 0, max: 1.5, step: 0.05, label: "bucket landing" },
      music: { value: 0.12, min: 0, max: 1, step: 0.01, label: "background music" },
      ambience: { value: 0.5, min: 0, max: 1.5, step: 0.05, label: "room + kitchen" },
    },
    { collapsed: true },
  );
}

// ---------- 3D copy ----------

export function useTextControls() {
  return useControls(
    "Text",
    {
      enabled: { value: true, label: "3D text" },
      depth: { value: 5.5, min: 3, max: 12, step: 0.1, label: "depth (m)" },
      lean: { value: 1, min: 0, max: 3, step: 0.05, label: "lean to cursor" },
    },
    { collapsed: true },
  );
}

// ---------- air: dust ----------

export function useParticleControls() {
  return useControls(
    "Particles",
    {
      dust: { value: 300, min: 0, max: 3000, step: 50, label: "dust count" },
      size: { value: 0.016, min: 0.002, max: 0.05, step: 0.001, label: "dust size (m)" },
      opacity: { value: 2.4, min: 0, max: 6, step: 0.01, label: "dust brightness" },
    },
    { collapsed: true },
  );
}

// ---------- the turntable in the room (a sound toggle) ----------

export function useTurntableControls() {
  return useControls(
    "Turntable",
    {
      // on the front-right round table (interior_environment.glb "Cylinder", top at y 1.0),
      // clear of the copy in every section
      position: xyz([3.15, 1.0, 5.45] as V3),
      size: { value: 0.9, min: 0.3, max: 3, step: 0.05, label: "width (m)" },
      tilt: { value: 12, min: 0, max: 70, step: 1, label: "tilt to lens (°)" },
      yaw: { value: 0, min: -90, max: 90, step: 1, label: "turn (°)" },
    },
    { collapsed: true },
  );
}
