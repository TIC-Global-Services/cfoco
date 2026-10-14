"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo } from "react";
import { damp, scrollState, smoothstep } from "@/lib/home/scroll";
import { CAMERA, KITCHEN, LOGO, ZOOM_FROM, ZOOM_TO } from "./config";
import { INTRO_FLIGHT } from "./Loader";
import { useCameraControls, useInteractionControls } from "./controls";

/** distance in front of the lens the cursor orbit pivots around (≈ the hero) */
const PIVOT = 4.1;

const REF_ASPECT = 1440 / 912; // Figma frame

/** 0 on landscape screens (Figma frame and wider) → 1 on a tall phone (≈ 9:19.5) */
export function portraitness(aspect: number) {
  return THREE.MathUtils.clamp((REF_ASPECT / aspect - 1) / (REF_ASPECT / 0.46 - 1), 0, 1);
}

/** Portrait screens: widen the vertical fov a little so more of the room's width stays in. */
export function fovForAspect(aspect: number) {
  if (aspect >= REF_ASPECT) return CAMERA.fov;
  const h = Math.tan(THREE.MathUtils.degToRad(CAMERA.fov / 2)) * (REF_ASPECT / aspect) ** 0.45;
  return THREE.MathUtils.radToDeg(2 * Math.atan(h));
}

/**
 * …and step into the room: the authored lens stands ~4 m outside its front
 * edge, so a taller view would look down past the end of the floor. Metres.
 */
const PORTRAIT_DOLLY = 2.1;

/**
 * The camera is locked to one view of the restaurant for the whole page.
 * Scroll only moves the objects in front of it (see HeroChicken). The cursor
 * nudges it on a small orbit around the hero, so the room swings behind the
 * subject and the scene reads as real depth.
 *
 * The exceptions are the bookends: the page opens with the camera at the neon
 * logo on the back wall, gliding back to its spot once the loader opens, and
 * past the last section it travels back down the room into it (see LOGO).
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useCameraControls();
  const ix = useInteractionControls();
  const tmp = useMemo(
    () => ({
      p: new THREE.Vector2(),
      fwd: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      pivot: new THREE.Vector3(),
      end: new THREE.Vector3(),
      aim: new THREE.Vector3(),
      eye: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, delta) => {
    // dev panel writes into the shared CAMERA pose (HeroChicken solves against it)
    CAMERA.position.fromArray(controls.position);
    CAMERA.position.z -= PORTRAIT_DOLLY * portraitness(state.size.width / state.size.height);
    CAMERA.target.fromArray(controls.target);
    CAMERA.fov = controls.fov;
    if (scrollState.debug) return;
    const amount = scrollState.reducedMotion || !scrollState.hasPointer ? 0 : ix.cameraParallax;
    tmp.p.x = damp(tmp.p.x, scrollState.pointer.x * amount, 2.2, delta);
    tmp.p.y = damp(tmp.p.y, scrollState.pointer.y * amount, 2.2, delta);
    tmp.fwd.subVectors(CAMERA.target, CAMERA.position).normalize();
    tmp.right.crossVectors(tmp.fwd, camera.up).normalize();
    tmp.up.crossVectors(tmp.right, tmp.fwd);
    tmp.pivot.copy(CAMERA.position).addScaledVector(tmp.fwd, PIVOT);
    camera.position.copy(CAMERA.position).addScaledVector(tmp.right, tmp.p.x).addScaledVector(tmp.up, tmp.p.y * 0.5);

    // kitchen: over to the view into the kitchen, then return (see KITCHEN)
    const p = scrollState.progress;
    const kOut = smoothstep(KITCHEN.outFrom, KITCHEN.outTo, p) * (1 - smoothstep(KITCHEN.backFrom, KITCHEN.backTo, p));
    const kk = kOut * kOut * kOut * (kOut * (kOut * 6 - 15) + 10);
    const portrait = portraitness(state.size.width / state.size.height);
    if (kk > 0) {
      // phones: a touch higher (the floor ends just behind, so no further back)
      tmp.eye.copy(KITCHEN.eye).add(tmp.aim.set(0, 0.4 * portrait, 0));
      tmp.eye.addScaledVector(tmp.right, tmp.p.x * 1.5).addScaledVector(tmp.up, tmp.p.y * 0.75);
      camera.position.lerp(tmp.eye, kk);
      tmp.pivot.lerp(KITCHEN.target, kk);
    }

    // outro: glide (slow out, slow in) down the room to stand square in front of the logo
    const z = smoothstep(ZOOM_FROM, ZOOM_TO, p);
    // opening: parked at the logo while loading, then the flight back (slow out, slow in)
    const f = THREE.MathUtils.clamp((performance.now() / 1000 - scrollState.introFlightAt) / INTRO_FLIGHT, 0, 1);
    const intro = 1 - f * f * f * (f * (f * 6 - 15) + 10);
    if (z > 0 || intro > 0) {
      const k = Math.max(z * z * z * (z * (z * 6 - 15) + 10), intro); // smootherstep on top: no jolt at either end
      // phones stand further back so the whole word fits the narrow frame
      const dist = LOGO.distance * (1 + 1.1 * portraitness(state.size.width / state.size.height));
      tmp.end.copy(LOGO.center).add(tmp.fwd.set(0, 0, dist));
      // the cursor still sways the view a little at the logo
      tmp.end.addScaledVector(tmp.right, tmp.p.x * 0.6).addScaledVector(tmp.up, tmp.p.y * 0.3);
      tmp.aim.copy(LOGO.center).y -= LOGO.aimBelow;
      camera.position.lerp(tmp.end, k);
      tmp.pivot.lerp(tmp.aim, k);
    }
    camera.lookAt(tmp.pivot);
    const fov = fovForAspect(state.size.width / state.size.height) + (KITCHEN.fov - CAMERA.fov) * kk * (1 - portrait);
    if (Math.abs(camera.fov - fov) > 1e-3) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, -1); // before HeroChicken reads the camera pose

  return scrollState.debug ? <DebugControls /> : null;
}

/** ?debug — orbit freely and log the pose so CAMERA can be updated. */
function DebugControls() {
  return (
    <OrbitControls
      makeDefault
      onEnd={(e) => {
        const c = e?.target as unknown as { object: THREE.Camera; target: THREE.Vector3 } | undefined;
        if (!c) return;
        const f = (v: THREE.Vector3) => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
        console.log(`position: new THREE.Vector3${f(c.object.position)}, target: new THREE.Vector3${f(c.target)}`);
      }}
    />
  );
}
