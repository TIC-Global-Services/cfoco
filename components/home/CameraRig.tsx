"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo } from "react";
import { damp, robotRide, scrollState, smoothstep } from "@/lib/home/scroll";
import { CAMERA, KITCHEN, LOGO, ROBOT_RUN, WALL, ZOOM_FROM, ZOOM_TO } from "./config";
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
      base: new THREE.Vector3(),
      pivotBase: new THREE.Vector3(),
      eyeR: new THREE.Vector3(),
      eyeK: new THREE.Vector3(),
      // from the wall into the kitchen the camera goes through the doorway, not across the counters
      inPath: new THREE.CatmullRomCurve3(
        [new THREE.Vector3(), new THREE.Vector3(-1.2, 1.9, 9.5), new THREE.Vector3(-1.2, 1.9, 13.2), new THREE.Vector3(-0.6, 1.95, 15.4), new THREE.Vector3()],
        false,
        "centripetal",
      ),
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

    const p = scrollState.progress;
    // ordering wall: once the chicken is in the bucket, swing over to the left wall's kiosks, then return (see WALL)
    // …then across the room to the vending machine on the right (see VEND_VIEW), then straight on to the kitchen and
    // back from there (see KITCHEN). The views cross-fade: their weights add up to 1 while it moves between two of them
    const toKitchen = smoothstep(KITCHEN.outFrom, KITCHEN.outTo, p);
    const wOut = smoothstep(WALL.panFrom, WALL.panTo, p) * (1 - toKitchen);
    const wk = wOut * wOut * wOut * (wOut * (wOut * 6 - 15) + 10);
    const kk = toKitchen * toKitchen * toKitchen * (toKitchen * (toKitchen * 6 - 15) + 10); // stays 1 until the outro takes over
    const portrait = portraitness(state.size.width / state.size.height);
    if (wk > 0 || kk > 0) {
      tmp.base.copy(camera.position);
      tmp.pivotBase.copy(tmp.pivot);
      const sway = (v: THREE.Vector3, k: number) => v.addScaledVector(tmp.up, tmp.p.y * 0.25 * k).addScaledVector(tmp.right, tmp.p.x * 0.5 * k);
      // the kitchen view sways more; phones: a touch higher (the floor ends just behind, so no further back)
      tmp.eyeK.copy(KITCHEN.eye).add(tmp.aim.set(0, 0.4 * portrait, 0));
      tmp.eyeK.addScaledVector(tmp.right, tmp.p.x * 1.5).addScaledVector(tmp.up, tmp.p.y * 0.75);
      camera.position
        .addScaledVector(sway(tmp.eye.copy(WALL.eye), 1).sub(tmp.base), wk)
        .addScaledVector(tmp.eyeK.sub(tmp.base), kk);
      tmp.pivot
        .addScaledVector(tmp.aim.copy(WALL.target).sub(tmp.pivotBase), wk)
        .addScaledVector(tmp.aim.copy(KITCHEN.target).sub(tmp.pivotBase), kk);
      if (toKitchen > 0 && toKitchen < 1) {
        const pts = tmp.inPath.points;
        pts[0].copy(WALL.eye);
        pts[4].copy(tmp.eyeK.copy(KITCHEN.eye));
        camera.position.copy(tmp.inPath.getPoint(kk));
      }
      if (robotRide.ready) {
        // the robot has reached the doorway: zoom in on it, wherever it is
        const zk = smoothstep(KITCHEN.zoomFrom, KITCHEN.zoomTo, p) * kk;
        if (zk > 0) {
          tmp.aim.set(robotRide.tray.x, 0, robotRide.tray.z);
          camera.position.lerp(tmp.eyeR.copy(tmp.aim).add(KITCHEN.zoomEye), zk);
          tmp.pivot.lerp(tmp.aim.add(KITCHEN.zoomAim), zk);
        }
        // …then it turns and drives out down the room, slowly: the camera trails behind it
        const R = ROBOT_RUN;
        const ck = smoothstep(R.leadFrom, R.leadFrom + 0.8, p);
        if (ck > 0) {
          // behind it along its heading, mostly straight down the room (-z): its last turn toward the side doesn't swing the view
          tmp.aim.set(0, 0, 1).applyQuaternion(robotRide.quaternion).multiplyScalar(0.4).z -= 0.6;
          tmp.aim.normalize();
          tmp.eyeR.set(robotRide.tray.x - tmp.aim.x * R.followBack, R.followHeight, robotRide.tray.z - tmp.aim.z * R.followBack);
          camera.position.lerp(tmp.eyeR, ck);
          tmp.pivot.lerp(tmp.aim.set(robotRide.tray.x, 1.0, robotRide.tray.z), ck);
        }
      }
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
    const fov =
      fovForAspect(state.size.width / state.size.height) +
      ((KITCHEN.fov - CAMERA.fov) * kk * (1 - z) + (WALL.fov - CAMERA.fov) * wk) * (1 - portrait);
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
