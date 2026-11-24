"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { scrollState } from "@/lib/home/scroll";
import { createStudioEnv } from "@/lib/home/studio";
import { sharpen } from "@/lib/home/textures";
import { EXPORT_NAMES, KITCHEN } from "./config";
import { useKitchenLightControls, useRoomControls } from "./controls";

const URL = "/models/kitchen_animate.glb";

/**
 * The kitchen, where it was built: on the restaurant's open side (see KITCHEN).
 * It always stands there; the camera goes over to it for its step and comes back.
 */
export function Kitchen() {
  const { scene, animations } = useGLTF(URL);
  const gl = useThree((s) => s.gl);
  const room = useRoomControls();
  const kl = useKitchenLightControls();
  // Its lighting is baked into its textures (the warm pools on the walls, the shine on the steel), so it is shown as
  // baked: unlit, the texture as it is. Lit again on top (the scene's lights and environment) it went gold and glared.
  // Two-sided: its walls are single planes, and from the restaurant's side they vanished (the way in showed black).
  const studio = useMemo(() => createStudioEnv(gl), [gl]);
  useEffect(() => () => studio.dispose(), [studio]);
  const model = useMemo(() => {
    const tint = new THREE.Color(kl.kitchenColor).multiplyScalar(kl.kitchenIntensity);
    const baked = new Map<THREE.Material, THREE.Material>();
    const m = scene.clone(true);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((x) => {
        let b = baked.get(x);
        if (!b) {
          const src = x as THREE.MeshStandardMaterial;
          if (src.map) {
            // textured parts carry their light in the picture (baked): shown as it is
            const basic = new THREE.MeshBasicMaterial({
              name: src.name,
              map: src.map,
              color: src.color.clone().multiply(tint),
              transparent: src.transparent,
              opacity: src.opacity,
              alphaTest: src.alphaTest,
              side: THREE.DoubleSide,
            });
            // the pictures are all one gold: pull their colour back toward grey by `kitchenSaturation`
            basic.onBeforeCompile = (shader) => {
              shader.uniforms.uSat = { value: kl.kitchenSaturation };
              shader.fragmentShader = shader.fragmentShader
                .replace("void main() {", "uniform float uSat;\nvoid main() {")
                .replace(
                  "#include <map_fragment>",
                  `#include <map_fragment>
                  float lum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
                  // bright orange (the fried chicken: green about half the red) keeps its colour; the gold of the walls, floor and steel doesn't
                  float hue = diffuseColor.g / max(diffuseColor.r, 1e-3);
                  float food = (1.0 - smoothstep(0.55, 0.72, hue)) * smoothstep(0.3, 0.5, diffuseColor.r) * step(diffuseColor.b, diffuseColor.g);
                  diffuseColor.rgb = mix(vec3(lum), diffuseColor.rgb, mix(uSat, 1.0, food));
                  // lift the dark walls and floor without blowing out the whites
                  diffuseColor.rgb = pow(diffuseColor.rgb, vec3(0.78));`,
                );
            };
            b = basic;
          } else {
            // plain colours and metals (steel, black fittings) have nothing baked: they are lit by the studio environment,
            // which gives them their reflections instead of one flat grey
            const lit = src.clone();
            lit.envMap = studio;
            lit.envMapIntensity = kl.kitchenReflection;
            lit.color.multiply(tint);
            lit.side = THREE.DoubleSide;
            b = lit;
          }
          baked.set(x, b);
        }
        return b;
      });
      mesh.material = Array.isArray(mesh.material) ? mats : mats[0];
    });
    sharpen(m, gl);
    return m;
  }, [scene, gl, studio, kl.kitchenColor, kl.kitchenIntensity, kl.kitchenReflection, kl.kitchenSaturation]);

  // the model's own animation: plays once as the camera comes into the kitchen, then holds its last pose (no loop).
  // Scrolling back out of the kitchen rewinds it, so it plays again on the way back in
  const { actions } = useAnimations(animations, model);
  const playing = useRef(false);
  useEffect(() => {
    const all = Object.values(actions);
    all.forEach((a) => {
      if (!a) return;
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;
      a.reset();
      a.paused = true; // shows its first pose until the camera arrives
      a.play();
    });
    playing.current = false;
    return () => all.forEach((a) => a?.stop());
  }, [actions]);
  useFrame(() => {
    const inKitchen = scrollState.progress >= KITCHEN.outFrom + (KITCHEN.outTo - KITCHEN.outFrom) * 0.5;
    if (inKitchen === playing.current) return;
    playing.current = inKitchen;
    Object.values(actions).forEach((a) => {
      if (!a) return;
      a.reset();
      a.paused = !inKitchen;
      a.play();
    });
  });

  // the model is in its own frame: KITCHEN.origin / KITCHEN.turn put it in the room's, then the same placement as the room itself
  return (
    <group
      name={EXPORT_NAMES.kitchen}
      position={room.position}
      rotation={room.rotation.map((d) => THREE.MathUtils.degToRad(d)) as [number, number, number]}
      scale={room.scale}
    >
      <group position={KITCHEN.origin} rotation={[0, KITCHEN.turn, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(URL);
