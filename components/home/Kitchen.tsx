"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { scrollState, smoothstep } from "@/lib/home/scroll";
import { KITCHEN } from "./config";
import { useRoomControls } from "./controls";

const URL = "/models/kitchen_layer.glb";

/**
 * The kitchen, where it was built: just in front of the restaurant's open side
 * (see KITCHEN). It stands right in the main view, so it only shows for the
 * kitchen step — fading in before the camera moves, out once it is back.
 */
export function Kitchen() {
  const { scene } = useGLTF(URL);
  const room = useRoomControls();

  const rig = useMemo(() => {
    const model = scene.clone(true);
    const mats: THREE.Material[] = [];
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = (mesh.material as THREE.Material).clone();
      mat.transparent = true;
      mesh.material = mat;
      mats.push(mat);
    });
    return { model, mats };
  }, [scene]);

  useFrame(() => {
    const p = scrollState.progress;
    const show = smoothstep(KITCHEN.showFrom, KITCHEN.showTo, p) * (1 - smoothstep(KITCHEN.hideFrom, KITCHEN.hideTo, p));
    rig.model.visible = show > 0.001;
    if (!rig.model.visible) return;
    for (const m of rig.mats) {
      m.opacity = show;
      // fully in: back to the opaque pass, so it sorts like the room
      m.transparent = show < 0.999;
      m.depthWrite = show > 0.5;
    }
  });

  // same placement as the room it is attached to
  return (
    <group
      position={room.position}
      rotation={room.rotation.map((d) => THREE.MathUtils.degToRad(d)) as [number, number, number]}
      scale={room.scale}
    >
      <primitive object={rig.model} />
    </group>
  );
}

useGLTF.preload(URL);
