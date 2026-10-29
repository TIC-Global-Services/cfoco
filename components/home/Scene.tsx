"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, EffectGroup, ToneMapping, Vignette } from "@react-three/postprocessing";
import { type BloomEffect, ToneMappingMode } from "postprocessing";
import { PerformanceMonitor } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { scrollState } from "@/lib/home/scroll";
import { CameraRig } from "./CameraRig";
import { GlassEffect } from "./GlassEffect";
import { HeroChicken } from "./HeroChicken";
import { Kitchen } from "./Kitchen";
import { RisingMachines } from "./RisingMachines";
import { Particles } from "./Particles";
import { Restaurant } from "./Restaurant";
import { EditorExport } from "./EditorExport";
import { RouteEditor } from "./RouteEditor";
import { ServeRobot } from "./ServeRobot";
import { SceneText } from "./SceneText";
import { Turntable } from "./Turntable";
import {
  KIOSKS,
  KIOSK_FACING,
  KIOSK_HEIGHT,
  KIOSK_URL,
  VENDING,
  VENDING_FACING,
  VENDING_HEIGHT,
  VENDING_URL,
} from "./config";
import { useGlassControls, useLightControls, usePostControls, useSectionControls } from "./controls";

/**
 * The room is lit by a dimmed neutral environment map plus ambient,
 * hemisphere and a soft key light (see useLightControls). The hero
 * brings its own studio (reflections + a key/rim/cursor light rig, see
 * HeroChicken). Post on top: bloom for the neon / emissives / the fry glow,
 * the glass pane the whole scene is seen through (GlassEffect), a vignette,
 * and the tone mapping (moved off the renderer so bloom works on HDR values).
 * The section copy is real 3D type too (SceneText), kept out of the bloom.
 */
