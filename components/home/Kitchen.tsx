"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { scrollState } from "@/lib/home/scroll";
import { sharpen } from "@/lib/home/textures";
import { EXPORT_NAMES, KITCHEN } from "./config";
import { useKitchenRigControls, useRoomControls } from "./controls";

const URL = "/models/new_kitchen_animate.glb";
/** scroll position (sections) from which the kitchen can be in frame */
const KITCHEN_SEEN_FROM = 4.0;


/**
 * The model's steel (hoods, fryers, prep station, shelving) has warm baked into its colour textures (its "LightGray"
 * averages a brown), so under the scene's neutral light it read as bronze. Its colour is pulled toward grey in the
 * shader (the texture's detail stays) and lifted a little: `amount` 0 = as authored, 1 = fully grey.
 */
const STEEL = { amount: { value: 0.85 }, lift: { value: 1.25 } };
const isSteel = (m: THREE.Material) =>
  /metal|alumin|steel|chrome|LightGray|GDLM504|Color B03|LavenderBlush/i.test(m.name) ||
  // untitled metals too, but not the scanned pieces with their own metalness maps (the fried chicken in the baskets)
  (((m as THREE.MeshStandardMaterial).metalness ?? 0) >= 0.5 && !(m as THREE.MeshStandardMaterial).metalnessMap);
function steel(m: THREE.Material) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.steelAmount = STEEL.amount;
    sh.uniforms.steelLift = STEEL.lift;
    sh.fragmentShader = sh.fragmentShader
      .replace("void main() {", "uniform float steelAmount;\nuniform float steelLift;\nvoid main() {")
      .replace(
        "#include <map_fragment>",
        "#include <map_fragment>\n" +
          "diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)) * steelLift), steelAmount);",
      );
  };
  m.customProgramCacheKey = () => "kitchen-steel";
}

/**
 * The kitchen, where it was built: on the restaurant's open side (see KITCHEN).
 * It always stands there; the camera goes over to it for its step and comes back.
 */
export function Kitchen() {
  const { scene, animations } = useGLTF(URL);
  const gl = useThree((s) => s.gl);
  const room = useRoomControls();
  const rig = useKitchenRigControls();
  // Lit like the rest of the room: its own materials under the scene's default lights and environment.
  // Two-sided: its walls are single planes, and from the restaurant's side they vanished (the way in showed black).
  const model = useMemo(() => {
    const done = new Map<THREE.Material, THREE.Material>();
    const m = scene.clone(true);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((x) => {
        let c = done.get(x);
        if (!c) {
          c = x.clone();
          c.side = THREE.DoubleSide;
          if (isSteel(c)) steel(c);
          done.set(x, c);
        }
        return c;
      });
      mesh.material = Array.isArray(mesh.material) ? mats : mats[0];
    });
    sharpen(m, gl);
    return m;
  }, [scene, gl]);

  // how strongly the kitchen takes the scene's environment (its stainless reads as steel only with reflections to show)
  const holder = useRef<THREE.Group>(null);
  const envSet = useRef(-1);
  useFrame(() => {
    // the camera only sees the kitchen from the wall pan on: before that none of its 26 MB is drawn (or animated)
    if (holder.current) holder.current.visible = scrollState.progress > KITCHEN_SEEN_FROM;
    STEEL.amount.value = rig.steelGrey;
    STEEL.lift.value = rig.steelLift;
    const g = holder.current;
    if (!g || envSet.current === rig.envIntensity) return;
    envSet.current = rig.envIntensity;
    g.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (!(o as THREE.Mesh).isMesh || !m) return;
      for (const mat of Array.isArray(m) ? m : [m]) {
        if ("envMapIntensity" in mat) (mat as THREE.MeshStandardMaterial).envMapIntensity = rig.envIntensity;
      }
    });
  });

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
    const inKitchen = scrollState.progress >= KITCHEN.outTo - 0.15; // as the camera comes to rest on the authored view
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
      <group ref={holder} position={KITCHEN.origin} rotation={[0, KITCHEN.turn, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(URL);
