"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, EffectGroup, ToneMapping, Vignette } from "@react-three/postprocessing";
import { type BloomEffect, ToneMappingMode } from "postprocessing";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CameraRig } from "./CameraRig";
import { GlassEffect } from "./GlassEffect";
import { HeroChicken } from "./HeroChicken";
import { Kitchen } from "./Kitchen";
import { RisingMachines } from "./RisingMachines";
import { Particles } from "./Particles";
import { Restaurant } from "./Restaurant";
import { SceneText } from "./SceneText";
import { Turntable } from "./Turntable";
import {
  KIOSKS,
  KIOSK_HEIGHT,
  KIOSK_URL,
  MEAL,
  MEAL_MACHINES,
  ROBOT,
  ROBOT_FACING,
  ROBOT_HEIGHT,
  ROBOT_URL,
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
  // phones / tablets / low-core machines: lighter resolution and no MSAA so it stays smooth
  const lite = useMemo(
    () => window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency ?? 8) <= 4,
    [],
  );

  return (
    <Canvas
      dpr={lite ? [1, 1.25] : [1, 1.5]}
      // opaque drawing buffer: the HDR buffer carries alpha 0 under 3D text (bloom mask), never the page
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", stencil: false }}
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
        <RisingMachines url={KIOSK_URL} height={KIOSK_HEIGHT} machines={KIOSKS} />
        <RisingMachines url={VENDING_URL} height={VENDING_HEIGHT} machines={VENDING} facing={VENDING_FACING} />
        <RisingMachines url={ROBOT_URL} height={ROBOT_HEIGHT} machines={ROBOT} facing={ROBOT_FACING} />
        {MEAL.items.map((m, i) => (
          <RisingMachines
            key={m.url}
            url={m.url}
            height={m.height}
            machines={MEAL_MACHINES[i]}
            phoneFit={0.62}
            lit={i === 0}
            clips={m.url.endsWith("fries.glb")}
          />
        ))}
        <SceneText />
        <Turntable />
      </Suspense>
      <Particles lite={lite} />
      <CameraRig />
      {post.enabled && (
        <EffectComposer multisampling={lite ? 0 : 4} frameBufferType={THREE.HalfFloatType}>
          {/* own pass: the glass re-samples its input, so bloom has to be baked in before it */}
          <EffectGroup>
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
