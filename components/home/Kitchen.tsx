"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { KITCHEN } from "./config";
import { useKitchenLightControls, useRoomControls } from "./controls";

const URL = "/models/kitchen_new_layer.glb";

/**
 * The kitchen, where it was built: on the restaurant's open side (see KITCHEN).
 * It always stands there; the camera goes over to it for its step and comes back.
 */
export function Kitchen() {
  const { scene } = useGLTF(URL);
  const room = useRoomControls();
  const kl = useKitchenLightControls();
  // Its lighting is baked into its textures (the warm pools on the walls, the shine on the steel), so it is shown as
  // baked: unlit, the texture as it is. Lit again on top (the scene's lights and environment) it went gold and glared.
  // Two-sided: its walls are single planes, and from the restaurant's side they vanished (the way in showed black).
  const model = useMemo(() => {
    const tint = new THREE.Color(kl.kitchenColor).multiplyScalar(kl.kitchenIntensity);
    const baked = new Map<THREE.Material, THREE.MeshBasicMaterial>();
    const m = scene.clone(true);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((x) => {
        let b = baked.get(x);
        if (!b) {
          const src = x as THREE.MeshStandardMaterial;
          b = new THREE.MeshBasicMaterial({
            name: src.name,
            map: src.map,
            color: src.color.clone().multiply(tint),
            transparent: src.transparent,
            opacity: src.opacity,
            alphaTest: src.alphaTest,
            side: THREE.DoubleSide,
          });
          baked.set(x, b);
        }
        return b;
      });
      mesh.material = Array.isArray(mesh.material) ? mats : mats[0];
    });
    return m;
  }, [scene, kl.kitchenColor, kl.kitchenIntensity]);

  // the model is in its own frame: KITCHEN.origin / KITCHEN.turn put it in the room's, then the same placement as the room itself
  return (
    <group
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
