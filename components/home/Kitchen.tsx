"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { KITCHEN } from "./config";
import { useKitchenLightControls, useRoomControls } from "./controls";

const KITCHEN_LIGHTS = [
  { position: [-2.0, 3.4, 15.2] as const, intensity: 70 },
  { position: [3.0, 3.4, 18.8] as const, intensity: 85 },
];

const KITCHEN_SHELL: { position: [number, number, number]; rotation: [number, number, number]; size: [number, number] }[] = [
  { position: [-0.2, 3, 21.4], rotation: [0, Math.PI, 0], size: [18, 6] }, // back: faces into the kitchen only (the authored camera stands behind it)
  { position: [-8.7, 3, 17.8], rotation: [0, Math.PI / 2, 0], size: [7.2, 6] }, // left
  { position: [-0.2, 6, 17.8], rotation: [Math.PI / 2, 0, 0], size: [18, 7.2] }, // ceiling
  // the stretch beside the way in, past the restaurant's left wall (z 12.1): its marble floor already runs on, but the wall and ceiling stop
  { position: [-0.2, 5.6, 13.15], rotation: [Math.PI / 2, 0, 0], size: [17.8, 2.4] }, // ceiling
  { position: [-6.85, 2.5, 13.15], rotation: [0, Math.PI / 2, 0], size: [2.4, 5.4] }, // left wall, like the restaurant's
  { position: [-7.8, 2.5, 14.3], rotation: [0, 0, 0], size: [1.9, 5.4] }, // closes the corner beside the doorway
  { position: [-7.6, -0.02, 13.15], rotation: [-Math.PI / 2, 0, 0], size: [2.2, 2.4] }, // the corner's floor, below the marble
];

const URL = "/models/kitchen_layer_new.glb";

/**
 * The kitchen, where it was built: on the restaurant's open side (see KITCHEN).
 * It always stands there; the camera goes over to it for its step and comes back.
 */
export function Kitchen() {
  const { scene } = useGLTF(URL);
  const room = useRoomControls();
  const kl = useKitchenLightControls();
  // two-sided: its walls are single planes, and from the restaurant's side they vanished (the way in showed black)
  const model = useMemo(() => {
    const m = scene.clone(true);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((x) => {
        const c = x.clone();
        c.side = THREE.DoubleSide;
        return c;
      });
      mesh.material = Array.isArray(mesh.material) ? mats : mats[0];
    });
    return m;
  }, [scene]);

  // the model is in its own frame: KITCHEN.origin / KITCHEN.turn put it in the room's, then the same placement as the room itself
  return (
    <group
      position={room.position}
      rotation={room.rotation.map((d) => THREE.MathUtils.degToRad(d)) as [number, number, number]}
      scale={room.scale}
    >
      {/* the kitchen's own lights: it is far from the room's, so the way in and the hold would be dark without them */}
      {KITCHEN_LIGHTS.map((l, i) => (
        <pointLight key={i} position={l.position} color={kl.kitchenColor} intensity={l.intensity * kl.kitchenIntensity} distance={11} decay={2} />
      ))}
      {/* the model has no walls behind or beside the way in (it was only ever filmed looking the other way): close the box */}
      {KITCHEN_SHELL.map((w, i) => (
        <mesh key={i} position={w.position} rotation={w.rotation}>
          <planeGeometry args={w.size} />
          <meshStandardMaterial color={i >= 3 ? "#26231f" : "#3a342d"} roughness={0.9} metalness={0.05} side={i === 0 ? THREE.FrontSide : THREE.DoubleSide} />
        </mesh>
      ))}
      <group position={KITCHEN.origin} rotation={[0, KITCHEN.turn, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(URL);
