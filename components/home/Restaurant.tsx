"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { LOGO } from "./config";
import { useLogoControls, useRoomControls } from "./controls";

const URL = "/models/interior_environment2.glb";

/** the neon CFOCO logo on the back wall: its group, and its letters (white), comb (red), beak / ring (yellow) */
const LOGO_NODE = "Empty005"; // "Empty.005" — the loader strips the dots
const LOGO_PARTS = { "Material.014": "letters", "Material.015": "comb", "Material.016": "beak" } as const;
type Part = (typeof LOGO_PARTS)[keyof typeof LOGO_PARTS];
/** where the outro camera aims, as authored (the logo panel moves it) */
const LOGO_CENTER = LOGO.center.clone();

/** The room, as authored. Only the camera/helper nodes are dropped; the neon logo is tunable (Logo panel). */
export function Restaurant() {
  const { scene } = useGLTF(URL);
  const room = useRoomControls();
  const logoC = useLogoControls();

  const { model, logo, parts } = useMemo(() => {
    const model = scene.clone(true);
    // own copies of the logo's materials (the cached GLTF stays as authored), with their authored glow
    const parts = new Map<string, { part: Part; mat: THREE.MeshStandardMaterial; glow: number; base: number }>();
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.map) mat.map.anisotropy = 4;
      const part = LOGO_PARTS[mat.name as keyof typeof LOGO_PARTS];
      if (part) {
        let e = parts.get(mat.name);
        if (!e) {
          // base colour as a share of the glow colour, so a new colour keeps the authored look
          const base = mat.color.r / Math.max(mat.emissive.r, 1e-3);
          parts.set(mat.name, (e = { part, mat: mat.clone(), glow: mat.emissiveIntensity, base }));
        }
        mesh.material = e.mat;
      }
    });
    const node = model.getObjectByName(LOGO_NODE);
    const logo = node && {
      node,
      position: node.position.clone(),
      quaternion: node.quaternion.clone(),
      scale: node.scale.clone(),
    };
    return { model, logo, parts };
  }, [scene]);

  useEffect(() => {
    const colour = { letters: logoC.letters, comb: logoC.comb, beak: logoC.beak };
    const glow = { letters: logoC.lettersGlow, comb: logoC.combGlow, beak: logoC.beakGlow };
    for (const { part, mat, glow: authored, base } of parts.values()) {
      mat.emissive.set(colour[part]);
      mat.color.set(colour[part]).multiplyScalar(base);
      mat.emissiveIntensity = authored * logoC.glow * glow[part];
    }
    if (logo) {
      const [px, py, pz] = logoC.position;
      const r = logoC.rotation.map((d) => THREE.MathUtils.degToRad(d)) as [number, number, number];
      logo.node.visible = logoC.visible;
      logo.node.position.copy(logo.position).add(new THREE.Vector3(px, py, pz));
      logo.node.quaternion.copy(logo.quaternion).premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)));
      logo.node.scale.copy(logo.scale).multiplyScalar(logoC.scale);
      // the outro flies to wherever the logo now is
      LOGO.center.copy(LOGO_CENTER).add(new THREE.Vector3(px, py, pz));
    }
  }, [parts, logo, logoC]);

  return (
    <group
      position={room.position}
      rotation={room.rotation.map((d) => THREE.MathUtils.degToRad(d)) as [number, number, number]}
      scale={room.scale}
    >
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(URL);
