"use client";

import { useGLTF } from "@react-three/drei";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { Spring, clamp, damp, easeInBack, easeInOutOvershoot, easeOutCubic, scrollState, smoothstep } from "@/lib/home/scroll";
import { createStudioEnv } from "@/lib/home/studio";
import { portraitness } from "./CameraRig";
import { CAMERA, KIOSK_URL, MEAL, ROBOT_URL, VENDING_URL, type RisingMachine } from "./config";

const setCursor = (c: string) => {
  document.body.style.cursor = c;
};

/**
 * Machines that rise into frame from below (the ordering kiosks, then the
 * vending machine — see config). Each comes up spinning round to face you,
 * overshooting and settling with a little squash, and its screen boots up once
 * it lands. While they stand they float and sway, lean toward the cursor, lift
 * on hover and spin on a click. Lit like the hero (its studio reflections plus
 * a key/rim pair that follows the centre one).
 *
 * `height`: on-screen height in metres; `facing`: turns the model's front to the lens;
 * `lit`: brings its own key/rim pair (off for pieces another set already lights);
 * `clips`: plays the model's own animation while hovered, finishing the cycle after;
 * `phoneFit`: how much smaller it gets on a tall phone (default: more for a row of several).
 */
export function RisingMachines({
  url,
  height,
  machines,
  facing = 0,
  lit = true,
  clips = false,
  phoneFit,
}: {
  url: string;
  height: number;
  machines: RisingMachine[];
  facing?: number;
  lit?: boolean;
  clips?: boolean;
  phoneFit?: number;
}) {
  const gltf = useGLTF(url);
  /** first / last scroll progress any of them can be in frame */
  const shownFrom = Math.min(...machines.map((k) => k.from));
  const shownTo = Math.max(...machines.map((k) => k.outTo));
  /** below the frame, even for the tallest */
  const hiddenY = -2.6 - height;
  const gl = useThree((s) => s.gl);

  const studio = useMemo(() => createStudioEnv(gl), [gl]);
  useEffect(() => () => studio.dispose(), [studio]);

  const rig = useMemo(() => {
    const src = gltf.scene;
    src.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(src);
    const size = box.getSize(new THREE.Vector3());
    const scale = height / size.y;
    const group = new THREE.Group();

    const kiosks = machines.map((k, i) => {
      const model = src.clone(true);
      // base-centre at the origin
      model.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
      const mats: THREE.MeshStandardMaterial[] = [];
      const screens: THREE.MeshStandardMaterial[] = [];
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mat = (m.material as THREE.MeshStandardMaterial).clone();
        mat.envMap = studio;
        // transparent pass (still opaque), like the hero: lands after the 3D copy
        mat.transparent = true;
        m.material = mat;
        if (mat.emissiveMap) {
          mat.userData.emissive = mat.emissiveIntensity;
          screens.push(mat);
        } else mats.push(mat);
      });
      const scaled = new THREE.Group();
      scaled.scale.setScalar(scale);
      scaled.add(model);
      const pivot = new THREE.Group(); // base-centre, everything turns / squashes around it
      pivot.add(scaled);
      group.add(pivot);
      // the model's own clips, scrubbed by hand (see the frame loop)
      const mixer = new THREE.AnimationMixer(model);
      const actions = clips
        ? gltf.animations.map((clip) => {
            const a = mixer.clipAction(clip);
            a.play();
            return { a, dur: clip.duration, t: 0 };
          })
        : [];
      return {
        mixer,
        actions,
        k,
        i,
        pivot,
        scaled,
        mats,
        screens,
        hover: false,
        hoverS: new Spring(),
        squash: new Spring(),
        hop: new Spring(),
        lean: new Spring(),
        spin: new Spring(),
        spinTo: 0,
        prevT: NaN,
      };
    });

    return { group, kiosks, scale, width: size.x * scale, depth: size.z * scale };
  }, [gltf, studio, height, machines, clips]);

  // a key from above-front and a cool rim from behind, always mounted (no recompiles)
  const lights = useMemo(() => {
    const key = new THREE.SpotLight("#fff1e0", 0, 14, 0.7, 0.9, 2);
    const rim = new THREE.SpotLight("#9fb6ff", 0, 12, 0.7, 0.9, 2);
    const group = new THREE.Group();
    group.add(key, key.target, rim, rim.target);
    return { group, key, rim };
  }, []);

  const tmp = useMemo(
    () => ({
      q: new THREE.Quaternion(),
      m: new THREE.Matrix4(),
      up: new THREE.Vector3(0, 1, 0),
      right: new THREE.Vector3(),
      camUp: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      c: new THREE.Vector3(),
      pointer: new THREE.Vector2(),
    }),
    [],
  );

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20);
    const p = scrollState.progress;
    const t = state.clock.elapsedTime;
    const motion = scrollState.reducedMotion ? 0 : 1;

    rig.group.visible = p > shownFrom && p < shownTo;
    if (!rig.group.visible) {
      lights.key.intensity = lights.rim.intensity = 0;
      return;
    }

    // the authored lens (not the cursor-orbiting real camera), like the hero
    const cam = state.camera as THREE.PerspectiveCamera;
    tmp.q.setFromRotationMatrix(tmp.m.lookAt(CAMERA.position, CAMERA.target, tmp.up));
    tmp.right.set(1, 0, 0).applyQuaternion(tmp.q);
    tmp.camUp.set(0, 1, 0).applyQuaternion(tmp.q);
    tmp.fwd.set(0, 0, -1).applyQuaternion(tmp.q);
    const kf = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) / Math.tan(THREE.MathUtils.degToRad(CAMERA.fov / 2));
    // phones: three across won't fit the narrow frame — smaller, closer together, the sides further forward
    const portrait = portraitness(state.size.width / state.size.height);
    const fit = 1 - (phoneFit ?? (machines.length > 1 ? 0.55 : 0.2)) * portrait;
    const spread = 1 - 0.63 * portrait;

    tmp.pointer.x = damp(tmp.pointer.x, scrollState.pointer.x, 3, delta);
    tmp.pointer.y = damp(tmp.pointer.y, scrollState.pointer.y, 3, delta);

    let presence = 0;
    tmp.c.set(0, 0, 0);
    for (const it of rig.kiosks) {
      const { k, pivot } = it;
      const rise = clamp((p - k.from) / (k.to - k.from));
      const out = clamp((p - k.outFrom) / (k.outTo - k.outFrom));
      const shown = rise > 0 && out < 1;
      pivot.visible = shown;
      presence = Math.max(presence, smoothstep(0, 0.4, rise) * (1 - smoothstep(0.6, 1, out)));
      if (!shown) {
        it.prevT = rise;
        continue;
      }

      // landing: once it settles (scrolling down), a squash, and the screen wakes
      if (it.prevT < 0.9 && rise >= 0.9) it.squash.kick(-3.2);
      it.prevT = rise;

      const up = easeInOutOvershoot(rise, 0.09);
      const down = easeInBack(out, 1.3);
      const side = Math.sign(k.x);
      const hover = it.hoverS.step(it.hover ? 1 : 0, delta, 120, 0.55);
      const hop = it.hop.step(0, delta, 60, 0.3);
      const squash = it.squash.step(0, delta, 220, 0.25);
      const spin = it.spin.step(it.spinTo, delta, 28, 0.62);
      // own clips: run while hovered; once let go, each finishes its cycle and rests at the start
      if (it.actions.length) {
        let moved = false;
        for (const c of it.actions) {
          if (!it.hover && c.t === 0) continue;
          c.t += delta;
          if (c.t >= c.dur) c.t = it.hover ? c.t - c.dur : 0;
          c.a.time = c.t;
          moved = true;
        }
        if (moved) it.mixer.update(0);
      }

      const float = (Math.sin(t * 1.1 + it.i * 2.1) * 0.03 + Math.sin(t * 0.47 + it.i) * 0.015) * motion * rise;
      // offset from where it stands: up from below the frame, back down at the end
      const lift = (hiddenY - k.y) * (1 - up + down) + float + hover * 0.07 + hop * 0.12;
      // phones step into the room (CameraRig): the sides come forward too, clear of the booths
      const d = k.d - (side !== 0 && machines.length > 1 ? 1.0 * portrait : 0);

      // the base stays on the floor whatever the lens; only the motion scales with it
      pivot.position
        .copy(CAMERA.position)
        .addScaledVector(tmp.right, (k.x * spread + tmp.pointer.x * 0.06) * kf)
        .addScaledVector(tmp.camUp, k.y + lift * kf)
        .addScaledVector(tmp.fwd, d);
      pivot.quaternion.copy(tmp.q);
      // rising: comes up turned away (the centre a half turn, the sides from outside) and tipped back
      const turnIn = (1 - easeOutCubic(rise)) * (side === 0 ? Math.PI : 1.6 * side);
      const sinkTurn = easeInBack(out, 1.3) * 0.6 * (side === 0 ? 1 : side);
      const lean = it.lean.step(-tmp.pointer.x * 0.05 + (1 - rise) * 0.1 * (side || 1), delta, 50, 0.45);
      pivot.rotateZ(lean + Math.sin(t * 0.6 + it.i) * 0.008 * motion);
      pivot.rotateX(-(1 - easeOutCubic(rise)) * 0.22 + tmp.pointer.y * 0.03 + hover * 0.04);
      pivot.rotateY(facing + k.yaw + turnIn + sinkTurn + spin + tmp.pointer.x * 0.18);

      const sy = Math.max(0.7, 1 + squash * 0.06);
      const s = kf * fit;
      pivot.scale.set(s / Math.sqrt(sy), s * sy, s / Math.sqrt(sy));

      // screen boots up as it lands, then breathes; dims as it leaves
      const on = smoothstep(0.75, 1, rise) * (1 - smoothstep(0, 0.5, out));
      const flicker = on < 1 && on > 0 ? 0.6 + 0.4 * Math.sin(t * 60 + it.i) : 1;
      for (const m of it.screens) m.emissiveIntensity = m.userData.emissive * on * flicker * (0.92 + 0.08 * Math.sin(t * 2 + it.i));
      for (const m of it.mats) m.envMapIntensity = 0.9;

      if (side === 0) tmp.c.copy(pivot.position);
    }

    // light rig on the centre kiosk, at mid-height
    tmp.c.addScaledVector(tmp.camUp, height * 0.55 * kf * fit);
    lights.key.position.copy(tmp.c).addScaledVector(tmp.right, -1.8).addScaledVector(tmp.camUp, 2.8).addScaledVector(tmp.fwd, -3.2);
    lights.key.target.position.copy(tmp.c);
    lights.key.intensity = 26 * presence;
    lights.rim.position.copy(tmp.c).addScaledVector(tmp.right, 2.2).addScaledVector(tmp.camUp, 2.0).addScaledVector(tmp.fwd, 2.6);
    lights.rim.target.position.copy(tmp.c);
    lights.rim.intensity = 30 * presence;
  });

  const events = (it: (typeof rig.kiosks)[number]) => ({
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      it.hover = true;
      setCursor("pointer");
    },
    onPointerOut: () => {
      it.hover = false;
      setCursor("");
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      // a full turn and a hop
      it.spinTo += Math.PI * 2 * (Math.random() < 0.5 ? -1 : 1);
      it.hop.kick(2.4);
      it.squash.kick(-3);
    },
  });

  return (
    <>
      {lit && <primitive object={lights.group} />}
      <primitive object={rig.group}>
        {rig.kiosks.map((it) => (
          <primitive key={it.i} object={it.pivot}>
            {/* invisible hit box, cheap to raycast (pivot space is model space × kf·fit) */}
            <mesh position={[0, height / 2, 0]} {...events(it)}>
              <boxGeometry args={[rig.width, height, rig.depth]} />
              <meshBasicMaterial visible={false} />
            </mesh>
          </primitive>
        ))}
      </primitive>
    </>
  );
}

useGLTF.preload(KIOSK_URL);
useGLTF.preload(VENDING_URL);
useGLTF.preload(ROBOT_URL);
for (const m of MEAL.items) useGLTF.preload(m.url);