export default function Scene() {
  useSectionControls();
  const light = useLightControls();
  const post = usePostControls();
  const glass = useGlassControls();
  // phones / tablets (a touch screen as the main pointer): no bloom
  const touch = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);
  // …and with low-core machines: lighter resolution and no MSAA so it stays smooth
  const lite = useMemo(() => touch || (navigator.hardwareConcurrency ?? 8) <= 4, [touch]);

  // resolution: the screen's own pixel density (a retina screen is 2×; below it every texture is softer than in a
  // model viewer), capped by a pixel budget for very big windows — then it follows the frame rate: down a step when
  // the machine can't keep up, back up when it can
  const cap = useMemo(() => {
    const area = window.innerWidth * window.innerHeight;
    const byPixels = Math.sqrt((lite ? 2.5e6 : 7e6) / Math.max(area, 1));
    return Math.max(0.75, Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2, byPixels));
  }, [lite]);
  const [dpr, setDpr] = useState(cap);

  return (
    <Canvas
      dpr={dpr}
      // opaque drawing buffer: the HDR buffer carries alpha 0 under 3D text (bloom mask), never the page
      // retina screens (2×): no MSAA — the pixels are already finer than its edges, and at that size it costs the most
      gl={{ antialias: (window.devicePixelRatio || 1) < 1.5, alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 53.7, near: 0.05, far: 60, position: [0, 2, 11.5] }}
      onCreated={(state) => {
        state.gl.outputColorSpace = THREE.SRGBColorSpace;
        state.gl.toneMapping = THREE.NeutralToneMapping;
        if (process.env.NODE_ENV !== "production") {
          (window as unknown as { __three: typeof state }).__three = state;
        }
      }}
    >
      <color attach="background" args={[light.background]} />
      <Studio intensity={light.intensity} exposure={light.exposure} />
      <Lights l={light} />
      <Suspense fallback={null}>
        <Restaurant />
        <Kitchen />
        <HeroChicken />
        <RisingMachines url={KIOSK_URL} height={KIOSK_HEIGHT} machines={KIOSKS} facing={KIOSK_FACING} world />
        <RisingMachines url={VENDING_URL} height={VENDING_HEIGHT} machines={VENDING} facing={VENDING_FACING} world viewDir={[0, 1]} />
        <ServeRobot />
        <SceneText hdr={post.enabled} />
        <Warmup />
        {/* <Turntable /> */}
      </Suspense>
      <Particles lite={lite} />
      {/* only once the loader has cleared: while models and textures upload every frame is slow, and it used to drop the
          resolution for good before the page was even shown (desktops never below 1×) */}
      <AfterIntro>
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr((d) => Math.max(lite ? 0.75 : 1, d * 0.85))}
          onIncline={() => setDpr((d) => Math.min(cap, d / 0.85))}
        />
      </AfterIntro>
      <CameraRig />
      {scrollState.debug && <RouteEditor />}
      {scrollState.debug && <EditorExport />}
      {post.enabled && (
        <EffectComposer multisampling={lite ? 0 : 2} frameBufferType={THREE.HalfFloatType}>
          {/* own pass: the glass re-samples its input, so bloom has to be baked in before it */}
          <EffectGroup enabled={!touch}>
            <Bloom
              ref={maskBloomByAlpha}
              mipmapBlur
              intensity={post.bloom}
              luminanceThreshold={post.threshold}
              luminanceSmoothing={0.25}
              radius={0.72}
            />
          </EffectGroup>
          {glass.enabled && <GlassEffect settings={glass} />}
          <Vignette offset={0.28} darkness={post.vignette} />
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

/** renders its children once the loader has cleared (and the opening has had a second to settle) */
function AfterIntro({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (on) return;
    const id = window.setInterval(() => {
      if (performance.now() / 1000 > scrollState.introAt + 1) setOn(true);
    }, 250);
    return () => window.clearInterval(id);
  }, [on]);
  return on ? <>{children}</> : null;
}

/**
 * Bloom's bright-pass, weighted by the scene buffer's alpha. 3D text writes
 * alpha 0 (see SceneText), so it never glows, with exact glyph edges and no
 * extra render.
 */
function maskBloomByAlpha(effect: BloomEffect | null) {
  if (!effect) return;
  const m = effect.luminanceMaterial;
  if (m.userData.alphaMasked) return;
  m.fragmentShader = m.fragmentShader
    .replace("float mask=1.0;", "float mask=texel.a;")
    .replace("mask=smoothstep(threshold,threshold+smoothing,l);", "mask=texel.a*smoothstep(threshold,threshold+smoothing,l);");
  m.userData.alphaMasked = true;
  m.needsUpdate = true;
}

type LightValues = ReturnType<typeof useLightControls>;

/** Optional lights — each is only mounted when its intensity is above zero. */
function Lights({ l }: { l: LightValues }) {
  const spotTarget = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    spotTarget.position.fromArray(l.spotTarget);
    spotTarget.updateMatrixWorld();
  }, [spotTarget, l.spotTarget]);

  return (
    <>
      {l.ambientIntensity > 0 && <ambientLight color={l.ambientColor} intensity={l.ambientIntensity} />}
      {l.hemiIntensity > 0 && <hemisphereLight color={l.hemiSky} groundColor={l.hemiGround} intensity={l.hemiIntensity} />}
      {l.keyIntensity > 0 && <directionalLight color={l.keyColor} intensity={l.keyIntensity} position={l.keyPos} />}
      {l.fillIntensity > 0 && <directionalLight color={l.fillColor} intensity={l.fillIntensity} position={l.fillPos} />}
      {l.pointIntensity > 0 && (
        <pointLight color={l.pointColor} intensity={l.pointIntensity} position={l.pointPos} distance={l.pointDistance} decay={2} />
      )}
      {l.spotIntensity > 0 && (
        <>
          <primitive object={spotTarget} />
          <spotLight
            color={l.spotColor}
            intensity={l.spotIntensity}
            position={l.spotPos}
            target={spotTarget}
            angle={l.spotAngle}
            penumbra={l.spotPenumbra}
            decay={2}
          />
        </>
      )}
    </>
  );
}

function Studio({ intensity, exposure }: { intensity: number; exposure: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return texture;
  }, [gl]);

  useEffect(() => {
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [scene, env]);

  useEffect(() => {
    scene.environmentIntensity = intensity;
    gl.toneMappingExposure = exposure;
  }, [scene, gl, intensity, exposure]);

  return null;
}

/**
 * Compiles every shader and uploads every texture up front, while the loader is still up: the robot, the kitchen's
 * furniture, the hero's pieces and the machines are all hidden until their scroll step, and the first frame each
 * shows in used to stall on its programs (and 1 GB of textures) mid-scroll.
 */
function Warmup() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    let dead = false;
    const id = window.setTimeout(() => {
      const hidden: THREE.Object3D[] = [];
      const seen = new Set<THREE.Texture>();
      scene.traverse((o) => {
        if (!o.visible && !(o as THREE.Light).isLight) {
          hidden.push(o);
          o.visible = true;
        }
        const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        for (const mat of Array.isArray(m) ? m : m ? [m] : []) {
          for (const v of Object.values(mat)) if (v && (v as THREE.Texture).isTexture) seen.add(v as THREE.Texture);
        }
      });
      try {
        gl.compile(scene, camera);
        if (!dead) seen.forEach((t) => gl.initTexture(t));
      } catch {
        /* a warm-up only */
      }
      hidden.forEach((o) => (o.visible = false));
    }, 1200);
    return () => {
      dead = true;
      window.clearTimeout(id);
    };
  }, [gl, scene, camera]);

  return null;
}
