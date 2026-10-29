"use client";

import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { sharpen } from "@/lib/home/textures";
import { EXPORT_NAMES, LOGO } from "./config";
import { useLogoControls, useRoomControls } from "./controls";

const URL = "/models/interior_environment_new.glb";

/**
 * This cut is authored turned 180° and moved off the origin: this puts it back in the room's frame,
 * which the camera, the logo, the kitchen and every placement in config.ts are in.
 */
const MODEL_TURN = Math.PI;
const MODEL_OFFSET = new THREE.Vector3(7.913, 0, 12.174);

/** the neon CFOCO logo on the back wall: its group, and its letters (white), comb (red), beak / ring (yellow) */
const LOGO_NODE = "Empty005"; // "Empty.005" — the loader strips the dots
/** the logo's curves: in this cut they sit beside LOGO_NODE instead of under it, so they are put back under it */
const LOGO_CURVES = /^Curve0(1[4-9]|2[0-6])$/; // "Curve.014" … "Curve.026"
const LOGO_PARTS = { "Material.031": "letters", "Material.032": "comb", "Material.033": "beak" } as const;
type Part = (typeof LOGO_PARTS)[keyof typeof LOGO_PARTS];
/** where the outro camera aims, as authored (the logo panel moves it) */
const LOGO_CENTER = LOGO.center.clone();

/** The room, as authored. Only the camera/helper nodes are dropped; the neon logo is tunable (Logo panel). */
export function Restaurant() {
  const { scene } = useGLTF(URL);
  const gl = useThree((s) => s.gl);
  const room = useRoomControls();
  const logoC = useLogoControls();

  const { model, logo, parts } = useMemo(() => {
    const model = scene.clone(true);
    model.rotation.y = MODEL_TURN;
    model.position.copy(MODEL_OFFSET);
    model.updateMatrixWorld(true);
    // own copies of the logo's materials (the cached GLTF stays as authored), with their authored glow
    const parts = new Map<string, { part: Part; mat: THREE.MeshStandardMaterial; glow: number; base: number }>();
    const baked = new Map<THREE.Material, THREE.MeshBasicMaterial>();
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      // real transmission re-renders the whole scene every frame for one thin glass strip: plain see-through glass instead
      if ((mat as THREE.MeshPhysicalMaterial).transmission > 0) {
        mesh.material = new THREE.MeshStandardMaterial({
          name: mat.name,
          color: mat.color,
          roughness: mat.roughness,
          metalness: 0,
          transparent: true,
          opacity: 0.25,
          depthWrite: false,
          side: mat.side,
        });
        return;
      }
      const part = LOGO_PARTS[mat.name as keyof typeof LOGO_PARTS];
      if (part) {
        let e = parts.get(mat.name);
        if (!e) {
          // base colour as a share of the glow colour, so a new colour keeps the authored look
          const base = mat.color.r / Math.max(mat.emissive.r, 1e-3);
          parts.set(mat.name, (e = { part, mat: mat.clone(), glow: mat.emissiveIntensity, base }));
        }
        mesh.material = e.mat;
        return;
      }
      // its lighting is baked into the textures: shown as baked, unlit (the neon and the moons keep their own glow)
      if (mat.map && !mat.emissiveMap) {
        let b = baked.get(mat);
        if (!b) {
          b = new THREE.MeshBasicMaterial({
            name: mat.name,
            map: mat.map,
            color: mat.color,
            transparent: mat.transparent,
            opacity: mat.opacity,
            alphaTest: mat.alphaTest,
            side: mat.side,
          });
          baked.set(mat, b);
        }
        mesh.material = b;
      }
    });
    sharpen(model, gl);
    const node = model.getObjectByName(LOGO_NODE);
    if (node) {
      const curves: THREE.Object3D[] = [];
      model.traverse((o) => LOGO_CURVES.test(o.name) && o.parent !== node && curves.push(o));
      for (const c of curves) node.attach(c); // keeps where they are
    }
    const logo = node && {
      node,
      position: node.position.clone(),
      quaternion: node.quaternion.clone(),
      scale: node.scale.clone(),
    };
    return { model, logo, parts };
  }, [scene, gl]);

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
      name={EXPORT_NAMES.restaurant}
      position={room.position}
      rotation={room.rotation.map((d) => THREE.MathUtils.degToRad(d)) as [number, number, number]}
      scale={room.scale}
    >
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(URL);
