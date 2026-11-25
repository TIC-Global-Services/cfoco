"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { scrollState } from "@/lib/home/scroll";
import { sharpen } from "@/lib/home/textures";
import { EXPORT_NAMES, KITCHEN } from "./config";
import { useRoomControls } from "./controls";

const URL = "/models/kitchen_animate.glb";

/**
 * The kitchen, where it was built: on the restaurant's open side (see KITCHEN).
 * It always stands there; the camera goes over to it for its step and comes back.
 */
export function Kitchen() {
  const { scene, animations } = useGLTF(URL);
  const gl = useThree((s) => s.gl);
  const room = useRoomControls();
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
          done.set(x, c);
        }
        return c;
      });
      mesh.material = Array.isArray(mesh.material) ? mats : mats[0];
    });
    sharpen(m, gl);
    return m;
  }, [scene, gl]);

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
